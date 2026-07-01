// Architect: SP
const express = require('express');
const router = express.Router();
const {
    getStoreUsers,
    getUserStats,
    getUserDetails,
    getUserOrders
} = require('../../controllers/admin/userController');
const adminMiddleware = require('../../middleware/admin/adminMiddleware');

// Apply middleware to all routes
router.use(adminMiddleware);

// Routes
router.get('/', getStoreUsers);
router.get('/stats', getUserStats);
router.get('/:userId', getUserDetails);
router.get('/:userId/orders', getUserOrders);

module.exports = router;
