// Architect: SP
// Test configuration
module.exports = {
    API_URL: 'http://localhost:5000',
    USER: {
        email: 'saransass13@gmail.com',
        password: 'saran',
        shippingAddress: {
            fullName: "Test User",
            address: "123 Test St",
            city: "Test City",
            state: "Test State",
            pincode: "123456",
            phone: "1234567890"
        }
    },
    // Number of products to order in bulk testing
    PRODUCTS_PER_ORDER: 3, // Reduced to 3 products per order to make orders more manageable
    // How many times to order each product
    ORDERS_PER_PRODUCT: 6, // Each product will be ordered 6 times
    // Delay between operations (in milliseconds)
    OPERATION_DELAY: 2000, // Increased delay to prevent rate limiting
    // Payment details (using Braintree sandbox)
    PAYMENT: {
        nonce: 'fake-valid-nonce', // Braintree sandbox test nonce
        amount: 100 // Will be updated based on cart total
    },
    // Review template
    REVIEW_TEMPLATE: {
        ratings: [4, 5], // Randomly choose between these ratings
        comments: [
            'Great product! Very satisfied with the quality.',
            'Excellent purchase, highly recommended!',
            'Perfect for my needs, will buy again.',
            'Good quality and fast delivery.',
            'Very happy with this product!'
        ]
    }
};
