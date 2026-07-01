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
        
        // Find Siragugal product
        console.log('Finding Siragugal product...');
        let siragugalProduct = await Product.findOne({ 
            name: { $regex: 'Cupcoaster', $options: 'i' },
            store: 'siragugal'
        });
        
        if (!siragugalProduct) {
            console.error('Siragugal Cupcoaster product not found!');
            console.log('Checking all available Siragugal products...');
            
            // Try to find any Siragugal product
            siragugalProduct = await Product.findOne({ store: 'siragugal' });
            
            if (!siragugalProduct) {
                console.error('No Siragugal products found in the database!');
                process.exit(1);
            }
            
            console.log(`Using alternative Siragugal product: ${siragugalProduct.name} (ID: ${siragugalProduct._id})`);
        } else {
            console.log(`Found Siragugal product: ${siragugalProduct.name} (ID: ${siragugalProduct._id})`);
        }
        
        // Find Vaagai product
        console.log('Finding Vaagai product...');
        let vaagaiProduct = await Product.findOne({ 
            name: { $regex: 'Towel', $options: 'i' },
            store: 'vaagai'
        });
        
        if (!vaagaiProduct) {
            console.error('Vaagai Towel product not found!');
            console.log('Checking all available Vaagai products...');
            
            // Try to find any Vaagai product
            vaagaiProduct = await Product.findOne({ store: 'vaagai' });
            
            if (!vaagaiProduct) {
                console.error('No Vaagai products found in the database!');
                process.exit(1);
            }
            
            console.log(`Using alternative Vaagai product: ${vaagaiProduct.name} (ID: ${vaagaiProduct._id})`);
        } else {
            console.log(`Found Vaagai product: ${vaagaiProduct.name} (ID: ${vaagaiProduct._id})`);
        }
        
        // Find a user to associate with the orders
        const user = await User.findOne({});
        
        if (!user) {
            console.error('No users found in the database!');
            process.exit(1);
        }
        
        console.log(`Found user: ${user.email} (ID: ${user._id})`);
        
        // Create multiple orders for Siragugal
        console.log('\nCreating multiple orders for Siragugal store...');
        
        const orderCount = 10;
        const createdSiragugalOrders = [];
        
        for (let i = 0; i < orderCount; i++) {
            // Generate a unique order number
            const orderNumber = `SIR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const quantity = Math.floor(Math.random() * 3) + 1; // Random quantity between 1-3
            
            // Create base order data
            const orderData = {
                orderNumber,
                user: user._id,
                products: [{
                    product: siragugalProduct._id,
                    quantity: quantity,
                    price: siragugalProduct.new_price || 999 // Fallback price if not available
                }],
                shippingAddress: {
                    fullName: `Siragugal Customer ${i+1}`,
                    address: `${i+1} Siragugal St`,
                    city: "Chennai",
                    state: "Tamil Nadu",
                    pincode: "600001",
                    phone: `911234567${i}`
                },
                totalAmount: (siragugalProduct.new_price || 999) * quantity,
                orderStatus: 'Pending',
                paymentMethod: 'COD',
                paymentStatus: 'Unpaid',
                orderDate: new Date()
            };
            
            // Create the order directly in the database
            console.log(`Creating Siragugal order ${i+1}/${orderCount}...`);
            const newOrder = new Order(orderData);
            const savedOrder = await newOrder.save();
            
            console.log(`✓ Siragugal Order created successfully: ${savedOrder._id}`);
            createdSiragugalOrders.push(savedOrder._id);
            
            // Add a small delay between orders
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // Create multiple orders for Vaagai
        console.log('\nCreating multiple orders for Vaagai store...');
        
        const createdVaagaiOrders = [];
        
        for (let i = 0; i < orderCount; i++) {
            // Generate a unique order number
            const orderNumber = `VAA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const quantity = Math.floor(Math.random() * 3) + 1; // Random quantity between 1-3
            
            // Create base order data
            const orderData = {
                orderNumber,
                user: user._id,
                products: [{
                    product: vaagaiProduct._id,
                    quantity: quantity,
                    price: vaagaiProduct.new_price || 999 // Fallback price if not available
                }],
                shippingAddress: {
                    fullName: `Vaagai Customer ${i+1}`,
                    address: `${i+1} Vaagai St`,
                    city: "Coimbatore",
                    state: "Tamil Nadu",
                    pincode: "641001",
                    phone: `922345678${i}`
                },
                totalAmount: (vaagaiProduct.new_price || 999) * quantity,
                orderStatus: 'Pending',
                paymentMethod: 'COD',
                paymentStatus: 'Unpaid',
                orderDate: new Date()
            };
            
            // Create the order directly in the database
            console.log(`Creating Vaagai order ${i+1}/${orderCount}...`);
            const newOrder = new Order(orderData);
            const savedOrder = await newOrder.save();
            
            console.log(`✓ Vaagai Order created successfully: ${savedOrder._id}`);
            createdVaagaiOrders.push(savedOrder._id);
            
            // Add a small delay between orders
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // Create some mixed orders with products from both stores
        console.log('\nCreating mixed orders with products from both stores...');
        
        const mixedOrderCount = 5;
        const createdMixedOrders = [];
        
        for (let i = 0; i < mixedOrderCount; i++) {
            // Generate a unique order number
            const orderNumber = `MIX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const siragugalQuantity = Math.floor(Math.random() * 2) + 1; // Random quantity between 1-2
            const vaagaiQuantity = Math.floor(Math.random() * 2) + 1; // Random quantity between 1-2
            
            // Create base order data
            const orderData = {
                orderNumber,
                user: user._id,
                products: [
                    {
                        product: siragugalProduct._id,
                        quantity: siragugalQuantity,
                        price: siragugalProduct.new_price || 999 // Fallback price if not available
                    },
                    {
                        product: vaagaiProduct._id,
                        quantity: vaagaiQuantity,
                        price: vaagaiProduct.new_price || 999 // Fallback price if not available
                    }
                ],
                shippingAddress: {
                    fullName: `Mixed Customer ${i+1}`,
                    address: `${i+1} Mixed St`,
                    city: "Madurai",
                    state: "Tamil Nadu",
                    pincode: "625001",
                    phone: `933456789${i}`
                },
                totalAmount: (siragugalProduct.new_price || 999) * siragugalQuantity + 
                             (vaagaiProduct.new_price || 999) * vaagaiQuantity,
                orderStatus: 'Pending',
                paymentMethod: 'COD',
                paymentStatus: 'Unpaid',
                orderDate: new Date()
            };
            
            // Create the order directly in the database
            console.log(`Creating Mixed order ${i+1}/${mixedOrderCount}...`);
            const newOrder = new Order(orderData);
            const savedOrder = await newOrder.save();
            
            console.log(`✓ Mixed Order created successfully: ${savedOrder._id}`);
            createdMixedOrders.push(savedOrder._id);
            
            // Add a small delay between orders
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        console.log('\nCompleted creating orders for multiple stores!');
        console.log(`Created ${createdSiragugalOrders.length} Siragugal orders`);
        console.log(`Created ${createdVaagaiOrders.length} Vaagai orders`);
        console.log(`Created ${createdMixedOrders.length} Mixed orders`);
        
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
console.log('Starting Multiple Order Creation Test for Siragugal and Vaagai Stores...\n');
createMultipleOrders().then(() => {
    console.log('Script completed');
    process.exit(0);
}).catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
});
