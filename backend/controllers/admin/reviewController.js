// Architect: SP
const Review = require('../../models/user/Review');
const Product = require('../../models/Product');
const User = require('../../models/user/User');

/**
 * @desc    Get all reviews for products from the admin's store
 * @route   GET /api/admin/reviews
 * @access  Private/Admin
 */
exports.getStoreReviews = async (req, res) => {
    try {
        const adminStore = req.adminStore;
        
        if (!adminStore) {
            return res.status(400).json({
                success: false,
                message: 'Admin store not found'
            });
        }

        // Find products from this store
        const storeProducts = await Product.find({ store: adminStore }).select('_id');
        const productIds = storeProducts.map(product => product._id);

        // Find reviews for these products
        const reviews = await Review.find({ product: { $in: productIds } })
            .populate({
                path: 'product',
                select: 'name image_url price store'
            })
            .populate({
                path: 'user',
                select: 'name email'
            })
            .sort({ createdAt: -1 });

        // Format the reviews for frontend consumption
        const formattedReviews = reviews.map(review => ({
            id: review._id,
            productId: review.product._id,
            productName: review.product.name,
            productImage: review.product.image_url,
            store: review.product.store,
            customerName: review.user.name,
            customerEmail: review.user.email,
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            verifiedPurchase: review.verifiedPurchase,
            helpfulVotes: review.helpfulVotes,
            reply: review.reply,
            replyDate: review.replyDate,
            date: review.createdAt
        }));

        return res.status(200).json({
            success: true,
            count: formattedReviews.length,
            data: formattedReviews
        });
    } catch (error) {
        console.error('Error fetching store reviews:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

/**
 * @desc    Get review statistics for the admin's store
 * @route   GET /api/admin/reviews/stats
 * @access  Private/Admin
 */
exports.getReviewStats = async (req, res) => {
    try {
        const adminStore = req.adminStore;
        
        if (!adminStore) {
            return res.status(400).json({
                success: false,
                message: 'Admin store not found'
            });
        }

        // Find products from this store
        const storeProducts = await Product.find({ store: adminStore }).select('_id');
        const productIds = storeProducts.map(product => product._id);

        // Get total reviews count
        const totalReviews = await Review.countDocuments({ product: { $in: productIds } });

        // Get count of reviews by rating
        const ratingCounts = await Review.aggregate([
            { $match: { product: { $in: productIds } } },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: -1 } }
        ]);

        // Format rating counts
        const ratingStats = {
            5: 0, 4: 0, 3: 0, 2: 0, 1: 0
        };

        ratingCounts.forEach(rating => {
            ratingStats[rating._id] = rating.count;
        });

        // Calculate average rating
        let totalRatingSum = 0;
        let totalRatingCount = 0;

        Object.keys(ratingStats).forEach(rating => {
            totalRatingSum += Number(rating) * ratingStats[rating];
            totalRatingCount += ratingStats[rating];
        });

        const averageRating = totalRatingCount > 0 
            ? (totalRatingSum / totalRatingCount).toFixed(1) 
            : 0;

        // Get verified purchase reviews count
        const verifiedReviews = await Review.countDocuments({ 
            product: { $in: productIds },
            verifiedPurchase: true
        });

        // Get recent reviews (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentReviews = await Review.countDocuments({
            product: { $in: productIds },
            createdAt: { $gte: thirtyDaysAgo }
        });

        return res.status(200).json({
            success: true,
            data: {
                totalReviews,
                averageRating,
                ratingStats,
                verifiedReviews,
                recentReviews
            }
        });
    } catch (error) {
        console.error('Error fetching review statistics:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

/**
 * @desc    Get a specific review by ID
 * @route   GET /api/admin/reviews/:id
 * @access  Private/Admin
 */
exports.getReviewById = async (req, res) => {
    try {
        const adminStore = req.adminStore;
        const reviewId = req.params.id;
        
        if (!adminStore) {
            return res.status(400).json({
                success: false,
                message: 'Admin store not found'
            });
        }

        // Find the review
        const review = await Review.findById(reviewId)
            .populate({
                path: 'product',
                select: 'name image_url price store'
            })
            .populate({
                path: 'user',
                select: 'name email'
            });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if the review is for a product from the admin's store
        if (review.product.store !== adminStore) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this review'
            });
        }

        // Format the review for frontend consumption
        const formattedReview = {
            id: review._id,
            productId: review.product._id,
            productName: review.product.name,
            productImage: review.product.image_url,
            store: review.product.store,
            customerName: review.user.name,
            customerEmail: review.user.email,
            rating: review.rating,
            title: review.title,
            comment: review.comment,
            verifiedPurchase: review.verifiedPurchase,
            helpfulVotes: review.helpfulVotes,
            reply: review.reply,
            replyDate: review.replyDate,
            date: review.createdAt,
            updatedAt: review.updatedAt
        };

        return res.status(200).json({
            success: true,
            data: formattedReview
        });
    } catch (error) {
        console.error('Error fetching review by ID:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

/**
 * @desc    Reply to a specific review
 * @route   PUT /api/admin/reviews/:id/reply
 * @access  Private/Admin
 */
exports.replyToReview = async (req, res) => {
    try {
        const adminStore = req.adminStore;
        const reviewId = req.params.id;
        const { reply } = req.body;

        if (!adminStore) {
            return res.status(400).json({
                success: false,
                message: 'Admin store not found'
            });
        }

        if (!reply || !reply.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Reply content cannot be empty'
            });
        }

        // Find the review and populate product info to check store authorization
        const review = await Review.findById(reviewId).populate({
            path: 'product',
            select: 'store name'
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if the review is for a product from the admin's store
        if (review.product.store !== adminStore) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to reply to this review'
            });
        }

        review.reply = reply.trim();
        review.replyDate = new Date();
        await review.save();

        return res.status(200).json({
            success: true,
            message: 'Reply submitted successfully',
            data: {
                id: review._id,
                reply: review.reply,
                replyDate: review.replyDate
            }
        });
    } catch (error) {
        console.error('Error replying to review:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
