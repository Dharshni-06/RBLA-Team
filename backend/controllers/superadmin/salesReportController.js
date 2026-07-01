// Architect: SP
const Order = require('../../models/user/Order');
const Product = require('../../models/Product');
const Review = require('../../models/user/Review');
const mongoose = require('mongoose');

// Get revenue analysis
exports.getRevenueAnalysis = async (req, res) => {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;
        
        const matchStage = {
            orderStatus: { $in: ['Pending', 'Processing', 'Shipped', 'Delivered'] },
            ...(startDate && endDate && {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            })
        };

        const groupByFormat = {
            'day': { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            'week': { $dateToString: { format: '%Y-W%V', date: '$createdAt' } },
            'month': { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            'year': { $dateToString: { format: '%Y', date: '$createdAt' } }
        };

        const revenueData = await Order.aggregate([
            { $match: matchStage },
            {
                $addFields: {
                    totalAmount: {
                        $reduce: {
                            input: '$products',
                            initialValue: 0,
                            in: { 
                                $add: [
                                    '$$value',
                                    { $multiply: ['$$this.price', '$$this.quantity'] }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: groupByFormat[groupBy],
                    totalRevenue: { $sum: '$totalAmount' },
                    orderCount: { $sum: 1 },
                    averageOrderValue: { $avg: '$totalAmount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(revenueData);
    } catch (error) {
        console.error('Error in getRevenueAnalysis:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get product sales performance
exports.getProductSalesPerformance = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const matchStage = {
            orderStatus: { $in: ['Pending', 'Processing', 'Shipped', 'Delivered'] },
            ...(startDate && endDate && {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            })
        };

        // Get sales data
        const productPerformance = await Order.aggregate([
            { $match: matchStage },
            { $unwind: '$products' },
            {
                $group: {
                    _id: '$products.product',
                    totalRevenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } },
                    totalQuantity: { $sum: '$products.quantity' },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $project: {
                    _id: 1,
                    productName: '$productInfo.name',
                    totalRevenue: 1,
                    totalQuantity: 1,
                    orderCount: 1
                }
            }
        ]);

        // Get review data for each product
        const reviewData = await Review.aggregate([
            {
                $group: {
                    _id: '$product',
                    reviewCount: { $sum: 1 },
                    averageRating: { $avg: '$rating' }
                }
            }
        ]);

        // Combine sales and review data
        const productsWithReviews = productPerformance.map(product => {
            const reviews = reviewData.find(r => r._id.toString() === product._id.toString());
            return {
                ...product,
                reviewCount: reviews?.reviewCount || 0,
                averageRating: reviews?.averageRating || 0
            };
        });

        // Sort by revenue and limit to top 10
        const sortedProducts = productsWithReviews
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 10);

        res.json(sortedProducts);
    } catch (error) {
        console.error('Error in getProductSalesPerformance:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get reviews analysis
exports.getReviewsAnalysis = async (req, res) => {
    try {
        const reviewsAnalysis = await Review.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $group: {
                    _id: '$product',
                    productName: { $first: '$productInfo.name' },
                    reviewCount: { $sum: 1 },
                    averageRating: { $avg: '$rating' }
                }
            },
            { $sort: { reviewCount: -1 } },
            { $limit: 10 }
        ]);

        res.json(reviewsAnalysis);
    } catch (error) {
        console.error('Error in getReviewsAnalysis:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get sales by category
exports.getSalesByCategory = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const matchStage = {
            orderStatus: 'Delivered',
            ...(startDate && endDate && {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            })
        };

        const categoryPerformance = await Order.aggregate([
            { $match: matchStage },
            { $unwind: '$products' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'products.product',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'productInfo.category',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            { $unwind: '$categoryInfo' },
            {
                $group: {
                    _id: '$categoryInfo._id',
                    categoryName: { $first: '$categoryInfo.name' },
                    revenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } },
                    quantity: { $sum: '$products.quantity' },
                    productCount: { $addToSet: '$products.product' }
                }
            },
            {
                $project: {
                    _id: 1,
                    categoryName: 1,
                    revenue: 1,
                    quantity: 1,
                    productCount: { $size: '$productCount' }
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        res.json(categoryPerformance);
    } catch (error) {
        console.error('Error in getSalesByCategory:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get sales conversion metrics
exports.getSalesConversion = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const matchStage = {
            ...(startDate && endDate && {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            })
        };

        // Get order status metrics
        const orderStatusMetrics = await Order.aggregate([
            { $match: matchStage },
            {
                $addFields: {
                    totalAmount: {
                        $reduce: {
                            input: '$products',
                            initialValue: 0,
                            in: { 
                                $add: [
                                    '$$value',
                                    { $multiply: ['$$this.price', '$$this.quantity'] }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: '$orderStatus',
                    count: { $sum: 1 },
                    amount: { $sum: '$totalAmount' }
                }
            },
            {
                $project: {
                    status: '$_id',
                    count: 1,
                    amount: 1,
                    _id: 0
                }
            }
        ]);

        // Get sales by hour for delivered orders
        const salesByHour = await Order.aggregate([
            { 
                $match: { 
                    ...matchStage,
                    orderStatus: 'Delivered'
                }
            },
            {
                $addFields: {
                    totalAmount: {
                        $reduce: {
                            input: '$products',
                            initialValue: 0,
                            in: { 
                                $add: [
                                    '$$value',
                                    { $multiply: ['$$this.price', '$$this.quantity'] }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: { $hour: '$createdAt' },
                    orderCount: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' }
                }
            },
            {
                $project: {
                    hour: '$_id',
                    orderCount: 1,
                    revenue: 1,
                    _id: 0
                }
            },
            { $sort: { hour: 1 } }
        ]);

        res.json({
            orderStatusMetrics,
            salesByHour
        });
    } catch (error) {
        console.error('Error in getSalesConversion:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get low stock products (stock < 10)
exports.getLowStockProducts = async (req, res) => {
    try {
        const lowStockProducts = await Product.find({
            stock: { $lt: 10 }
        })
        .populate('category', 'name')
        .select('name stock category new_price');

        const formattedProducts = lowStockProducts.map(product => ({
            _id: product._id,
            name: product.name,
            stock: product.stock,
            category: product.category.name,
            price: product.new_price
        }));

        res.json(formattedProducts);
    } catch (error) {
        console.error('Error fetching low stock products:', error);
        res.status(500).json({ error: 'Failed to fetch low stock products' });
    }
};

module.exports = exports;
