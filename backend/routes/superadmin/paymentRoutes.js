// Architect: SP
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/superadminmiddleware');
const {
    getAllPayments,
    getPaymentById,
    updatePaymentStatus
} = require('../../controllers/superadmin/paymentController');

// Apply superadmin auth middleware to all routes
router.use(auth);

// Get all payments with filters
router.get('/', getAllPayments);

// Get payment by ID
router.get('/:paymentId', getPaymentById);

// Update payment status
router.patch('/:paymentId/status', updatePaymentStatus);

module.exports = router;
