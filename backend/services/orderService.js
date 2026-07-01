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
exports.cancelOrder = async (orderId) => {
    try {
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        // Only restore stock if order status was not already cancelled
        if (order.status !== 'Cancelled') {
            await productService.restoreProductStock(order.products);
            order.status = 'Cancelled';
            await order.save();
        }

        return order;
    } catch (error) {
        throw error;
    }
};
