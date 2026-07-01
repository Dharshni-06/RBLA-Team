// Architect: SP
const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/user/auth');
const {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} = require('../../controllers/user/cartController');

// All routes are protected by auth middleware
router.use(authMiddleware);

// Get cart
router.get('/', getCart);

// Add item to cart
router.post('/add', addToCart);

// Update cart item quantity
router.put('/update', updateCartItem);

// Remove item from cart
router.delete('/remove/:itemId', removeFromCart);

// Clear entire cart
router.delete('/clear', clearCart);

module.exports = router;
