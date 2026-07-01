// Architect: SP
const BraintreePayment = require('../../models/user/BraintreePayment');
const mongoose = require('mongoose');

// Get all payments with filtering
exports.getAllPayments = async (req, res) => {
    try {
        const { status, fromDate, toDate } = req.query;
        let query = {};

        // Apply filters
        if (status) {
            query.status = status;
        }
        if (fromDate || toDate) {
            query.createdAt = {};
            if (fromDate) query.createdAt.$gte = new Date(fromDate);
            if (toDate) query.createdAt.$lte = new Date(toDate);
        }

        const payments = await BraintreePayment.find(query)
            .populate('user', 'name email')
            .populate('order', 'orderNumber orderStatus')
            .sort({ createdAt: -1 });

        res.json(payments);
    } catch (error) {
        console.error('Error in getAllPayments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get single payment by ID
exports.getPaymentById = async (req, res) => {
    try {
        const { paymentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(paymentId)) {
            return res.status(400).json({ error: 'Invalid payment ID' });
        }

        const payment = await BraintreePayment.findById(paymentId)
            .populate('user', 'name email')
            .populate('order', 'orderNumber orderStatus products');

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        res.json(payment);
    } catch (error) {
        console.error('Error in getPaymentById:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(paymentId)) {
            return res.status(400).json({ error: 'Invalid payment ID' });
        }

        const validStatuses = ['authorized', 'settled', 'failed', 'voided'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const payment = await BraintreePayment.findByIdAndUpdate(
            paymentId,
            { status },
            { new: true }
        ).populate('user', 'name email');

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        res.json(payment);
    } catch (error) {
        console.error('Error in updatePaymentStatus:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
