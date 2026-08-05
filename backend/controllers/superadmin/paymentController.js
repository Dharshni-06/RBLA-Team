// Architect: SP
const BraintreePayment = require('../../models/user/BraintreePayment');
const Payment = require('../../models/Payment');
const mongoose = require('mongoose');

// Get all payments with filtering
exports.getAllPayments = async (req, res) => {
    try {
        const { status, fromDate, toDate } = req.query;
        let bpQuery = {};
        let pQuery = {};

        // Apply filters
        if (status) {
            bpQuery.status = status;
            if (status === 'settled') {
                pQuery.paymentStatus = 'Completed';
            } else if (status === 'authorized') {
                pQuery.paymentStatus = 'Pending';
            } else if (status === 'failed') {
                pQuery.paymentStatus = 'Failed';
            } else {
                pQuery.paymentStatus = status;
            }
        }
        if (fromDate || toDate) {
            bpQuery.createdAt = {};
            pQuery.paymentDate = {};
            if (fromDate) {
                bpQuery.createdAt.$gte = new Date(fromDate);
                pQuery.paymentDate.$gte = new Date(fromDate);
            }
            if (toDate) {
                bpQuery.createdAt.$lte = new Date(toDate);
                pQuery.paymentDate.$lte = new Date(toDate);
            }
        }

        // Fetch from both collections
        const bpPayments = await BraintreePayment.find(bpQuery)
            .populate('user', 'name email')
            .populate('order', 'orderNumber orderStatus')
            .lean();

        const pPayments = await Payment.find(pQuery)
            .populate('userId', 'name email')
            .populate('orderId', 'orderNumber orderStatus')
            .lean();

        // Format both to match the BraintreePayment format for the frontend
        const formattedBp = bpPayments.map(p => ({
            ...p,
            createdAt: p.createdAt || p.paymentDate
        }));

        const formattedP = pPayments.map(p => ({
            _id: p._id,
            user: p.userId,
            order: p.orderId,
            orderNumber: p.orderId ? p.orderId.orderNumber : 'N/A',
            transactionId: p.transactionId,
            amount: p.amount,
            status: p.paymentStatus === 'Completed' ? 'settled' : 
                    p.paymentStatus === 'Pending' ? 'authorized' : 
                    p.paymentStatus === 'Failed' ? 'failed' : p.paymentStatus.toLowerCase(),
            paymentMethod: p.paymentMethod,
            createdAt: p.paymentDate,
            updatedAt: p.paymentDate,
            billingAddress: p.billingAddress
        }));

        // Merge and sort chronologically (newest first)
        const allPayments = [...formattedBp, ...formattedP].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        res.json(allPayments);
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

        // Check BraintreePayment first
        let payment = await BraintreePayment.findById(paymentId)
            .populate('user', 'name email')
            .populate('order', 'orderNumber orderStatus products')
            .lean();

        if (payment) {
            return res.json(payment);
        }

        // Check Payment if not found
        const pPayment = await Payment.findById(paymentId)
            .populate('userId', 'name email')
            .populate('orderId', 'orderNumber orderStatus products')
            .lean();

        if (!pPayment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        // Format to match BraintreePayment structure
        const formatted = {
            _id: pPayment._id,
            user: pPayment.userId,
            order: pPayment.orderId,
            orderNumber: pPayment.orderId ? pPayment.orderId.orderNumber : 'N/A',
            transactionId: pPayment.transactionId,
            amount: pPayment.amount,
            status: pPayment.paymentStatus === 'Completed' ? 'settled' : 
                    pPayment.paymentStatus === 'Pending' ? 'authorized' : 
                    pPayment.paymentStatus === 'Failed' ? 'failed' : pPayment.paymentStatus.toLowerCase(),
            paymentMethod: pPayment.paymentMethod,
            createdAt: pPayment.paymentDate,
            updatedAt: pPayment.paymentDate,
            billingAddress: pPayment.billingAddress
        };

        res.json(formatted);
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

        // Try updating in BraintreePayment first
        let payment = await BraintreePayment.findByIdAndUpdate(
            paymentId,
            { status },
            { new: true }
        ).populate('user', 'name email').lean();

        if (payment) {
            return res.json(payment);
        }

        // Map status back to Payment status
        let paymentStatus;
        if (status === 'settled') {
            paymentStatus = 'Completed';
        } else if (status === 'authorized') {
            paymentStatus = 'Pending';
        } else if (status === 'failed') {
            paymentStatus = 'Failed';
        } else {
            paymentStatus = status;
        }

        const pPayment = await Payment.findByIdAndUpdate(
            paymentId,
            { paymentStatus },
            { new: true }
        ).populate('userId', 'name email').populate('orderId', 'orderNumber orderStatus').lean();

        if (!pPayment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        // Format to match BraintreePayment structure
        const formatted = {
            _id: pPayment._id,
            user: pPayment.userId,
            order: pPayment.orderId,
            orderNumber: pPayment.orderId ? pPayment.orderId.orderNumber : 'N/A',
            transactionId: pPayment.transactionId,
            amount: pPayment.amount,
            status: pPayment.paymentStatus === 'Completed' ? 'settled' : 
                    pPayment.paymentStatus === 'Pending' ? 'authorized' : 
                    pPayment.paymentStatus === 'Failed' ? 'failed' : pPayment.paymentStatus.toLowerCase(),
            paymentMethod: pPayment.paymentMethod,
            createdAt: pPayment.paymentDate,
            updatedAt: pPayment.paymentDate,
            billingAddress: pPayment.billingAddress
        };

        res.json(formatted);
    } catch (error) {
        console.error('Error in updatePaymentStatus:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
