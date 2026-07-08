// Architect: SP
const { Order, Product, Review } = require('../../models');
const mongoose = require('mongoose');

// Helper function to get start date based on timeframe
const getStartDate = (timeframe) => {
    const now = new Date();
    switch (timeframe) {
        case 'today':
            return new Date(now.setHours(0, 0, 0, 0));
        case 'week':
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return weekAgo;
        case 'month':
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return monthAgo;
        case 'year':
            const yearAgo = new Date(now);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            return yearAgo;
        default:
            return null;
    }
};

// Helper function to calculate sales metrics
const calculateSalesMetrics = (orders, store) => {
    let totalSales = 0;
    let totalOrders = orders.length;
    let totalProducts = 0;
    let averageOrderValue = 0;

    orders.forEach(order => {
        const storeProducts = order.products.filter(p => p.product && p.product.store === store);
        const orderTotal = storeProducts.reduce((sum, p) => sum + (p.quantity * p.price), 0);
        totalSales += orderTotal;
        totalProducts += storeProducts.reduce((sum, p) => sum + p.quantity, 0);
    });

    averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    return {
        totalSales,
        totalOrders,
        totalProducts,
        averageOrderValue
    };
};

// Get sales overview for the admin's store
const getSalesOverview = async (req, res) => {
    try {
        const store = req.adminStore || (req.admin && req.admin.storeName);
        const timeframe = req.query.timeframe || 'all';
        const startDate = getStartDate(timeframe);

        console.log('Admin store name:', store);

        let query = {
            orderStatus: { $in: ['Pending', 'Processing', 'Shipped', 'Delivered'] }
        };

        // Add date filter if timeframe specified
        if (startDate) {
            query.createdAt = { $gte: startDate };
        }

        console.log('Query:', JSON.stringify(query, null, 2));

        // Get all matching orders and populate products and their category
        const orders = await Order.find(query).populate({
            path: 'products.product',
            populate: {
                path: 'category',
                select: 'name'
            }
        });
        console.log('Total orders in database matching status/timeframe:', orders.length);

        // Filter orders that contain products from the store
        const storeOrders = orders.filter(order => 
            order.products.some(p => p.product && p.product.store === store)
        );
        console.log('Found orders for store:', storeOrders.length);

        // Calculate total sales and other metrics
        const metrics = calculateSalesMetrics(storeOrders, store);
        console.log('Calculated metrics:', metrics);

        // Get sales by category in-memory
        const categoryMap = {};
        storeOrders.forEach(order => {
            order.products.forEach(item => {
                if (item.product && item.product.store === store) {
                    const categoryObj = item.product.category;
                    const categoryName = (categoryObj && typeof categoryObj === 'object') ? categoryObj.name : 'Uncategorized';
                    const sales = item.quantity * item.price;
                    const quantity = item.quantity;
                    if (!categoryMap[categoryName]) {
                        categoryMap[categoryName] = {
                            _id: categoryName,
                            totalSales: 0,
                            totalQuantity: 0
                        };
                    }
                    categoryMap[categoryName].totalSales += sales;
                    categoryMap[categoryName].totalQuantity += quantity;
                }
            });
        });
        const categoryData = Object.values(categoryMap).sort((a, b) => b.totalSales - a.totalSales);
        console.log('Category data:', categoryData);

        // Get daily sales data in-memory
        const dailyMap = {};
        storeOrders.forEach(order => {
            const dateStr = new Date(order.createdAt).toISOString().split('T')[0];
            let orderSalesForStore = 0;
            order.products.forEach(item => {
                if (item.product && item.product.store === store) {
                    orderSalesForStore += item.quantity * item.price;
                }
            });
            if (orderSalesForStore > 0) {
                if (!dailyMap[dateStr]) {
                    dailyMap[dateStr] = {
                        date: dateStr,
                        totalSales: 0,
                        totalOrders: 0
                    };
                }
                dailyMap[dateStr].totalSales += orderSalesForStore;
                dailyMap[dateStr].totalOrders += 1;
            }
        });
        const dailySales = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
        console.log('Daily sales:', dailySales);

        res.status(200).json({
            status: 'success',
            data: {
                overview: metrics,
                categoryData,
                dailySales
            }
        });
    } catch (error) {
        console.error('Error in getSalesOverview:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching sales overview'
        });
    }
};

// Get detailed sales report
const getSalesReport = async (req, res) => {
    try {
        const store = req.adminStore || (req.admin && req.admin.storeName);
        const { startDate, endDate } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        console.log('Getting sales report for:', {
            store,
            startDate,
            endDate,
            page,
            limit
        });

        // Construct date range query
        let dateQuery = {};
        if (startDate && endDate) {
            dateQuery = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }

        const query = {
            orderStatus: { $in: ['Pending', 'Processing', 'Shipped', 'Delivered'] },
            ...dateQuery
        };

        console.log('Query:', JSON.stringify(query, null, 2));

        // Get orders for the store within date range
        const orders = await Order.find(query)
            .populate('products.product')
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        // Filter orders that contain products from the store
        const storeOrders = orders.filter(order => 
            order.products.some(p => p.product && p.product.store === store)
        );

        console.log('Found orders for store sales report:', storeOrders.length);

        // Get total count for pagination
        const total = storeOrders.length;
        const paginatedOrders = storeOrders.slice(skip, skip + limit);

        // Process orders to get sales data
        const salesData = paginatedOrders.map(order => {
            const storeProducts = order.products.filter(p => p.product && p.product.store === store);
            return {
                orderId: order.orderNumber,
                date: order.createdAt,
                customer: (order.shippingAddress && order.shippingAddress.fullName) || (order.user && order.user.name) || 'Unknown Customer',
                products: storeProducts.map(p => ({
                    name: p.product ? p.product.name : 'Unknown Product',
                    quantity: p.quantity,
                    price: p.price,
                    total: p.quantity * p.price
                })),
                total: storeProducts.reduce((sum, p) => sum + (p.quantity * p.price), 0)
            };
        });

        console.log('Processed sales data:', salesData.length);

        res.status(200).json({
            status: 'success',
            data: {
                sales: salesData,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error in getSalesReport:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching sales report'
        });
    }
};

// Store-filtered Revenue Analysis
const getRevenueAnalysis = async (req, res) => {
    try {
        const store = req.adminStore;
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
            { $match: { 'productInfo.store': store } },
            {
                $group: {
                    _id: '$_id',
                    createdAt: { $first: '$createdAt' },
                    orderRevenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } }
                }
            },
            {
                $group: {
                    _id: groupByFormat[groupBy],
                    totalRevenue: { $sum: '$orderRevenue' },
                    orderCount: { $sum: 1 },
                    averageOrderValue: { $avg: '$orderRevenue' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json(revenueData);
    } catch (error) {
        console.error('Error in getRevenueAnalysis:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Store-filtered Product Sales Performance
const getProductSalesPerformance = async (req, res) => {
    try {
        const store = req.adminStore;
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

        const productPerformance = await Order.aggregate([
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
            { $match: { 'productInfo.store': store } },
            {
                $group: {
                    _id: '$products.product',
                    totalRevenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } },
                    totalQuantity: { $sum: '$products.quantity' },
                    orderCount: { $sum: 1 },
                    productName: { $first: '$productInfo.name' }
                }
            }
        ]);

        const storeProducts = await Product.find({ store }).select('_id');
        const storeProductIds = storeProducts.map(p => p._id);

        const reviewData = await Review.aggregate([
            { $match: { product: { $in: storeProductIds } } },
            {
                $group: {
                    _id: '$product',
                    reviewCount: { $sum: 1 },
                    averageRating: { $avg: '$rating' }
                }
            }
        ]);

        const productsWithReviews = productPerformance.map(product => {
            const reviews = reviewData.find(r => r._id.toString() === product._id.toString());
            return {
                ...product,
                reviewCount: reviews?.reviewCount || 0,
                averageRating: reviews?.averageRating || 0
            };
        });

        const sortedProducts = productsWithReviews
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 10);

        res.status(200).json(sortedProducts);
    } catch (error) {
        console.error('Error in getProductSalesPerformance:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Store-filtered Sales by Category
const getSalesByCategory = async (req, res) => {
    try {
        const store = req.adminStore;
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
            { $match: { 'productInfo.store': store } },
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

        res.status(200).json(categoryPerformance);
    } catch (error) {
        console.error('Error in getSalesByCategory:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Store-filtered Sales Conversion Metrics
const getSalesConversion = async (req, res) => {
    try {
        const store = req.adminStore;
        const { startDate, endDate } = req.query;

        const matchStage = {
            ...(startDate && endDate && {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            })
        };

        const orderStatusMetrics = await Order.aggregate([
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
            { $match: { 'productInfo.store': store } },
            {
                $group: {
                    _id: { orderId: '$_id', status: '$orderStatus' },
                    orderRevenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } }
                }
            },
            {
                $group: {
                    _id: '$_id.status',
                    count: { $sum: 1 },
                    amount: { $sum: '$orderRevenue' }
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

        const salesByHour = await Order.aggregate([
            { 
                $match: { 
                    ...matchStage,
                    orderStatus: 'Delivered'
                }
            },
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
            { $match: { 'productInfo.store': store } },
            {
                $group: {
                    _id: { orderId: '$_id', hour: { $hour: '$createdAt' } },
                    orderRevenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } }
                }
            },
            {
                $group: {
                    _id: '$_id.hour',
                    orderCount: { $sum: 1 },
                    revenue: { $sum: '$orderRevenue' }
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

        res.status(200).json({
            orderStatusMetrics,
            salesByHour
        });
    } catch (error) {
        console.error('Error in getSalesConversion:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Store-filtered Reviews Analysis
const getReviewsAnalysis = async (req, res) => {
    try {
        const store = req.adminStore;
        
        const storeProducts = await Product.find({ store }).select('_id');
        const storeProductIds = storeProducts.map(p => p._id);

        const reviewsAnalysis = await Review.aggregate([
            { $match: { product: { $in: storeProductIds } } },
            {
                $group: {
                    _id: '$product',
                    reviewCount: { $sum: 1 },
                    averageRating: { $avg: '$rating' }
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
                    reviewCount: 1,
                    averageRating: 1
                }
            },
            { $sort: { reviewCount: -1 } },
            { $limit: 10 }
        ]);

        res.status(200).json(reviewsAnalysis);
    } catch (error) {
        console.error('Error in getReviewsAnalysis:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Store-filtered Low Stock Products
const getLowStockProducts = async (req, res) => {
    try {
        const store = req.adminStore;
        const lowStockProducts = await Product.find({
            store,
            stock: { $lt: 10 }
        })
        .populate('category', 'name')
        .select('name stock category new_price');

        const formattedProducts = lowStockProducts.map(product => ({
            _id: product._id,
            name: product.name,
            stock: product.stock,
            category: product.category?.name || 'Uncategorized',
            price: product.new_price
        }));

        res.status(200).json(formattedProducts);
    } catch (error) {
        console.error('Error fetching low stock products:', error);
        res.status(500).json({ error: 'Failed to fetch low stock products' });
    }
};

module.exports = {
    getSalesOverview,
    getSalesReport,
    getRevenueAnalysis,
    getProductSalesPerformance,
    getSalesByCategory,
    getSalesConversion,
    getReviewsAnalysis,
    getLowStockProducts
};
