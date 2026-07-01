// Architect: SP
const mongoose = require('mongoose');
const { Order, Product, ReturnRequest } = require('../../models');

// Verify order by ID/Number and email, and return list of products
const verifyOrderForReturn = async (req, res) => {
    try {
        const { orderId, email } = req.query;

        if (!orderId || !email) {
            return res.status(400).json({
                success: false,
                message: 'Order ID and Email are required'
            });
        }

        // Find the order by ID or orderNumber
        const query = {};
        if (mongoose.Types.ObjectId.isValid(orderId)) {
            query.$or = [{ _id: orderId }, { orderNumber: orderId }];
        } else {
            query.orderNumber = orderId;
        }

        const order = await Order.findOne(query).populate('user').populate('products.product');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Verify email
        if (!order.user || order.user.email.toLowerCase() !== email.toLowerCase()) {
            return res.status(400).json({
                success: false,
                message: 'Email address does not match this order'
            });
        }

        // Check if order status is Delivered
        if (order.orderStatus.toLowerCase() !== 'delivered') {
            return res.status(400).json({
                success: false,
                message: 'Only delivered orders can be returned'
            });
        }

        // Check if order was delivered within 72 hours
        if (order.deliveryDate) {
            const deliveryTime = new Date(order.deliveryDate).getTime();
            const currentTime = new Date().getTime();
            const hoursDiff = (currentTime - deliveryTime) / (1000 * 60 * 60);
            if (hoursDiff > 72) {
                return res.status(400).json({
                    success: false,
                    message: 'The return period for this order has expired (72 hours after delivery limit)'
                });
            }
        }

        // Format and return products in the order
        const productsList = order.products.map(item => ({
            id: item.product._id,
            name: item.product.name,
            price: item.price,
            quantity: item.quantity,
            store: item.product.store,
            image_url: item.product.image_url,
            images: item.product.images
        }));

        // Fetch existing return requests for this order
        const returnRequests = await ReturnRequest.find({ order: order._id });

        res.json({
            success: true,
            orderId: order._id,
            orderNumber: order.orderNumber,
            products: productsList,
            returnRequests: returnRequests
        });

    } catch (error) {
        console.error('Verify order for return error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error verifying order'
        });
    }
};

// Create a new return request
const createReturnRequest = async (req, res) => {
    try {
        const { orderId, email, productId, reason, details } = req.body;

        if (!orderId || !email || !productId || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Order ID, Email, Product, and Reason are required'
            });
        }

        if (reason === 'other' && (!details || !details.trim())) {
            return res.status(400).json({
                success: false,
                message: 'Additional details are required when selecting Other Reason'
            });
        }

        // Find the order by ID or orderNumber
        const query = {};
        if (mongoose.Types.ObjectId.isValid(orderId)) {
            query.$or = [{ _id: orderId }, { orderNumber: orderId }];
        } else {
            query.orderNumber = orderId;
        }

        const order = await Order.findOne(query).populate('user');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Verify email matches
        if (!order.user || order.user.email.toLowerCase() !== email.toLowerCase()) {
            return res.status(400).json({
                success: false,
                message: 'Email address does not match this order'
            });
        }

        // Check if order status is Delivered
        if (order.orderStatus.toLowerCase() !== 'delivered') {
            return res.status(400).json({
                success: false,
                message: 'Only delivered orders can be returned'
            });
        }

        // Check if order was delivered within 72 hours
        if (order.deliveryDate) {
            const deliveryTime = new Date(order.deliveryDate).getTime();
            const currentTime = new Date().getTime();
            const hoursDiff = (currentTime - deliveryTime) / (1000 * 60 * 60);
            if (hoursDiff > 72) {
                return res.status(400).json({
                    success: false,
                    message: 'The return period for this order has expired (72 hours after delivery limit)'
                });
            }
        }

        // Check if product exists in this order
        const hasProduct = order.products.some(p => p.product.toString() === productId);
        if (!hasProduct) {
            return res.status(400).json({
                success: false,
                message: 'Selected product is not part of this order'
            });
        }

        // Check if return request already exists for this order & product
        const existingRequest = await ReturnRequest.findOne({
            order: order._id,
            product: productId
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: 'A return request has already been submitted for this product'
            });
        }

        // Get product to read store field
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Create the return request
        const returnRequest = new ReturnRequest({
          order: order._id,
          orderNumber: order.orderNumber,
          email: email,
          product: productId,
          reason: reason,
          details: reason === 'other' ? details : undefined,
          store: product.store,
          status: 'Pending'
        });

        await returnRequest.save();

        res.status(201).json({
            success: true,
            message: 'Return request submitted successfully',
            data: returnRequest
        });

    } catch (error) {
        console.error('Create return request error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error submitting return request'
        });
    }
};

module.exports = {
    verifyOrderForReturn,
    createReturnRequest
};
