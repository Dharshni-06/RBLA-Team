// Architect: SP
require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');

// Get MongoDB connection string from .env
const MONGO_URI = process.env.MONGO_URI;

// Import models
const Product = require('../../models/Product');
const Order = require('../../models/user/Order');
const User = require('../../models/user/User');
const BraintreePayment = require('../../models/user/BraintreePayment');

// Helper function to generate random order number
const generateOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${timestamp}-${random}`;
};

// Helper function to generate random transaction ID
const generateTransactionId = () => {
    return crypto.randomBytes(12).toString('hex');
};

// Helper function to get random item from array
const getRandomItem = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

// Helper function to get random quantity
const getRandomQuantity = (min = 1, max = 5) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Helper function to get random date within the last 30 days
const getRandomDate = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const randomTime = thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime());
    return new Date(randomTime);
};

// Helper function to get random payment method
const getRandomPaymentMethod = () => {
    const methods = ['credit_card', 'paypal', 'google_pay', 'apple_pay'];
    return getRandomItem(methods);
};

// Helper function to get random payment status
const getRandomPaymentStatus = () => {
    const statuses = ['settled', 'authorized', 'failed', 'voided'];
    const weights = [0.7, 0.15, 0.1, 0.05]; // 70% settled, 15% authorized, 10% failed, 5% voided
    
    const random = Math.random();
    let cumulativeWeight = 0;
    
    for (let i = 0; i < statuses.length; i++) {
        cumulativeWeight += weights[i];
        if (random < cumulativeWeight) {
            return statuses[i];
        }
    }
    
    return 'settled'; // Default to settled
};

// Main function to create orders and payments
async function createOrdersWithPayments() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected successfully');
        
        // Find products from each store
        console.log('Finding products from all stores...');
        
        // Find Varnam products (using Cupcoaster as search term)
        const varnamProducts = await Product.find({ 
            name: { $regex: 'Cupcoaster', $options: 'i' },
            store: 'varnam'
        }).limit(5);
        
        if (varnamProducts.length === 0) {
            console.log('No Varnam products found. Please check the database.');
        } else {
            console.log(`Found ${varnamProducts.length} Varnam products`);
        }
        
        // Find Siragugal products (using Cupcoaster as search term)
        const siragugalProducts = await Product.find({ 
            name: { $regex: 'Cupcoaster', $options: 'i' },
            store: 'siragugal'
        }).limit(5);
        
        if (siragugalProducts.length === 0) {
            console.log('No Siragugal products found. Please check the database.');
        } else {
            console.log(`Found ${siragugalProducts.length} Siragugal products`);
        }
        
        // Find Vaagai products (using Towel as search term)
        const vaagaiProducts = await Product.find({ 
            name: { $regex: 'Towel', $options: 'i' },
            store: 'vaagai'
        }).limit(5);
        
        if (vaagaiProducts.length === 0) {
            console.log('No Vaagai products found. Please check the database.');
        } else {
            console.log(`Found ${vaagaiProducts.length} Vaagai products`);
        }
        
        // Find users to associate with orders
        console.log('Finding users...');
        const users = await User.find({}).limit(10);
        
        if (users.length === 0) {
            console.log('No users found. Please check the database.');
            return;
        }
        
        console.log(`Found ${users.length} users`);
        
        // Create orders with products from all three stores
        console.log('\nCreating orders with products from all three stores...');
        
        const orderStatuses = ['Pending', 'Processing', 'Delivered', 'Canceled'];
        const totalOrders = 15; // Create 15 orders (5 for each store combination)
        
        const createdOrders = [];
        
        for (let i = 0; i < totalOrders; i++) {
            const user = getRandomItem(users);
            const orderDate = getRandomDate();
            
            // Create a mixed order with products from all three stores
            const orderProducts = [];
            
            // Add a Varnam product
            if (varnamProducts.length > 0) {
                const varnamProduct = getRandomItem(varnamProducts);
                const quantity = getRandomQuantity();
                orderProducts.push({
                    product: varnamProduct._id,
                    quantity: quantity,
                    price: varnamProduct.new_price
                });
            }
            
            // Add a Siragugal product
            if (siragugalProducts.length > 0) {
                const siragugalProduct = getRandomItem(siragugalProducts);
                const quantity = getRandomQuantity();
                orderProducts.push({
                    product: siragugalProduct._id,
                    quantity: quantity,
                    price: siragugalProduct.new_price
                });
            }
            
            // Add a Vaagai product
            if (vaagaiProducts.length > 0) {
                const vaagaiProduct = getRandomItem(vaagaiProducts);
                const quantity = getRandomQuantity();
                orderProducts.push({
                    product: vaagaiProduct._id,
                    quantity: quantity,
                    price: vaagaiProduct.new_price
                });
            }
            
            // Calculate total amount
            const totalAmount = orderProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            // Create order
            const orderNumber = generateOrderNumber();
            const orderStatus = getRandomItem(orderStatuses);
            
            const order = new Order({
                orderNumber: orderNumber,
                user: user._id,
                products: orderProducts,
                totalAmount: totalAmount,
                orderStatus: orderStatus,
                paymentStatus: 'Unpaid', // Will be updated after payment creation
                orderDate: orderDate,
                shippingAddress: {
                    fullName: user.name,
                    address: '123 Main St',
                    city: 'Chennai',
                    state: 'Tamil Nadu',
                    pincode: '600001',
                    phone: '9876543210'
                }
            });
            
            await order.save();
            createdOrders.push(order);
            
            console.log(`✓ Created order #${i+1}: ${orderNumber} with products from all three stores for user ${user.name}`);
        }
        
        // Create payments for the orders
        console.log('\nCreating payments for the orders...');
        
        for (const order of createdOrders) {
            // 70% chance of creating a payment for the order
            if (Math.random() < 0.7) {
                const paymentStatus = getRandomPaymentStatus();
                
                // Create payment
                const payment = new BraintreePayment({
                    user: order.user,
                    order: order._id,
                    orderNumber: order.orderNumber,
                    transactionId: generateTransactionId(),
                    amount: order.totalAmount,
                    status: paymentStatus,
                    paymentMethod: getRandomPaymentMethod(),
                    createdAt: order.orderDate,
                    updatedAt: order.orderDate
                });
                
                await payment.save();
                
                // Update order payment status based on payment status
                if (paymentStatus === 'settled' || paymentStatus === 'authorized') {
                    order.paymentStatus = 'Paid';
                    
                    // If order status is 'Pending', update it to 'Processing'
                    if (order.orderStatus === 'Pending') {
                        order.orderStatus = 'Processing';
                    }
                    
                    await order.save();
                }
                
                console.log(`✓ Created payment for order ${order.orderNumber} with status ${paymentStatus}`);
            } else {
                console.log(`✓ Skipped payment creation for order ${order.orderNumber}`);
            }
        }
        
        console.log('\nCompleted creating orders and payments!');
        console.log('\nNow you can test the Orders and Payments components in the admin dashboard.');
        
    } catch (error) {
        console.error('\nError creating orders and payments:', error.message);
        if (error.stack) {
            console.error(error.stack);
        }
    } finally {
        // Close the database connection
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log('Database connection closed');
        }
    }
}

// Run the script
console.log('Starting Order and Payment Creation Script...\n');
createOrdersWithPayments().then(() => {
    console.log('Script completed');
    process.exit(0);
}).catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
});
