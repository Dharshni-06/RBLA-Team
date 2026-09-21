// Architect: SP
const { Order } = require('../models');
const productService = require('./productService');

/**
 * Create a new order with stock validation
 */
exports.createOrder = async (orderData) => {
    try {
        // 1. Validate stock for all products
        await productService.validateStockForOrder(orderData.products);
        
        // 2. Create the order
        const order = new Order(orderData);
        await order.save();
        
        // 3. Update stock quantities
        await this.handleStockUpdate(orderData.products);
        
        return order;
    } catch (error) {
        // If order creation fails, ensure no stock was deducted
        if (error.message !== 'Insufficient stock') {
            await this.rollbackStockUpdate(orderData.products);
        }
        throw error;
    }
};

/**
 * Update stock quantities for ordered products
 */
exports.handleStockUpdate = async (orderItems) => {
    try {
        await Promise.all(
            orderItems.map(async (item) => {
                await productService.updateProductStock(item.product, item.quantity);
            })
        );
    } catch (error) {
        throw error;
    }
};

/**
 * Restore stock quantities if order fails
 */
exports.rollbackStockUpdate = async (orderItems) => {
    try {
        await productService.restoreProductStock(orderItems);
    } catch (error) {
        console.error('Error rolling back stock update:', error);
        // Log this error but don't throw, as this is part of error handling
    }
};

/**
 * Cancel an order and restore stock
 */
exports.cancelOrder = async (orderId, reason) => {
    try {
        const order = await Order.findById(orderId).populate('user').populate('products.product');
        if (!order) {
            throw new Error('Order not found');
        }

        // Only restore stock if order status was not already canceled
        if (order.orderStatus !== 'Canceled' && order.orderStatus !== 'Cancelled') {
            await productService.restoreProductStock(order.products);
            order.orderStatus = 'Canceled';
            if (reason) {
                order.cancelReason = reason;
            }
            // Trigger refund if paid
            if (['Paid', 'Completed', 'settled'].includes(order.paymentStatus)) {
                const { processRefund } = require('../utils/refundHelper');
                const refundAmount = order.totalAmount !== undefined ? order.totalAmount : (order.totalPrice || 0);
                await processRefund(order, refundAmount);
            } else if (order.paymentStatus === 'COD' || order.paymentStatus === 'Pending') {
                // COD/unpaid cancellations
                order.paymentStatus = 'Unpaid';

                const BraintreePayment = require('../models/user/BraintreePayment');
                const Payment = require('../models/Payment');

                await Payment.updateMany(
                    { orderId: order._id },
                    { $set: { paymentStatus: 'Failed' } }
                );

                await BraintreePayment.updateMany(
                    { order: order._id },
                    { $set: { status: 'voided' } }
                );
                await order.save();
            } else {
                await order.save();
            }

            const refundAmount = order.totalAmount !== undefined ? order.totalAmount : (order.totalPrice || 0);

            // Send order cancellation email asynchronously to customer
            const { getOrderCustomerEmail } = require('../utils/orderHelper');
            const customerEmail = await getOrderCustomerEmail(order);
            console.log(`cancelOrder: Resolved customer email: ${customerEmail}`);
            if (customerEmail) {
                const { sendOrderCancellationEmail } = require('../utils/email');
                sendOrderCancellationEmail(customerEmail, order, reason).catch(err => {
                    console.error('Failed to send user cancellation email:', err);
                });
            }

            // Make Admin and Superadmin aware of cancellation and refund
            try {
                const Admin = require('../models/admin');
                const { 
                    sendAdminOrderCancellationEmail, 
                    sendSuperAdminOrderCancellationEmail 
                } = require('../utils/email');

                // Collect all unique store names in the order
                const storeNames = [...new Set(
                    (order.products || [])
                        .map(p => p.product && p.product.store)
                        .filter(Boolean)
                )];

                console.log(`cancelOrder: Notifying admins for stores: ${storeNames.join(', ')}`);

                // Notify each store's admin
                for (const sName of storeNames) {
                    const storeAdmin = await Admin.findOne({ 
                        storeName: { $regex: new RegExp(`^${sName.trim()}$`, 'i') } 
                    });
                    if (storeAdmin && storeAdmin.email) {
                        sendAdminOrderCancellationEmail(storeAdmin.email, order, refundAmount, sName, reason).catch(err => {
                            console.error(`Failed to send store admin cancellation email for ${sName}:`, err);
                        });
                    }
                }

                // Notify Superadmin
                const superAdminEmail = process.env.SUPERADMIN_EMAIL || process.env.EMAIL_ADDRESS;
                if (superAdminEmail) {
                    sendSuperAdminOrderCancellationEmail(superAdminEmail, order, refundAmount, storeNames, reason).catch(err => {
                        console.error('Failed to send superadmin cancellation email:', err);
                    });
                }
            } catch (notifyErr) {
                console.error('Error sending admin/superadmin cancellation alerts:', notifyErr);
            }
        }

        return order;
    } catch (error) {
        throw error;
    }
};

/**
 * Approve a return request, restore stock, and process a partial refund
 */
exports.approveReturnRequest = async (returnRequest) => {
    try {
        const Product = require('../models/Product');
        const Payment = require('../models/Payment');
        const BraintreePayment = require('../models/user/BraintreePayment');
        const User = require('../models/user/User');
        const { sendReturnApprovalEmail } = require('../utils/email');
        const Razorpay = require('razorpay');

        const order = await Order.findById(returnRequest.order);
        if (!order) {
            throw new Error('Order not found');
        }

        const product = await Product.findById(returnRequest.product);
        if (!product) {
            throw new Error('Product not found');
        }

        // Find the product item in the order to get the refund amount and quantity
        const item = order.products.find(p => p.product.toString() === returnRequest.product.toString());
        if (!item) {
            throw new Error('Product not found in this order');
        }

        const refundAmount = item.price * item.quantity;

        // 1. Restore stock
        product.stock += item.quantity;
        await product.save();

        // 2. Process refund if the order has been paid
        if (['Paid', 'Completed', 'settled'].includes(order.paymentStatus)) {
            console.log(`Initiating partial refund for returned product: ${product.name}, Amount: ₹${refundAmount}`);

            if (order.paymentMethod === 'Razorpay' && order.razorpay_order_id && order.razorpay_order_id !== 'COD') {
                try {
                    const paymentRecord = await Payment.findOne({ orderId: order._id });
                    if (paymentRecord && paymentRecord.transactionId && !paymentRecord.transactionId.startsWith('pay_mock_')) {
                        const razorpayInstance = new Razorpay({
                            key_id: process.env.RAZORPAY_KEY_ID,
                            key_secret: process.env.RAZORPAY_SECRET
                        });

                        if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'rzp_test_defaultKeyId') {
                            await razorpayInstance.refunds.create({
                                payment_id: paymentRecord.transactionId,
                                amount: Math.round(refundAmount * 100), // in paise
                                notes: {
                                    reason: `Return request approved for: ${product.name}`,
                                    orderNumber: order.orderNumber
                                }
                            });
                            console.log('Razorpay return refund successful');
                        }
                    }
                } catch (err) {
                    console.warn('Razorpay return refund failed. Using mock refund.', err.message);
                }
            }

            // Update associated Payment document status
            const paymentRecord = await Payment.findOneAndUpdate(
                { orderId: order._id },
                { $set: { paymentStatus: 'Refunded' } },
                { new: true }
            );

            // Update associated BraintreePayment document status
            await BraintreePayment.updateMany(
                { order: order._id },
                { $set: { status: 'voided' } }
            );

            // Change order paymentStatus to Refunded
            order.paymentStatus = 'Refunded';
            await order.save();

            // Send Email notification to registered customer
            const { getOrderCustomerEmail } = require('../utils/orderHelper');
            const customerEmail = await getOrderCustomerEmail(order);
            if (customerEmail) {
                try {
                    await sendReturnApprovalEmail(customerEmail, order, product, refundAmount);
                    const { sendRefundEmail } = require('../utils/email');
                    await sendRefundEmail(customerEmail, order, refundAmount, 'RET-REF-' + Date.now());
                    console.log(`Return approval and refund confirmation emails sent to ${customerEmail}`);
                } catch (mailErr) {
                    console.error('Error sending return refund email:', mailErr);
                }
            }
        } else if (order.paymentStatus === 'COD' || order.paymentStatus === 'Pending') {
            // For unpaid COD order returns, simply void the payment record and mark order paymentStatus as Unpaid
            order.paymentStatus = 'Unpaid';
            await order.save();

            await Payment.updateMany(
                { orderId: order._id },
                { $set: { paymentStatus: 'Failed' } }
            );

            await BraintreePayment.updateMany(
                { order: order._id },
                { $set: { status: 'voided' } }
            );
        }

        return true;
    } catch (error) {
        console.error('Error in approveReturnRequest service:', error);
        throw error;
    }
};
