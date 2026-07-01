// Architect: SP
const mongoose = require('mongoose');
// this is the product model for the admin its for the crud of the products
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    new_price: {
        type: Number,
        required: true,
    },
    old_price: {
        type: Number,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
        min: [0, 'Stock quantity cannot be negative'],
    },
    category: {  
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category',
        required: true,
    },
    store: {
        type: String,
        required: true,
        enum: ['entrepreneur 1', 'entrepreneur 3', 'entrepreneur 2']
    },
    size: {
        breadth: { type: Number, required: true },
        height: { type: Number, required: true },
    },
    images: [{
        type: String,  
    }],
    image_url: { 
        type: String,  
        required: true  
    },
    isActive: {
        type: Boolean,
        default: true,  
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Product', productSchema);
