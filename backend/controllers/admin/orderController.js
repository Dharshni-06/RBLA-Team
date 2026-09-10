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
            .populate('products.product', 'name new_price image_url store')
            .populate('user', 'name email')
            .sort({ orderDate: -1 });

        // Get store details for the current admin store
        const Store = require('../../models/Store');
        const storeDoc = await Store.findOne({ 
            name: { $regex: new RegExp(`^${adminStore.trim()}$`, 'i') } 
        });
        const storeInfo = storeDoc ? { name: storeDoc.name, location: storeDoc.location, owner: storeDoc.owner } : { name: adminStore, location: 'Store Location' };

        // Filter orders that contain products from the admin's store
        const storeOrders = allOrders.filter(order => {
            // Check if any product in the order belongs to the admin's store
            return order.products && order.products.some(item => 
                item.product && typeof item.product.store === 'string' && item.product.store.toLowerCase() === adminStore.toLowerCase()
            );
        });

        // Format the response data
        const formattedOrders = storeOrders.map(order => {
            // Filter products to only include those from admin's store
            const storeProducts = (order.products || []).filter(item => 
                item.product && typeof item.product.store === 'string' && item.product.store.toLowerCase() === adminStore.toLowerCase()
            ).map(item => {
                const itemObj = item.toObject ? item.toObject() : { ...item };
                if (itemObj.product) {
                    itemObj.product = {
                        ...itemObj.product,
                        storeDetails: storeInfo
                    };
                }
                return itemObj;
            });
            
            // Calculate store-specific total
            const storeTotal = storeProducts.reduce((sum, item) => 
                sum + ((item.price || 0) * (item.quantity || 1)), 0
            );

            const rawAddr = order.shippingAddress || {};
            const cleanShippingAddress = {
                fullName: rawAddr.fullName || rawAddr.name || (order.user ? order.user.name : null) || 'Customer',
                name: rawAddr.name || rawAddr.fullName || (order.user ? order.user.name : null) || 'Customer',
                address: rawAddr.address || 'Address on file',
                city: rawAddr.city || '',
                state: rawAddr.state || '',
                postalCode: rawAddr.postalCode || rawAddr.pincode || '',
                pincode: rawAddr.pincode || rawAddr.postalCode || '',
                country: rawAddr.country || 'India',
                phone: rawAddr.phone || (order.user ? order.user.phoneNumber : '') || ''
            };

            return {
                id: order._id,
                orderNumber: order.orderNumber,
                customerName: order.user ? order.user.name : 'Unknown Customer',
                customerEmail: order.user ? order.user.email : 'Unknown Email',
                date: order.orderDate || order.orderedDate || order.createdAt,
                status: order.orderStatus,
                paymentStatus: order.paymentStatus,
                total: storeTotal,
                products: storeProducts,
                shippingAddress: cleanShippingAddress,
                cancelReason: order.cancelReason,
                store: storeInfo,
                storeName: adminStore
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
            .populate('products.product', 'name new_price image_url store')
            .populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        // Get store details
        const Store = require('../../models/Store');
        const storeDoc = await Store.findOne({ 
            name: { $regex: new RegExp(`^${adminStore.trim()}$`, 'i') } 
        });
        const storeInfo = storeDoc ? { name: storeDoc.name, location: storeDoc.location, owner: storeDoc.owner } : { name: adminStore, location: 'Store Location' };

        // Check if order contains any products from admin's store
        const hasStoreProducts = order.products && order.products.some(item => 
            item.product && typeof item.product.store === 'string' && item.product.store.toLowerCase() === adminStore.toLowerCase()
        );

        if (!hasStoreProducts) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied: This order does not contain products from your store' 
            });
        }

        // Filter products to only include those from admin's store
        const storeProducts = (order.products || []).filter(item => 
            item.product && typeof item.product.store === 'string' && item.product.store.toLowerCase() === adminStore.toLowerCase()
        ).map(item => {
            const itemObj = item.toObject ? item.toObject() : { ...item };
            if (itemObj.product) {
                itemObj.product = {
                    ...itemObj.product,
                    storeDetails: storeInfo
                };
            }
            return itemObj;
        });
        
        // Calculate store-specific total
        const storeTotal = storeProducts.reduce((sum, item) => 
            sum + ((item.price || 0) * (item.quantity || 1)), 0
        );

        const rawAddr = order.shippingAddress || {};
        const cleanShippingAddress = {
            fullName: rawAddr.fullName || rawAddr.name || (order.user ? order.user.name : null) || 'Customer',
            name: rawAddr.name || rawAddr.fullName || (order.user ? order.user.name : null) || 'Customer',
            address: rawAddr.address || 'Address on file',
            city: rawAddr.city || '',
            state: rawAddr.state || '',
            postalCode: rawAddr.postalCode || rawAddr.pincode || '',
            pincode: rawAddr.pincode || rawAddr.postalCode || '',
            country: rawAddr.country || 'India',
            phone: rawAddr.phone || (order.user ? order.user.phoneNumber : '') || ''
        };

        const formattedOrder = {
            id: order._id,
            orderNumber: order.orderNumber,
            customerName: order.user ? order.user.name : 'Unknown Customer',
            customerEmail: order.user ? order.user.email : 'Unknown Email',
            date: order.orderDate || order.orderedDate || order.createdAt,
            status: order.orderStatus,
            paymentStatus: order.paymentStatus,
            total: storeTotal,
            products: storeProducts,
            shippingAddress: cleanShippingAddress,
            cancelReason: order.cancelReason,
            store: storeInfo,
            storeName: adminStore
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

        const oldStatus = order.orderStatus;

        if (status === 'Canceled') {
            const orderService = require('../../services/orderService');
            const updatedOrder = await orderService.cancelOrder(orderId, req.body.reason || 'Canceled by Store Admin');
            return res.status(200).json({
                success: true,
                message: 'Order status updated successfully',
                data: {
                    id: updatedOrder._id,
                    orderNumber: updatedOrder.orderNumber,
                    status: updatedOrder.orderStatus
                }
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

        // Handle Admin cancellation (stock restoration & refund)
        if (status === 'Canceled' && oldStatus !== 'Canceled' && oldStatus !== 'Cancelled') {
            try {
                const productService = require('../../services/productService');
                await productService.restoreProductStock(order.products);
                
                if (order.paymentStatus === 'Paid') {
                    const { processRefund } = require('../../utils/refundHelper');
                    await processRefund(order, order.totalAmount);
                }

                // Load details for cancellation email
                const populatedOrder = await Order.findById(order._id).populate('user').populate('products.product');
                if (populatedOrder && populatedOrder.user && populatedOrder.user.email) {
                    const { sendOrderCancellationEmail } = require('../../utils/email');
                    sendOrderCancellationEmail(populatedOrder.user.email, populatedOrder, req.body.reason || 'Cancelled by store administrator').catch(err => {
                        console.error('Failed to send admin cancellation email:', err);
                    });
                }
            } catch (err) {
                console.error('Error handling admin order cancellation side-effects:', err);
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

        // If return is being approved, process refund and restore stock
        if (status === 'Approved' && returnRequest.status !== 'Approved') {
            const orderService = require('../../services/orderService');
            await orderService.approveReturnRequest(returnRequest);
        }

        returnRequest.status = status;
        
        // If return is approved, process the refund
        if (status === 'Approved') {
            try {
                // Find order
                const order = await Order.findById(returnRequest.order);
                if (order) {
                    // Find product price in order items/products
                    const returnProduct = returnRequest.product.toString();
                    const orderItem = order.products.find(p => p.product && p.product.toString() === returnProduct);
                    const refundAmount = orderItem ? (orderItem.price * orderItem.quantity) : 0;
                    
                    const { processRefund } = require('../../utils/refundHelper');
                    await processRefund(order, refundAmount);
                }
            } catch (refundErr) {
                console.error('Error during refund processing block:', refundErr);
            }
        }
        
        await returnRequest.save();

        // Send return status update email asynchronously
        try {
            const populatedReturn = await ReturnRequest.findById(returnRequest._id)
                .populate('product')
                .populate('order');
            if (populatedReturn && populatedReturn.email) {
                const { sendReturnStatusUpdateEmail } = require('../../utils/email');
                sendReturnStatusUpdateEmail(
                    populatedReturn.email, 
                    populatedReturn, 
                    populatedReturn.product, 
                    populatedReturn.order
                ).catch(err => {
                    console.error('Failed to send return status update email:', err);
                });
            }
        } catch (emailErr) {
            console.error('Failed to fetch and send return status update email:', emailErr);
        }

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

/**
 * Delete an order
 * Only allows deleting if the order contains products from the admin's store
 */
exports.deleteStoreOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const adminStore = req.adminStore;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid order ID' 
            });
        }

        const order = await Order.findById(orderId).populate({
            path: 'products.product',
            select: 'store'
        });

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        // Verify that the order has products from the admin's store
        const hasStoreProducts = order.products && order.products.some(item => 
            item.product && typeof item.product.store === 'string' && item.product.store.toLowerCase() === adminStore.toLowerCase()
        );

        if (!hasStoreProducts) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied: You can only delete orders containing products from your store' 
            });
        }

        // Delete the order
        await Order.findByIdAndDelete(orderId);

        res.status(200).json({ 
            success: true, 
            message: 'Order deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting store order:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting order', 
            error: error.message 
        });
    }
};
