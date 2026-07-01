// Architect: SP
require('dotenv').config();
const mongoose = require('mongoose');

// Get MongoDB connection string from .env
const MONGO_URI = process.env.MONGO_URI;

// Import models directly
const Order = require('../../models/user/Order');
const productSchema = require('../../models/Product').schema;
const Product = mongoose.model('Product', productSchema);

async function updateOrderStatuses() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected successfully');
        
        console.log('Finding orders with Siragugal products...');
        // Find all orders that have products from Siragugal store
        const allOrders = await Order.find()
            .populate({
                path: 'products.product',
                select: 'name store'
            });
        
        console.log(`Found ${allOrders.length} total orders`);
        
        // Filter orders with Siragugal products
        const siragugalOrders = allOrders.filter(order => {
            return order.products.some(item => 
                item.product && item.product.store === 'siragugal'
            );
        });
        
        console.log(`Found ${siragugalOrders.length} orders with Siragugal products`);
        
        // Filter orders with Vaagai products
        const vaagaiOrders = allOrders.filter(order => {
            return order.products.some(item => 
                item.product && item.product.store === 'vaagai'
            );
        });
        
        console.log(`Found ${vaagaiOrders.length} orders with Vaagai products`);
        
        // Update Siragugal orders with different statuses
        const statuses = ['Pending', 'Processing', 'Delivered', 'Canceled'];
        
        // Update Siragugal orders
        for (let i = 0; i < siragugalOrders.length; i++) {
            const order = siragugalOrders[i];
            // Use modulo to cycle through statuses
            const statusIndex = i % statuses.length;
            const newStatus = statuses[statusIndex];
            
            console.log(`Updating Siragugal order ${order._id} status to ${newStatus}...`);
            
            order.orderStatus = newStatus;
            await order.save();
            
            console.log(`✓ Order ${order._id} updated to ${newStatus}`);
            
            // Add a small delay between updates
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Update Vaagai orders
        for (let i = 0; i < vaagaiOrders.length; i++) {
            const order = vaagaiOrders[i];
            // Use a different pattern for Vaagai orders to distribute statuses differently
            const statusIndex = (i + 2) % statuses.length;
            const newStatus = statuses[statusIndex];
            
            console.log(`Updating Vaagai order ${order._id} status to ${newStatus}...`);
            
            order.orderStatus = newStatus;
            await order.save();
            
            console.log(`✓ Order ${order._id} updated to ${newStatus}`);
            
            // Add a small delay between updates
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log('\nCompleted updating order statuses!');
        console.log('\nNow you can test the Orders component in the admin dashboard to see the orders for each store.');
        
    } catch (error) {
        console.error('\nError updating order statuses:', error.message);
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
console.log('Starting Order Status Update Script for Multiple Stores...\n');
updateOrderStatuses().then(() => {
    console.log('Script completed');
    process.exit(0);
}).catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
});
