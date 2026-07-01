// Architect: SP
const Review = require('../../models/user/Review');
const mongoose = require('mongoose');

// Get all reviews with filtering
exports.getAllReviews = async (req, res) => {
    try {
        const { rating, fromDate, toDate, productId } = req.query;
        let query = {};

        // Apply filters
        if (rating) {
            query.rating = parseInt(rating);
        }
        if (fromDate || toDate) {
            query.createdAt = {};
            if (fromDate) query.createdAt.$gte = new Date(fromDate);
            if (toDate) query.createdAt.$lte = new Date(toDate);
        }
        if (productId) {
            query.product = productId;
        }

        const reviews = await Review.find(query)
            .populate('user', 'name email')
            .populate('product', 'name price')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        console.error('Error in getAllReviews:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get single review by ID
exports.getReviewById = async (req, res) => {
    try {
        const { reviewId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({ error: 'Invalid review ID' });
        }

        const review = await Review.findById(reviewId)
            .populate('user', 'name email')
            .populate('product', 'name price');

        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        res.json(review);
    } catch (error) {
        console.error('Error in getReviewById:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete review
exports.deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({ error: 'Invalid review ID' });
        }

        const review = await Review.findByIdAndDelete(reviewId);

        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error in deleteReview:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
