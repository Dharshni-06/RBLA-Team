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
            if (order.paymentStatus === 'Paid') {
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

            // Send order cancellation email asynchronously
            console.log(`cancelOrder: Checking email trigger. user: ${!!order.user}, email: ${order.user?.email}`);
            if (order.user && order.user.email) {
                console.log(`cancelOrder: Triggering cancellation email to ${order.user.email}`);
                const { sendOrderCancellationEmail } = require('../utils/email');
                sendOrderCancellationEmail(order.user.email, order, reason).catch(err => {
                    console.error('Failed to send user cancellation email:', err);
                });
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
        if (order.paymentStatus === 'Paid') {
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

            // Send Email notification
            const user = await User.findById(order.user || order.userid);
            if (user && user.email) {
                await sendReturnApprovalEmail(user.email, order, product, refundAmount);
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
