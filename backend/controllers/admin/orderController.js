// Architect: SP
const { Order, Product } = require('../../models');
const mongoose = require('mongoose');


/**
 * Get all orders for the admin's store
 * This is done by:
 * 1. Finding all orders
 * 2. Populating the products
 * 3. Filtering orders that contain products from the admin's store
 */
exports.getStoreOrders = async (req, res) => {
    try {
        // Get the admin's store from middleware
        const adminStore = req.adminStore;
        
        if (!adminStore) {
            return res.status(400).json({ 
                success: false,
                message: 'Store information not found' 
            });
        }

        // Find all orders and populate product information
        const allOrders = await Order.find()
            .populate({
                path: 'products.product',
                select: 'name new_price image_url store'
            })
            .populate('user', 'name email')
            .sort({ orderDate: -1 });

        // Filter orders that contain products from the admin's store
        const storeOrders = allOrders.filter(order => {
            // Check if any product in the order belongs to the admin's store
            return order.products.some(item => 
                item.product && item.product.store === adminStore
            );
        });

        // Format the response data
        const formattedOrders = storeOrders.map(order => {
            // Filter products to only include those from admin's store
            const storeProducts = order.products.filter(item => 
                item.product && item.product.store === adminStore
            );
            
            // Calculate store-specific total
            const storeTotal = storeProducts.reduce((sum, item) => 
                sum + (item.price * item.quantity), 0
            );

            return {
                id: order._id,
                orderNumber: order.orderNumber,
                customerName: order.user ? order.user.name : 'Unknown Customer',
                customerEmail: order.user ? order.user.email : 'Unknown Email',
                date: order.orderDate,
                status: order.orderStatus,
                paymentStatus: order.paymentStatus,
                total: storeTotal,
                products: storeProducts,
                shippingAddress: order.shippingAddress
            };
        });

        res.status(200).json({
            success: true,
            count: formattedOrders.length,
            data: formattedOrders
        });
    } catch (error) {
        console.error('Error fetching store orders:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching orders',
            error: error.message 
        });
    }
};

/**
 * Get a single order by ID
 * Only returns the order if it contains products from the admin's store
 */
exports.getStoreOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const adminStore = req.adminStore;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid order ID' 
            });
        }

        const order = await Order.findById(orderId)
            .populate({
                path: 'products.product',
                select: 'name new_price image_url store'
            })
            .populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ 
                success: false,
                message: 'Order not found' 
            });
        }

        // Check if order contains any products from admin's store
        const hasStoreProducts = order.products.some(item => 
            item.product && item.product.store === adminStore
        );

        if (!hasStoreProducts) {
            return res.status(403).json({ 
                success: false,
                message: 'Access denied: This order does not contain products from your store' 
            });
        }

        // Filter products to only include those from admin's store
        const storeProducts = order.products.filter(item => 
            item.product && item.product.store === adminStore
        );
        
        // Calculate store-specific total
        const storeTotal = storeProducts.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
        );

        const formattedOrder = {
            id: order._id,
            orderNumber: order.orderNumber,
            customerName: order.user ? order.user.name : 'Unknown Customer',
            customerEmail: order.user ? order.user.email : 'Unknown Email',
            date: order.orderDate,
            status: order.orderStatus,
            paymentStatus: order.paymentStatus,
            total: storeTotal,
            products: storeProducts,
            shippingAddress: order.shippingAddress
        };

        res.status(200).json({
            success: true,
            data: formattedOrder
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching order details',
            error: error.message 
        });
    }
};

/**
 * Update order status
 * Only allows updating if the order contains products from the admin's store
 */
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const adminStore = req.adminStore;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid order ID' 
            });
        }

        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid status' 
            });
        }

        // Find order and check if it contains products from admin's store
        const order = await Order.findById(orderId)
            .populate({
                path: 'products.product',
                select: 'store'
            });

        if (!order) {
            return res.status(404).json({ 
                success: false,
                message: 'Order not found' 
            });
        }

        // Check if order contains any products from admin's store
        const hasStoreProducts = order.products.some(item => 
            item.product && item.product.store === adminStore
        );

        if (!hasStoreProducts) {
            return res.status(403).json({ 
                success: false,
                message: 'Access denied: This order does not contain products from your store' 
            });
        }

        // Update order status
        order.orderStatus = status;
        
        if (status === 'Delivered') {
            order.deliveryDate = new Date();
        }
        
        // If order is COD and delivered, mark as Paid
        if (status === 'Delivered' && order.paymentStatus === 'COD') {
            order.paymentStatus = 'Paid';
            
            // Settle the payment record in the ledger
            const BraintreePayment = require('../../models/user/BraintreePayment');
            const payment = await BraintreePayment.findOne({ order: order._id });
            if (payment) {
                payment.status = 'settled';
                await payment.save();
            }
        }
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: {
                id: order._id,
                orderNumber: order.orderNumber,
                status: order.orderStatus
            }
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error updating order status',
            error: error.message 
        });
    }
};

/**
 * Get order statistics for the admin's store
 * Returns counts of orders by status for the admin's store
 */
exports.getOrderStats = async (req, res) => {
    try {
        // Get the admin's store from middleware
        const adminStore = req.adminStore;
        
        if (!adminStore) {
            return res.status(400).json({ 
                success: false,
                message: 'Store information not found' 
            });
        }

        // Find all orders and populate product information
        const allOrders = await Order.find()
            .populate({
                path: 'products.product',
                select: 'store'
            });

        // Filter orders that contain products from the admin's store
        const storeOrders = allOrders.filter(order => {
            return order.products.some(item => 
                item.product && item.product.store === adminStore
            );
        });

        // Initialize statistics object
        const stats = {
            totalOrders: storeOrders.length,
            pendingOrders: 0,
            processingOrders: 0,
            shippedOrders: 0,
            deliveredOrders: 0,
            canceledOrders: 0
        };

        // Count orders by status
        storeOrders.forEach(order => {
            switch(order.orderStatus) {
                case 'Pending':
                    stats.pendingOrders++;
                    break;
                case 'Processing':
                    stats.processingOrders++;
                    break;
                case 'Shipped':
                    stats.shippedOrders++;
                    break;
                case 'Delivered':
                    stats.deliveredOrders++;
                    break;
                case 'Canceled':
                    stats.canceledOrders++;
                    break;
                default:
                    // If status is not one of the above, still count in total
                    break;
            }
        });

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching order statistics:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching order statistics',
            error: error.message 
        });
    }
};

/**
 * Get all return requests for the admin's store
 */
exports.getStoreReturns = async (req, res) => {
    try {
        const adminStore = req.adminStore;
        
        if (!adminStore) {
            return res.status(400).json({ 
                success: false,
                message: 'Store information not found' 
            });
        }

        const ReturnRequest = require('../../models/ReturnRequest');
        const returns = await ReturnRequest.find({ store: adminStore })
            .populate({
                path: 'product',
                select: 'name new_price image_url store'
            })
            .populate({
                path: 'order',
                select: 'orderNumber orderDate totalAmount shippingAddress'
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: returns.length,
            data: returns
        });
    } catch (error) {
        console.error('Error fetching store returns:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching returns',
            error: error.message 
        });
    }
};

/**
 * Update the status of a return request
 */
exports.updateReturnStatus = async (req, res) => {
    try {
        const { returnId } = req.params;
        const { status } = req.body;
        const adminStore = req.adminStore;

        if (!adminStore) {
            return res.status(400).json({ 
                success: false,
                message: 'Store information not found' 
            });
        }

        const validStatuses = ['Pending', 'Approved', 'Rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid status' 
            });
        }

        const ReturnRequest = require('../../models/ReturnRequest');
        const returnRequest = await ReturnRequest.findById(returnId);

        if (!returnRequest) {
            return res.status(404).json({ 
                success: false,
                message: 'Return request not found' 
            });
        }

        // Verify that the return request belongs to this admin's store
        if (returnRequest.store !== adminStore) {
            return res.status(403).json({ 
                success: false,
                message: 'Access denied: This return request belongs to another store' 
            });
        }

        returnRequest.status = status;
        await returnRequest.save();

        res.status(200).json({
            success: true,
            message: 'Return request status updated successfully',
            data: returnRequest
        });
    } catch (error) {
        console.error('Error updating return status:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error updating return request status',
            error: error.message 
        });
    }
};
