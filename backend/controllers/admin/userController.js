// Architect: SP
const User = require('../../models/user/User');
const Order = require('../../models/user/Order');
const Product = require('../../models/Product');

// Get all users who have ordered from the admin's store
const getStoreUsers = async (req, res) => {
    try {
        const store = req.admin.storeName;
        
        // Find all products belonging to this store
        const storeProducts = await Product.find({ store }).distinct('_id');

        // Find all orders containing products from this store
        const storeOrders = await Order.find({
            'products.product': { $in: storeProducts }
        }).distinct('user');

        // Get users who have ordered from this store
        const users = await User.find({
            _id: { $in: storeOrders }
        }).select('-password');

        res.status(200).json({
            status: 'success',
            data: users
        });
    } catch (error) {
        console.error('Error in getStoreUsers:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching store users'
        });
    }
};

// Get user statistics for the admin's store
const getUserStats = async (req, res) => {
    try {
        const store = req.admin.storeName;

        // Find all products belonging to this store
        const storeProducts = await Product.find({ store }).distinct('_id');

        // Get all orders containing products from this store
        const storeOrders = await Order.find({
            'products.product': { $in: storeProducts }
        });

        // Get unique customer count
        const uniqueCustomers = [...new Set(storeOrders.map(order => order.user.toString()))].length;

        // Get orders in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentOrders = storeOrders.filter(order => 
            new Date(order.createdAt) >= thirtyDaysAgo
        );

        // Get new customers (first order in last 30 days)
        const newCustomers = recentOrders.filter(order => {
            const customerOrders = storeOrders.filter(o => 
                o.user.toString() === order.user.toString()
            );
            const firstOrder = customerOrders.reduce((earliest, current) => 
                new Date(current.createdAt) < new Date(earliest.createdAt) ? current : earliest
            );
            return new Date(firstOrder.createdAt) >= thirtyDaysAgo;
        }).length;

        // Get repeat customers (ordered more than once)
        const customerOrderCounts = storeOrders.reduce((acc, order) => {
            const userId = order.user.toString();
            acc[userId] = (acc[userId] || 0) + 1;
            return acc;
        }, {});
        
        const repeatCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;

        res.status(200).json({
            status: 'success',
            data: {
                totalCustomers: uniqueCustomers,
                newCustomers,
                repeatCustomers,
                recentOrdersCount: recentOrders.length
            }
        });
    } catch (error) {
        console.error('Error in getUserStats:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching user statistics'
        });
    }
};

// Get specific user details with their store-specific order history
const getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        const store = req.admin.storeName;

        // Get user details
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Find all products belonging to this store
        const storeProducts = await Product.find({ store }).distinct('_id');

        // Get user's orders from this store
        const orders = await Order.find({
            user: userId,
            'products.product': { $in: storeProducts }
        }).sort({ createdAt: -1 });

        // Calculate user statistics for this store
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

        res.status(200).json({
            status: 'success',
            data: {
                user,
                storeStats: {
                    totalOrders,
                    totalSpent,
                    averageOrderValue
                },
                recentOrders: orders.slice(0, 5) // Return only 5 most recent orders
            }
        });
    } catch (error) {
        console.error('Error in getUserDetails:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching user details'
        });
    }
};

// Get user's orders from the admin's store
const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        const store = req.admin.storeName;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Find all products belonging to this store
        const storeProducts = await Product.find({ store }).distinct('_id');

        const orders = await Order.find({
            user: userId,
            'products.product': { $in: storeProducts }
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

        const totalOrders = await Order.countDocuments({
            user: userId,
            'products.product': { $in: storeProducts }
        });

        res.status(200).json({
            status: 'success',
            data: {
                orders,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalOrders / limit),
                    totalOrders
                }
            }
        });
    } catch (error) {
        console.error('Error in getUserOrders:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching user orders'
        });
    }
};

module.exports = {
    getStoreUsers,
    getUserStats,
    getUserDetails,
    getUserOrders
};
