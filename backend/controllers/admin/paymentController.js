// Architect: SP
const BraintreePayment = require('../../models/user/BraintreePayment');
const Payment = require('../../models/Payment');
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
        let bpQuery = {};
        let pQuery = {};

        // Apply filters
        if (status) {
            bpQuery.status = status;
            if (status === 'settled') {
                pQuery.paymentStatus = 'Completed';
            } else if (status === 'authorized') {
                pQuery.paymentStatus = 'Pending';
            } else if (status === 'failed') {
                pQuery.paymentStatus = 'Failed';
            } else {
                pQuery.paymentStatus = status;
            }
        }
        if (fromDate || toDate) {
            bpQuery.createdAt = {};
            pQuery.paymentDate = {};
            if (fromDate) {
                bpQuery.createdAt.$gte = new Date(fromDate);
                pQuery.paymentDate.$gte = new Date(fromDate);
            }
            if (toDate) {
                bpQuery.createdAt.$lte = new Date(toDate);
                pQuery.paymentDate.$lte = new Date(toDate);
            }
        }

        console.log('Finding Braintree payments with query:', bpQuery);
        console.log('Finding Payment payments with query:', pQuery);

        // Find Braintree payments
        const bpPayments = await BraintreePayment.find(bpQuery)
            .populate('user', 'name email')
            .populate({
                path: 'order',
                populate: {
                    path: 'products.product',
                    select: 'name new_price image_url store'
                }
            })
            .lean();

        // Find Payment payments
        const pPayments = await Payment.find(pQuery)
            .populate('userId', 'name email')
            .populate({
                path: 'orderId',
                populate: {
                    path: 'products.product',
                    select: 'name new_price image_url store'
                }
            })
            .lean();

        // Format Payment payments to match BraintreePayment structure
        const formattedBp = bpPayments.map(p => ({
            ...p,
            createdAt: p.createdAt || p.paymentDate
        }));

        const formattedP = pPayments.map(p => ({
            _id: p._id,
            user: p.userId,
            order: p.orderId,
            orderNumber: p.orderId ? p.orderId.orderNumber : 'N/A',
            transactionId: p.transactionId,
            amount: p.amount,
            status: p.paymentStatus === 'Completed' ? 'settled' : 
                    p.paymentStatus === 'Pending' ? 'authorized' : 
                    p.paymentStatus === 'Failed' ? 'failed' : p.paymentStatus.toLowerCase(),
            paymentMethod: p.paymentMethod,
            createdAt: p.paymentDate,
            updatedAt: p.paymentDate,
            billingAddress: p.billingAddress
        }));

        // Merge both
        const allPayments = [...formattedBp, ...formattedP];

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

        // Sort chronologically (newest first)
        formattedPayments.sort((a, b) => new Date(b.date) - new Date(a.date));

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

        // Find all Braintree payments
        const bpPayments = await BraintreePayment.find()
            .populate({
                path: 'order',
                populate: {
                    path: 'products.product',
                    select: 'store price'
                }
            })
            .lean();

        // Find all Payment payments
        const pPayments = await Payment.find()
            .populate('userId', 'name email')
            .populate({
                path: 'orderId',
                populate: {
                    path: 'products.product',
                    select: 'store price'
                }
            })
            .lean();

        // Format Payment payments to match BraintreePayment structure
        const formattedBp = bpPayments.map(p => ({
            ...p,
            createdAt: p.createdAt || p.paymentDate
        }));

        const formattedP = pPayments.map(p => ({
            _id: p._id,
            user: p.userId,
            order: p.orderId,
            orderNumber: p.orderId ? p.orderId.orderNumber : 'N/A',
            transactionId: p.transactionId,
            amount: p.amount,
            status: p.paymentStatus === 'Completed' ? 'settled' : 
                    p.paymentStatus === 'Pending' ? 'authorized' : 
                    p.paymentStatus === 'Failed' ? 'failed' : p.paymentStatus.toLowerCase(),
            paymentMethod: p.paymentMethod,
            createdAt: p.paymentDate,
            updatedAt: p.paymentDate,
            billingAddress: p.billingAddress
        }));

        // Merge both
        const allPayments = [...formattedBp, ...formattedP];

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
        let payment = await BraintreePayment.findById(paymentId)
            .populate('user', 'name email')
            .populate({
                path: 'order',
                populate: {
                    path: 'products.product',
                    select: 'name new_price image_url store'
                }
            })
            .lean();

        if (!payment) {
            // Check in Payment
            const pPayment = await Payment.findById(paymentId)
                .populate('userId', 'name email')
                .populate({
                    path: 'orderId',
                    populate: {
                        path: 'products.product',
                        select: 'name new_price image_url store'
                    }
                })
                .lean();

            if (pPayment) {
                payment = {
                    _id: pPayment._id,
                    user: pPayment.userId,
                    order: pPayment.orderId,
                    orderNumber: pPayment.orderId ? pPayment.orderId.orderNumber : 'N/A',
                    transactionId: pPayment.transactionId,
                    amount: pPayment.amount,
                    status: pPayment.paymentStatus === 'Completed' ? 'settled' : 
                            pPayment.paymentStatus === 'Pending' ? 'authorized' : 
                            pPayment.paymentStatus === 'Failed' ? 'failed' : pPayment.paymentStatus.toLowerCase(),
                    paymentMethod: pPayment.paymentMethod,
                    createdAt: pPayment.paymentDate,
                    updatedAt: pPayment.paymentDate,
                    billingAddress: pPayment.billingAddress
                };
            }
        }

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
            date: payment.createdAt || payment.paymentDate,
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
