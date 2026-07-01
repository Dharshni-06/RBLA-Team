// Architect: SP
const BraintreePayment = require('../../models/user/BraintreePayment');
const Order = require('../../models/user/Order');
const mongoose = require('mongoose');

/**
 * Get all payments for the admin's store
 * This is done by:
 * 1. Finding all payments
 * 2. Populating the order and its products
 * 3. Filtering payments for orders that contain products from the admin's store
 */
exports.getStorePayments = async (req, res) => {
    try {
        // Get the admin's store from middleware
        const adminStore = req.adminStore;
        
        console.log('Admin store:', adminStore);
        
        if (!adminStore) {
            return res.status(400).json({ 
                success: false,
                message: 'Store information not found' 
            });
        }

        // Get filter parameters
        const { status, fromDate, toDate } = req.query;
        let query = {};

        // Apply filters
        if (status) {
            query.status = status;
        }
        if (fromDate || toDate) {
            query.createdAt = {};
            if (fromDate) query.createdAt.$gte = new Date(fromDate);
            if (toDate) query.createdAt.$lte = new Date(toDate);
        }

        console.log('Finding payments with query:', query);

        // Find all payments and populate order information
        const allPayments = await BraintreePayment.find(query)
            .populate('user', 'name email')
            .populate({
                path: 'order',
                populate: {
                    path: 'products.product',
                    select: 'name new_price image_url store'
                }
            })
            .sort({ createdAt: -1 });

        console.log(`Found ${allPayments.length} total payments`);

        // Filter payments for orders that contain products from the admin's store
        const storePayments = allPayments.filter(payment => {
            if (!payment.order || !payment.order.products) {
                console.log(`Payment ${payment._id} has no order or products`);
                return false;
            }
            
            // Check if any product in the order belongs to the admin's store
            const hasStoreProduct = payment.order.products.some(item => 
                item.product && item.product.store === adminStore
            );
            
            if (!hasStoreProduct) {
                console.log(`Payment ${payment._id} has no products from store ${adminStore}`);
            }
            
            return hasStoreProduct;
        });

        console.log(`Filtered to ${storePayments.length} payments for store ${adminStore}`);

        // Format the response data
        const formattedPayments = storePayments.map(payment => {
            // Calculate store's portion of payment amount
            let storeTotal = 0;
            let storeProducts = [];

            if (payment.order && payment.order.products) {
                // Filter products that belong to this admin's store
                storeProducts = payment.order.products.filter(item => 
                    item.product && item.product.store === adminStore
                );
                
                // Calculate total amount for store's products
                storeTotal = storeProducts.reduce((total, item) => {
                    return total + (item.price * item.quantity);
                }, 0);
            }

            return {
                id: payment._id,
                transactionId: payment.transactionId,
                orderNumber: payment.order?.orderNumber || 'N/A',
                customerName: payment.user?.name || 'Unknown',
                date: payment.createdAt,
                amount: payment.amount,
                storeAmount: storeTotal,
                paymentMethod: payment.paymentMethod || 'Braintree',
                status: payment.status,
                order: payment.order
            };
        });

        res.status(200).json({
            success: true,
            count: formattedPayments.length,
            data: formattedPayments
        });
    } catch (error) {
        console.error('Error fetching store payments:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching payments',
            error: error.message 
        });
    }
};

/**
 * Get payment statistics for the admin's store
 */
exports.getPaymentStats = async (req, res) => {
    try {
        const adminStore = req.adminStore;
        
        console.log('Getting payment stats for store:', adminStore);
        
        if (!adminStore) {
            return res.status(400).json({ 
                success: false,
                message: 'Store information not found' 
            });
        }

        // Find all payments and populate order information
        const allPayments = await BraintreePayment.find()
            .populate({
                path: 'order',
                populate: {
                    path: 'products.product',
                    select: 'store price'
                }
            });

        console.log(`Found ${allPayments.length} total payments for stats`);

        // Filter payments for orders that contain products from the admin's store
        const storePayments = allPayments.filter(payment => {
            if (!payment.order || !payment.order.products) {
                console.log(`Stats: Payment ${payment._id} has no order or products`);
                return false;
            }
            
            // Check if any product in the order belongs to the admin's store
            const hasStoreProduct = payment.order.products.some(item => 
                item.product && item.product.store === adminStore
            );
            
            if (!hasStoreProduct) {
                console.log(`Stats: Payment ${payment._id} has no products from store ${adminStore}`);
            }
            
            return hasStoreProduct;
        });

        console.log(`Filtered to ${storePayments.length} payments for stats for store ${adminStore}`);

        // Calculate total revenue for the store
        let totalRevenue = 0;
        storePayments.forEach(payment => {
            if (payment.order && payment.order.products) {
                // Filter products that belong to this admin's store
                const storeProducts = payment.order.products.filter(item => 
                    item.product && item.product.store === adminStore
                );
                
                // Calculate total amount for store's products
                const storeTotal = storeProducts.reduce((total, item) => {
                    return total + (item.price * item.quantity);
                }, 0);
                
                totalRevenue += storeTotal;
            }
        });

        // Calculate statistics
        const totalPayments = storePayments.length;
        const authorizedPayments = storePayments.filter(payment => payment.status === 'authorized').length;
        const settledPayments = storePayments.filter(payment => payment.status === 'settled').length;
        const failedPayments = storePayments.filter(payment => payment.status === 'failed').length;
        const voidedPayments = storePayments.filter(payment => payment.status === 'voided').length;

        return res.status(200).json({
            success: true,
            data: {
                totalPayments,
                authorizedPayments,
                settledPayments,
                failedPayments,
                voidedPayments,
                totalRevenue
            }
        });
    } catch (error) {
        console.error('Error fetching payment statistics:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching payment statistics',
            error: error.message 
        });
    }
};

/**
 * @desc    Get a specific payment by ID for the admin's store
 * @route   GET /api/admin/payments/:id
 * @access  Private/Admin
 */
exports.getStorePayment = async (req, res) => {
    try {
        const adminStore = req.adminStore;
        const paymentId = req.params.id;
        
        if (!adminStore) {
            return res.status(400).json({ 
                success: false,
                message: 'Store information not found' 
            });
        }

        // Find payment by ID and populate order information
        const payment = await BraintreePayment.findById(paymentId)
            .populate('user', 'name email')
            .populate({
                path: 'order',
                populate: {
                    path: 'products.product',
                    select: 'name new_price image_url store'
                }
            });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Check if payment is related to admin's store
        if (!payment.order || !payment.order.products) {
            return res.status(404).json({
                success: false,
                message: 'Payment order information not found'
            });
        }

        // Check if any product in the order belongs to the admin's store
        const hasStoreProduct = payment.order.products.some(item => 
            item.product && item.product.store === adminStore
        );

        if (!hasStoreProduct) {
            return res.status(403).json({
                success: false,
                message: 'Payment not associated with your store'
            });
        }

        // Calculate store's portion of payment amount
        let storeTotal = 0;
        let storeProducts = [];

        if (payment.order && payment.order.products) {
            // Filter products that belong to this admin's store
            storeProducts = payment.order.products.filter(item => 
                item.product && item.product.store === adminStore
            );
            
            // Calculate total amount for store's products
            storeTotal = storeProducts.reduce((total, item) => {
                return total + (item.price * item.quantity);
            }, 0);
        }

        // Format the response data
        const formattedPayment = {
            id: payment._id,
            transactionId: payment.transactionId,
            orderNumber: payment.order?.orderNumber || 'N/A',
            customerName: payment.user?.name || 'Unknown',
            customerEmail: payment.user?.email || 'Unknown Email',
            date: payment.createdAt,
            amount: payment.amount,
            storeAmount: storeTotal,
            status: payment.status,
            paymentMethod: payment.paymentMethod || 'Braintree',
            orderStatus: payment.order.orderStatus,
            order: payment.order
        };

        res.status(200).json({
            success: true,
            data: formattedPayment
        });
    } catch (error) {
        console.error('Error fetching store payment:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching payment',
            error: error.message 
        });
    }
};
