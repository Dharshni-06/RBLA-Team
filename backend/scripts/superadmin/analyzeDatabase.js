// Architect: SP
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../../models/Product');
const Order = require('../../models/user/Order');
const Review = require('../../models/user/Review');
const BraintreePayment = require('../../models/user/BraintreePayment');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function analyzeDatabase() {
    try {
        console.log('\n=== Database Analysis Report ===\n');

        // Products Analysis
        const products = await Product.find();
        const productCategories = [...new Set(products.map(p => p.category))];
        
        console.log('Products Analysis:');
        console.log('-----------------');
        console.log(`Total Products: ${products.length}`);
        console.log(`Categories: ${productCategories.join(', ')}`);
        console.log(`Active Products: ${products.filter(p => p.isActive).length}`);
        console.log(`Out of Stock Products: ${products.filter(p => p.stock === 0).length}`);
        console.log(`Low Stock Products (< 10): ${products.filter(p => p.stock > 0 && p.stock < 10).length}`);
        
        // Price Analysis
        const prices = products.map(p => p.price);
        console.log(`Price Range: ₹${Math.min(...prices)} - ₹${Math.max(...prices)}`);
        console.log(`Average Price: ₹${(prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)}`);

        // Orders Analysis
        const orders = await Order.find();
        const orderStatuses = [...new Set(orders.map(o => o.status))];
        
        console.log('\nOrders Analysis:');
        console.log('----------------');
        console.log(`Total Orders: ${orders.length}`);
        console.log('Orders by Status:');
        orderStatuses.forEach(status => {
            const count = orders.filter(o => o.status === status).length;
            console.log(`- ${status}: ${count}`);
        });

        // Calculate total revenue
        const totalRevenue = orders
            .filter(o => o.status === 'completed')
            .reduce((sum, order) => sum + order.totalAmount, 0);
        console.log(`Total Revenue: ₹${totalRevenue.toFixed(2)}`);

        // Average order value
        const avgOrderValue = totalRevenue / orders.filter(o => o.status === 'completed').length;
        console.log(`Average Order Value: ₹${avgOrderValue.toFixed(2)}`);

        // Payments Analysis
        const payments = await BraintreePayment.find();
        const paymentStatuses = [...new Set(payments.map(p => p.status))];
        
        console.log('\nPayments Analysis:');
        console.log('------------------');
        console.log(`Total Payments: ${payments.length}`);
        console.log('Payments by Status:');
        paymentStatuses.forEach(status => {
            const count = payments.filter(p => p.status === status).length;
            console.log(`- ${status}: ${count}`);
        });

        // Calculate payment success rate
        const successRate = (payments.filter(p => p.status === 'settled').length / payments.length * 100).toFixed(2);
        console.log(`Payment Success Rate: ${successRate}%`);

        // Reviews Analysis
        const reviews = await Review.find();
        
        console.log('\nReviews Analysis:');
        console.log('----------------');
        console.log(`Total Reviews: ${reviews.length}`);
        
        // Rating distribution
        console.log('Rating Distribution:');
        for (let i = 1; i <= 5; i++) {
            const count = reviews.filter(r => r.rating === i).length;
            const percentage = ((count / reviews.length) * 100).toFixed(2);
            console.log(`- ${i} stars: ${count} (${percentage}%)`);
        }

        // Average rating
        const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2);
        console.log(`Average Rating: ${avgRating} stars`);

        // Most reviewed products
        const reviewsByProduct = {};
        reviews.forEach(review => {
            reviewsByProduct[review.product] = (reviewsByProduct[review.product] || 0) + 1;
        });

        const topReviewedProducts = await Product.find({
            _id: { $in: Object.keys(reviewsByProduct) }
        });

        console.log('\nTop 5 Most Reviewed Products:');
        Object.entries(reviewsByProduct)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .forEach(([productId, count]) => {
                const product = topReviewedProducts.find(p => p._id.toString() === productId);
                console.log(`- ${product?.name || 'Unknown Product'}: ${count} reviews`);
            });

        // Time-based Analysis
        console.log('\nTime-based Analysis:');
        console.log('-------------------');
        
        // Orders by month (last 12 months)
        const last12Months = new Date();
        last12Months.setMonth(last12Months.getMonth() - 12);
        
        const recentOrders = orders.filter(o => new Date(o.createdAt) >= last12Months);
        const ordersByMonth = {};
        
        recentOrders.forEach(order => {
            const month = new Date(order.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' });
            ordersByMonth[month] = (ordersByMonth[month] || 0) + 1;
        });

        console.log('Orders by Month (Last 12 Months):');
        Object.entries(ordersByMonth)
            .sort(([monthA], [monthB]) => new Date(monthB) - new Date(monthA))
            .forEach(([month, count]) => {
                console.log(`- ${month}: ${count} orders`);
            });

        // Suggestions based on analysis
        console.log('\nSuggestions:');
        console.log('------------');
        
        if (products.filter(p => p.stock === 0).length > 0) {
            console.log('- Some products are out of stock. Consider restocking.');
        }
        
        if (products.filter(p => p.stock < 10).length > 0) {
            console.log('- Some products have low stock. Monitor inventory levels.');
        }
        
        if (avgRating < 4.0) {
            console.log('- Average rating is below 4 stars. Review customer feedback for improvements.');
        }
        
        if (successRate < 95) {
            console.log('- Payment success rate is below 95%. Investigate failed payments.');
        }

        mongoose.disconnect();
    } catch (error) {
        console.error('Error analyzing database:', error);
        mongoose.disconnect();
    }
}

analyzeDatabase();
