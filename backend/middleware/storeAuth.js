// Architect: SP
const jwt = require('jsonwebtoken');
const { Product } = require('../models');
require('dotenv').config();

// Middleware to extract store from JWT token
exports.storeAccessMiddleware = (req, res, next) => {
  try {
    // Extract token from cookies
    const token = req.cookies.adminToken;
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token and extract store
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminStore = decoded.store;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Product ownership verification middleware
exports.verifyProductOwnership = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (product.store !== req.adminStore) {
      return res.status(403).json({ 
        message: 'Access denied: You can only manage products from your store' 
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
