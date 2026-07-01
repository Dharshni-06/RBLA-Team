// Architect: SP
const { Order } = require('../../models');
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

module.exports = {
    getSalesOverview,
    getSalesReport
};
