// Architect: SP
const express = require('express');
const router = express.Router();
const salesReportController = require('../../controllers/superadmin/salesReportController');
const superadminMiddleware = require('../../middleware/superadminmiddleware');

// Apply superadmin authentication to all routes
router.use(superadminMiddleware);

// Revenue Analysis
router.get('/revenue', salesReportController.getRevenueAnalysis);

// Product Sales Performance
router.get('/products', salesReportController.getProductSalesPerformance);

// Sales by Category
router.get('/categories', salesReportController.getSalesByCategory);

// Sales Conversion Metrics
router.get('/conversion', salesReportController.getSalesConversion);

// Reviews Analysis
router.get('/reviews', salesReportController.getReviewsAnalysis);

// Low Stock Products
router.get('/low-stock-products', salesReportController.getLowStockProducts);

module.exports = router;
