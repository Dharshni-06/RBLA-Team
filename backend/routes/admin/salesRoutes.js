// Architect: SP
const express = require('express');
const router = express.Router();
const {
    getSalesOverview,
    getSalesReport
} = require('../../controllers/admin/salesController');
const adminMiddleware = require('../../middleware/admin/adminMiddleware');

// Apply middleware to all routes
router.use(adminMiddleware);

// Routes
router.get('/overview', getSalesOverview);
router.get('/report', getSalesReport);

module.exports = router;
