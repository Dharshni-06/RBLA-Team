// Architect: SP
const mongoose = require('mongoose');

// admin module categories/ products 
// Import models and schemas
const productSchema = require('./Product').schema;
const Category = require('./category');
const Order = require('./user/Order');
const Review = require('./user/Review');
const User = require('./user/User');
const ReturnRequest = require('./ReturnRequest');

// Create and export models
module.exports = {
    Product: mongoose.model('Product', productSchema),
    Category: Category,
    Order: Order,
    Review: Review,
    User: User,
    ReturnRequest: ReturnRequest
};
// this is the index file for the admin user
// like the manager file for the cateogeries in the products file 
// 
