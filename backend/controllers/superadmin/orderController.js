// Architect: SP
const Order = require('../../models/user/Order');
const mongoose = require('mongoose');

// Get all orders with filtering
exports.getAllOrders = async (req, res) => {
    try {
        const { status, fromDate, toDate } = req.query;
        let query = {};

        // Apply filters
        if (status) {
            query.orderStatus = status; 
        }
        if (fromDate || toDate) {
            query.orderDate = {}; 
            if (fromDate) query.orderDate.$gte = new Date(fromDate);
            if (toDate) query.orderDate.$lte = new Date(toDate);
        }

        const orders = await Order.find(query)
            .populate('user', 'name email') 
            .populate('products.product', 'name price') 
            .sort({ orderDate: -1 }); 

        res.json(orders);
    } catch (error) {
        console.error('Error in getAllOrders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get single order by ID
exports.getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ error: 'Invalid order ID' });
        }

        const order = await Order.findById(orderId)
            .populate('user', 'name email')
            .populate('products.product', 'name price');

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error in getOrderById:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ error: 'Invalid order ID' });
        }

        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled']; 
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const order = await Order.findById(orderId).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        order.orderStatus = status;

        if (status === 'Delivered') {
            order.deliveryDate = new Date();
        }

        // If order is COD and delivered, mark as Paid
        if (status === 'Delivered' && order.paymentStatus === 'COD') {
            order.paymentStatus = 'Paid';
            
            // Settle the payment record in the ledger
            const BraintreePayment = require('../../models/user/BraintreePayment');
            const payment = await BraintreePayment.findOne({ order: order._id });
            if (payment) {
                payment.status = 'settled';
                await payment.save();
            }
        }

        await order.save();

        res.json(order);
    } catch (error) {
        console.error('Error in updateOrderStatus:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete order
exports.deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ error: 'Invalid order ID' });
        }

        const order = await Order.findByIdAndDelete(orderId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error in deleteOrder:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get all return requests globally
exports.getAllReturns = async (req, res) => {
    try {
        const ReturnRequest = require('../../models/ReturnRequest');
        const returns = await ReturnRequest.find()
            .populate({
                path: 'product',
                select: 'name new_price image_url store'
            })
            .populate({
                path: 'order',
                select: 'orderNumber orderDate totalAmount shippingAddress'
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: returns.length,
            data: returns
        });
    } catch (error) {
        console.error('Error fetching all returns:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update return request status
exports.updateReturnStatus = async (req, res) => {
    try {
        const { returnId } = req.params;
        const { status } = req.body;

        const validStatuses = ['Pending', 'Approved', 'Rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const ReturnRequest = require('../../models/ReturnRequest');
        const returnRequest = await ReturnRequest.findById(returnId);

        if (!returnRequest) {
            return res.status(404).json({ error: 'Return request not found' });
        }

        returnRequest.status = status;
        await returnRequest.save();

        res.status(200).json({
            success: true,
            message: 'Return request status updated successfully',
            data: returnRequest
        });
    } catch (error) {
        console.error('Error updating return status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
