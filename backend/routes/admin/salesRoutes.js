// Architect: SP
const express = require('express');
const router = express.Router();
const {
    getSalesOverview,
    getSalesReport,
    getRevenueAnalysis,
    getProductSalesPerformance,
    getSalesByCategory,
    getSalesConversion,
    getReviewsAnalysis,
    getLowStockProducts
} = require('../../controllers/admin/salesController');
const adminMiddleware = require('../../middleware/admin/adminMiddleware');

// Apply middleware to all routes
router.use(adminMiddleware);

// Routes
router.get('/overview', getSalesOverview);
router.get('/report', getSalesReport);
router.get('/revenue', getRevenueAnalysis);
router.get('/products', getProductSalesPerformance);
router.get('/categories', getSalesByCategory);
router.get('/conversion', getSalesConversion);
router.get('/reviews', getReviewsAnalysis);
router.get('/low-stock-products', getLowStockProducts);

module.exports = router;
