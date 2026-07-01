// Architect: SP
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Create model using schema
const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
// category for the creatiion of the products in the admin module 
