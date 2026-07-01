// Architect: SP
require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../../models/user/Order');
const Product = require('../../models/Product');
const User = require('../../models/user/User');
const Review = require('../../models/user/Review');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Order numbers provided by the user
const orderNumbers = [
    'ORD-1742591098852-656',  // Varnam store
    'MIX-1742591935361-398',  // Siragugal store
    'MIX-1742591935361-398'   // Vaagai store (same order number as Siragugal, will need to filter by store)
];

const storeNames = ['varnam', 'siragugal', 'vaagai'];

const createReviewsForOrders = async () => {
    try {
        console.log('Starting to create reviews for specific orders...');

        for (let i = 0; i < orderNumbers.length; i++) {
            const orderNumber = orderNumbers[i];
            const targetStore = storeNames[i];
            
            console.log(`Processing order ${orderNumber} for ${targetStore} store...`);
            
            // Find the order by order number
            const order = await Order.findOne({ orderNumber })
                .populate({
                    path: 'products.product',
                    select: 'name store price image_url'
                })
                .populate('user');
                
            if (!order) {
                console.log(`Order ${orderNumber} not found. Skipping...`);
                continue;
            }

            console.log(`Found order: ${order.orderNumber}`);
            
            // Filter products by store
            const storeProducts = order.products.filter(item => 
                item.product && item.product.store === targetStore
            );
            
            if (storeProducts.length === 0) {
                console.log(`No products from ${targetStore} store found in order ${orderNumber}. Skipping...`);
                continue;
            }
            
            // Select the first product from the target store
            const selectedProduct = storeProducts[0].product;
            
            console.log(`Selected product: ${selectedProduct.name} from ${selectedProduct.store} store`);
            console.log(`User: ${order.user.name} (${order.user.email})`);
            
            // Check if a review already exists
            const existingReview = await Review.findOne({
                user: order.user._id,
                product: selectedProduct._id
            });
            
            if (existingReview) {
                console.log(`Review already exists for product ${selectedProduct.name} by user ${order.user.name}. Updating it...`);
                
                // Update the existing review
                existingReview.rating = Math.floor(Math.random() * 5) + 1; // Random rating 1-5
                existingReview.title = `Updated review for ${selectedProduct.name}`;
                existingReview.comment = `This is an updated review for ${selectedProduct.name} from ${selectedProduct.store} store. The product is ${['excellent', 'good', 'average', 'below average', 'poor'][Math.floor(Math.random() * 5)]}.`;
                existingReview.verifiedPurchase = true;
                existingReview.updatedAt = new Date();
                
                await existingReview.save();
                console.log('Review updated successfully!');
                console.log(existingReview);
            } else {
                // Create a new review
                const review = new Review({
                    user: order.user._id,
                    product: selectedProduct._id,
                    rating: Math.floor(Math.random() * 5) + 1, // Random rating 1-5
                    title: `Review for ${selectedProduct.name}`,
                    comment: `This is a review for ${selectedProduct.name} from ${selectedProduct.store} store. The product is ${['excellent', 'good', 'average', 'below average', 'poor'][Math.floor(Math.random() * 5)]}.`,
                    verifiedPurchase: true
                });
                
                await review.save();
                console.log('Review created successfully!');
                console.log(review);
            }
            
            console.log(`Completed processing for order ${orderNumber} and store ${targetStore}`);
            console.log('---------------------------------------------------');
        }
        
        console.log('All reviews have been created or updated successfully!');
    } catch (error) {
        console.error('Error creating reviews:', error);
        process.exit(1);
    }
};

// Execute the function
createReviewsForOrders()
    .then(() => {
        console.log('Script completed successfully');
        setTimeout(() => process.exit(0), 1000);
    })
    .catch(err => {
        console.error('Script failed:', err);
        process.exit(1);
    });
