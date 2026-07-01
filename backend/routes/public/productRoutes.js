// Architect: SP
const express = require('express');
const router = express.Router();
const { Product } = require('../../models');
const Review = require('../../models/user/Review');

// Get all products
router.get('/', async (req, res) => {
    try {
        const query = {};
        
        // Add filters if provided
        if (req.query.category) {
            query.category = req.query.category;
        }
        if (req.query.isActive !== undefined) {
            query.isActive = req.query.isActive === 'true';
        }

        const products = await Product.find(query)
            .populate('category', 'name')
            // Removed unit population
            .sort({ date: -1 });

        res.status(200).json({
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

// Get products by category name
router.get('/category/:categoryName', async (req, res) => {
    try {
        const { categoryName } = req.params;
        
        // First find the category ID by name
        const category = await require('../../models').Category.findOne({ 
            name: { $regex: new RegExp(categoryName, 'i') } // Case-insensitive search
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Then find all products in that category
        const products = await Product.find({ 
            category: category._id,
            isActive: true // Only show active products
        })
        .populate('category', 'name')
        // Removed unit population
        .sort({ date: -1 });

        res.status(200).json({
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

// Get single product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name')
            // Removed unit population
            ;

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Fetch reviews for this product
        const reviews = await Review.find({ product: req.params.id })
            .populate('user', 'name')
            .sort('-createdAt');

        // Calculate average rating
        let averageRating = 0;
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            averageRating = totalRating / reviews.length;
        }

        // Add reviews and average rating to product data
        const productData = {
            ...product.toObject(),
            reviews,
            averageRating
        };

        res.status(200).json({
            success: true,
            data: productData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
