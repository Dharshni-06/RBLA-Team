// Architect: SP
const express = require('express');
const router = express.Router();
const adminMiddleware = require('../../middleware/admin/adminMiddleware');
const {
    getStorePayments,
    getStorePayment,
    getPaymentStats
} = require('../../controllers/admin/paymentController');

// Apply admin middleware to all routes
router.use(adminMiddleware);

// Get all payments for admin's store
router.get('/', getStorePayments);

// Get payment statistics
router.get('/stats', getPaymentStats);

// Get single payment by ID
router.get('/:id', getStorePayment);

module.exports = router;
