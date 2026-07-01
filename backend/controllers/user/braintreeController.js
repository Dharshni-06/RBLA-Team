// Architect: SP
const gateway = require('../../utils/user/braintreeConfig');
const BraintreePayment = require('../../models/user/BraintreePayment');
const Order = require('../../models/user/Order');

const braintreeController = {
    // Generate a client token
    generateToken: async (req, res) => {
        try {
            console.log('Generating client token...');
            const result = await gateway.clientToken.generate();
            
            if (result && result.clientToken) {
                console.log('Token generated successfully');
                return res.json({
                    success: true,
                    clientToken: result.clientToken
                });
            }
            
            throw new Error('Failed to generate client token');
        } catch (error) {
            console.error('Token generation error:', {
                name: error.name,
                message: error.message,
                code: error.code,
                type: error.type,
                stack: error.stack
            });
            
            res.status(500).json({
                success: false,
                error: 'Could not generate token',
                details: error.message
            });
        }
    },

    // Process payment for an order
    processPayment: async (req, res) => {
        try {
            const { nonce, orderId } = req.body;
            console.log('Processing payment for order:', orderId);
            console.log('Payment nonce:', nonce ? 'Present' : 'Missing');
            
            if (!nonce || !orderId) {
                return res.status(400).json({
                    success: false,
                    error: 'Payment nonce and order ID are required'
                });
            }

            // 1. Find the order
            const order = await Order.findById(orderId);
            if (!order) {
                return res.status(404).json({
                    success: false,
                    error: 'Order not found'
                });
            }

            // 2. Verify order belongs to user
            if (order.user.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    error: 'Unauthorized access to order'
                });
            }

            // 3. Check if order is already paid
            if (order.paymentStatus === 'Paid') {
                return res.status(400).json({
                    success: false,
                    error: 'Order is already paid'
                });
            }

            console.log('Processing transaction for amount:', order.totalAmount);

            // 4. Create transaction with order amount
            const result = await gateway.transaction.sale({
                amount: order.totalAmount.toString(),
                paymentMethodNonce: nonce,
                orderId: order.orderNumber,
                options: {
                    submitForSettlement: true
                }
            });

            console.log('Transaction result:', result.success ? 'Success' : 'Failed');

            if (result.success) {
                // 5. Save payment details
                const payment = new BraintreePayment({
                    user: req.user._id,
                    order: order._id,
                    orderNumber: order.orderNumber,
                    transactionId: result.transaction.id,
                    amount: order.totalAmount,
                    status: 'settled',
                    paymentMethod: result.transaction.paymentInstrumentType
                });
                await payment.save();

                // 6. Update order status
                order.paymentStatus = 'Paid';
                order.orderStatus = 'Processing';
                await order.save();

                console.log('Payment recorded and order updated');

                res.json({
                    success: true,
                    transaction: {
                        id: result.transaction.id,
                        status: result.transaction.status,
                        amount: result.transaction.amount
                    },
                    order: {
                        orderNumber: order.orderNumber,
                        status: order.orderStatus,
                        paymentStatus: order.paymentStatus
                    }
                });
            } else {
                console.error('Transaction failed:', result.message);
                res.status(400).json({
                    success: false,
                    error: result.message || 'Payment failed'
                });
            }
        } catch (error) {
            console.error('Payment processing error:', {
                name: error.name,
                message: error.message,
                code: error.code,
                type: error.type,
                stack: error.stack
            });
            
            res.status(500).json({
                success: false,
                error: 'Payment processing failed',
                details: error.message
            });
        }
    },

    // Get payment history with order details
    getPaymentHistory: async (req, res) => {
        try {
            console.log('Fetching payment history for user:', req.user._id);
            const payments = await BraintreePayment.find({ user: req.user._id })
                .populate('order', 'orderNumber orderStatus totalAmount orderDate')
                .sort({ createdAt: -1 });
            
            console.log('Found payments:', payments.length);
            res.json({
                success: true,
                data: payments
            });
        } catch (error) {
            console.error('Error fetching payment history:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching payment history',
                details: error.message
            });
        }
    }
};

module.exports = braintreeController;
