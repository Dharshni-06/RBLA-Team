// Architect: SP
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/user/auth');

// Apply auth middleware to all routes except public endpoints
const {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview,
    voteReview,
    canReviewProduct
} = require('../../controllers/user/reviewController');

// Get reviews for a product (public)
router.get('/product/:productId', getProductReviews);

// Check if user can review a product
router.get('/can-review/:productId', auth, canReviewProduct);

// Protected routes - apply auth middleware
router.use(auth);

// Create a new review
router.post('/', createReview);

// Update own review
router.put('/:id', updateReview);

// Delete own review
router.delete('/:id', deleteReview);

// Vote on a review
router.post('/:id/vote', voteReview);

module.exports = router;
