// Architect: SP
require('dotenv').config();
const mongoose = require('mongoose');

// Get MongoDB connection string from .env
const MONGO_URI = process.env.MONGO_URI;

// Import models directly
const productSchema = require('../../models/Product').schema;
const Product = mongoose.model('Product', productSchema);
const User = require('../../models/user/User');
const Order = require('../../models/user/Order');

async function createMultipleOrders() {
    try {
        // Connect to MongoDB
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected successfully');
        
        console.log('Finding Varnam product...');
        
        // Find the Varnam Bedsheet product
        let productToUse = await Product.findOne({ 
            name: { $regex: 'Bedsheet', $options: 'i' },
            store: 'varnam'
        });
        
        if (!productToUse) {
            console.error('Varnam Bedsheet product not found!');
            console.log('Checking all available products...');
            
            const allProducts = await Product.find({}).select('name store');
            console.log('Available products:', allProducts);
            
            // Try to find any Varnam product
            const anyVarnamProduct = await Product.findOne({ store: 'varnam' });
            
            if (!anyVarnamProduct) {
                console.error('No Varnam products found in the database!');
                process.exit(1);
            }
            
            console.log(`Using alternative Varnam product: ${anyVarnamProduct.name} (ID: ${anyVarnamProduct._id})`);
            productToUse = anyVarnamProduct;
        } else {
            console.log(`Found Varnam Bedsheet product: ${productToUse.name} (ID: ${productToUse._id})`);
        }
        
        // Find a user to associate with the orders
        const user = await User.findOne({});
        
        if (!user) {
            console.error('No users found in the database!');
            process.exit(1);
        }
        
        console.log(`Found user: ${user.email} (ID: ${user._id})`);
        
        // Create multiple orders
        console.log('\nCreating multiple orders for Varnam store...');
        
        const orderCount = 10;
        const createdOrders = [];
        
        for (let i = 0; i < orderCount; i++) {
            // Generate a unique order number
            const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            
            // Create base order data
            const orderData = {
                orderNumber,
                user: user._id,
                products: [{
                    product: productToUse._id,
                    quantity: Math.floor(Math.random() * 3) + 1, // Random quantity between 1-3
                    price: productToUse.new_price || 999 // Fallback price if not available
                }],
                shippingAddress: {
                    fullName: `Test User ${i+1}`,
                    address: `${i+1} Test St`,
                    city: "Test City",
                    state: "Test State",
                    pincode: "123456",
                    phone: `123456789${i}`
                },
                totalAmount: (productToUse.new_price || 999) * (Math.floor(Math.random() * 3) + 1),
                orderStatus: 'Pending',
                paymentMethod: 'COD',
                paymentStatus: 'Unpaid',
                orderDate: new Date()
            };
            
            // Create the order directly in the database
            console.log(`Creating order ${i+1}/${orderCount}...`);
            const newOrder = new Order(orderData);
            const savedOrder = await newOrder.save();
            
            console.log(`✓ Order created successfully: ${savedOrder._id}`);
            createdOrders.push(savedOrder._id);
            
            // Add a small delay between orders
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        console.log('\nCompleted creating multiple orders for Varnam store!');
        console.log(`Created ${createdOrders.length} orders with IDs:`);
        createdOrders.forEach((id, index) => {
            console.log(`${index+1}. ${id}`);
        });
        
        console.log('\nNow run the updateOrderStatuses.js script to update the order statuses.');
        
    } catch (error) {
        console.error('\nError creating orders:', error.message);
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
console.log('Starting Multiple Order Creation Test for Varnam Store...\n');
createMultipleOrders().then(() => {
    console.log('Script completed');
    process.exit(0);
}).catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
});
