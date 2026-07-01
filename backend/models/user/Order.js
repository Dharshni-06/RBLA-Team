// Architect: SP
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        }
    }],
    orderStatus: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled'],
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Unpaid', 'COD'],
        default: 'Unpaid'
    },
    totalAmount: {
        type: Number,
        required: true
    },
    shippingAddress: {
        fullName: String,
        address: String,
        city: String,
        state: String,
        pincode: String,
        phone: String
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    deliveryDate: {
        type: Date
    }
}, {
    timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
    if (!this.orderNumber) {
        // Get the latest order to generate next order number
        const latestOrder = await this.constructor.findOne({}, {}, { sort: { 'createdAt': -1 } });
        
        // Generate order number: RBLA followed by 6-digit number
        let nextNumber = '000001';
        if (latestOrder && latestOrder.orderNumber) {
            const lastNumber = parseInt(latestOrder.orderNumber.slice(-6));
            nextNumber = String(lastNumber + 1).padStart(6, '0');
        }
        
        this.orderNumber = `RBLA${nextNumber}`;
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
