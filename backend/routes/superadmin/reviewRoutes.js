// Architect: SP
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/superadminmiddleware');
const {
    getAllReviews,
    getReviewById,
    deleteReview
} = require('../../controllers/superadmin/reviewController');

// Apply superadmin auth middleware to all routes
router.use(auth);

// Get all reviews with filters
router.get('/', getAllReviews);

// Get review by ID
router.get('/:reviewId', getReviewById);

// Delete review
router.delete('/:reviewId', deleteReview);

module.exports = router;
