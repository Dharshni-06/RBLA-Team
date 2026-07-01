// Architect: SP
const mongoose = require('mongoose');

const braintreePaymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    orderNumber: {
        type: String,
        required: true
    },
    transactionId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['authorized', 'settled', 'failed', 'voided'],
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BraintreePayment', braintreePaymentSchema);
