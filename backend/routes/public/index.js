// Architect: SP
const express = require('express');
const router = express.Router();

const { searchProducts } = require('../../controllers/public/searchController');
const { 
    getAllProducts, 
    getProductDetails, 
    getProductsByCategory 
} = require('../../controllers/public/productController');

// Search routes
router.get('/search', searchProducts);

// Product routes
router.get('/products', getAllProducts);
router.get('/products/:id', getProductDetails);
router.get('/category/:category', getProductsByCategory);

module.exports = router;
