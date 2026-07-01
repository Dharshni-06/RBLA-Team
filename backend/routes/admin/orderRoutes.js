// Architect: SP
const express = require('express');
const router = express.Router();
const adminMiddleware = require('../../middleware/admin/adminMiddleware');
const {
    getStoreOrders,
    getStoreOrder,
    updateOrderStatus,
    getOrderStats,
    getStoreReturns,
    updateReturnStatus
} = require('../../controllers/admin/orderController');

// Apply admin middleware to all routes
router.use(adminMiddleware);

// Return request management routes
router.get('/returns', getStoreReturns);
router.patch('/returns/:returnId/status', updateReturnStatus);

// Get all orders for admin's store
router.get('/', getStoreOrders);

// Get order statistics
router.get('/stats', getOrderStats);

// Get single order by ID
router.get('/:orderId', getStoreOrder);

// Update order status
router.patch('/:orderId/status', updateOrderStatus);

module.exports = router;
