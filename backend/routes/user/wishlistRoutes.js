// Architect: SP
const express = require('express');
const router = express.Router();
const wishlistController = require('../../controllers/user/wishlistController');
const authMiddleware = require('../../middleware/user/auth');

// All routes are protected by auth middleware
router.use(authMiddleware);

// Get user's wishlist
router.get('/', wishlistController.getWishlist);

// Add item to wishlist
router.post('/add', wishlistController.addToWishlist);

// Remove item from wishlist
router.delete('/remove/:productId', wishlistController.removeFromWishlist);

// Clear entire wishlist
router.delete('/clear', wishlistController.clearWishlist);

module.exports = router;
