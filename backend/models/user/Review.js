// Architect: SP
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxLength: 1000
    },
    verifiedPurchase: {
        type: Boolean,
        default: false
    },
    helpfulVotes: {
        type: Number,
        default: 0
    },
    reply: {
        type: String,
        trim: true,
        maxLength: 1000
    },
    replyDate: {
        type: Date
    },
    images: {
        type: [String],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Add index for faster queries
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Update the updatedAt timestamp before saving
reviewSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
