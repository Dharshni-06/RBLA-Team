// Architect: SP
const router = require('express').Router();
const braintreeController = require('../../controllers/user/braintreeController');
const auth = require('../../middleware/user/auth');

// Generate client token for Braintree
router.get('/token', auth, braintreeController.generateToken);

// Process payment
router.post('/payment', auth, braintreeController.processPayment);

// Get payment history
router.get('/history', auth, braintreeController.getPaymentHistory);

module.exports = router;
