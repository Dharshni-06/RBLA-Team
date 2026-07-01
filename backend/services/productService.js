// Architect: SP
const { Product, Review } = require('../models');
const { analyzeSentimentWithPollinations } = require('./pollinationsService');

/**
 * Check if a product has sufficient stock
 */
exports.checkProductStock = async (productId, quantity) => {
    try {
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }
        return product.stock >= quantity;
    } catch (error) {
        throw error;
    }
};

/**
 * Update product stock quantity
 */
exports.updateProductStock = async (productId, quantity) => {
    try {
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }
        
        const newStock = product.stock - quantity;
        if (newStock < 0) {
            throw new Error(`Insufficient stock for product ${product.name}`);
        }

        product.stock = newStock;
        await product.save();
        return product;
    } catch (error) {
        throw error;
    }
};

/**
 * Validate stock for all products in an order
 */
exports.validateStockForOrder = async (orderItems) => {
    try {
        const stockValidations = await Promise.all(
            orderItems.map(async (item) => {
                const hasStock = await this.checkProductStock(item.product, item.quantity);
                if (!hasStock) {
                    const product = await Product.findById(item.product);
                    throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
                }
                return true;
            })
        );
        return stockValidations.every(Boolean);
    } catch (error) {
        throw error;
    }
};

/**
 * Restore stock quantities (used when order fails/cancels)
 */
exports.restoreProductStock = async (orderItems) => {
    try {
        await Promise.all(
            orderItems.map(async (item) => {
                const product = await Product.findById(item.product);
                if (!product) {
                    throw new Error('Product not found');
                }
                product.stock += item.quantity;
                await product.save();
            })
        );
        return true;
    } catch (error) {
        throw error;
    }
};

/**
 * Get all products with optional filtering and attach sentiment analysis (supports pagination)
 * @param {object} filter - Mongo filter object
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Page size (number of products)
 */
exports.getAllProductsWithSentiment = async (filter, page, limit) => {
    let query = Product.find(filter)
        .populate('category', 'name')
        .sort({ createdAt: -1 });

    if (page && limit) {
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
    }

    const products = await query;

    console.log('[productService] Fetched products:', products.length);

    const productsWithSentiment = await Promise.all(products.map(async (product) => {
        // Fetch all reviews for the product
        const reviews = await Review.find({ product: product._id });
        console.log(`[productService] Reviews for product ${product._id} (${product.name}):`, reviews.length);

        const reviewTexts = reviews.map((r, idx) => `Review ${idx + 1} (${r.rating || 0} stars): ${r.comment}`);
        console.log(`[productService] Review texts for product ${product._id}:`, reviewTexts);

        // Call Pollinations API to analyze sentiment
        try {
            const sentimentData = await analyzeSentimentWithPollinations(reviewTexts);
            console.log(`[productService] Sentiment data for product ${product._id}:`, sentimentData);

            return {
                ...product.toObject(),
                sentiment: sentimentData.summary || 'No sentiment available'
            };
        } catch (error) {
            console.error(`[productService] Pollinations API error for product ${product._id}:`, error);
            return {
                ...product.toObject(),
                sentiment: 'Sentiment API error'
            };
        }
    }));

    return productsWithSentiment;
};
