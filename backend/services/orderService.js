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
                await processRefund(order, order.totalAmount);
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
