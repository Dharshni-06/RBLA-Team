// Architect: SP
require('dotenv').config();
const mongoose = require('mongoose');

// Get MongoDB connection string from .env
const MONGO_URI = process.env.MONGO_URI;

// Import models directly
const productSchema = require('../../models/Product').schema;
const Product = mongoose.model('Product', productSchema);
const Order = require('../../models/user/Order');

async function updateOrderStatuses() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected successfully');
        
        console.log('Finding orders with Varnam products...');
        
        // Find all orders
        const orders = await Order.find()
            .populate({
                path: 'products.product',
                select: 'name store'
            });
            
        console.log(`Found ${orders.length} total orders`);
        
        // Filter orders with Varnam products
        const varnamOrders = orders.filter(order => 
            order.products.some(item => 
                item.product && item.product.store === 'varnam'
            )
        );
        
        console.log(`Found ${varnamOrders.length} orders with Varnam products`);
        
        if (varnamOrders.length === 0) {
            console.log('No Varnam orders found. Please run the testCreateOrder.js script first.');
            process.exit(0);
        }
        
        // Possible order statuses
        const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled'];
        
        // Update each order with a random status
        for (let i = 0; i < varnamOrders.length; i++) {
            const order = varnamOrders[i];
            
            // Skip orders that are already canceled
            if (order.orderStatus === 'Canceled') {
                console.log(`Order ${order._id} is already Canceled, skipping...`);
                continue;
            }
            
            // Randomly select a status, but ensure we have a mix of all statuses
            // For the first few orders, assign each status once
            const statusIndex = i < statuses.length ? i % statuses.length : Math.floor(Math.random() * statuses.length);
            const newStatus = statuses[statusIndex];
            
            console.log(`Updating order ${order._id} status to ${newStatus}...`);
            
            try {
                // Update directly in the database
                await Order.findByIdAndUpdate(order._id, { orderStatus: newStatus });
                console.log(`✓ Order ${order._id} updated to ${newStatus}`);
            } catch (updateError) {
                console.error(`Error updating order ${order._id}:`, updateError.message);
            }
            
            // Add a small delay between updates
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        console.log('\nCompleted updating order statuses!');
        console.log('\nNow you can test the Orders component in the admin dashboard to see the orders for the Varnam store.');
        
    } catch (error) {
        console.error('Error:', error.message);
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
console.log('Starting Order Status Update Script...\n');
updateOrderStatuses().then(() => {
    console.log('Script completed');
    process.exit(0);
}).catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
});
