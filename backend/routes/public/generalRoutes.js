// Architect: SP
const express = require('express');
const router = express.Router();
const { verifyOrderForReturn, createReturnRequest } = require('../../controllers/public/returnController');

// Return request routes
router.get('/orders/verify-return', verifyOrderForReturn);
router.post('/orders/return', createReturnRequest);

// Get marquee message
router.get('/marquee', async (req, res) => {
    try {
        // For now, return a static message. You can later connect this to a database
        res.json({
            success: true,
            message: "Welcome to Survivor Products! Explore our latest collection of Bedsheets and Towels"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get new collections
router.get('/newcollections', async (req, res) => {
    try {
        const { Product } = require('../../models');
        
        // Get the latest 4 products
        const products = await Product.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(4)
            .populate('category', 'name')
            // Removed unit population
            ;

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
