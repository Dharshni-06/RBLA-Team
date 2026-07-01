// Architect: SP
const axios = require('axios');
const config = require('./config');
const chalk = require('chalk');

// Create axios instance with default config
let api = axios.create({
    baseURL: config.API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Store auth token and user data
let authToken = null;
let userData = null;
let products = [];
let orders = [];

// Utility function to delay execution
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to log steps
const logStep = (step, message) => {
    console.log(chalk.cyan(`\n[Step ${step}] ${message}`));
};

// Helper function to log success
const logSuccess = message => {
    console.log(chalk.green(`✓ ${message}`));
};

// Helper function to log error
const logError = (message, error) => {
    console.error(chalk.red(`✗ ${message}`));
    if (error.response) {
        console.error(chalk.red('Status:', error.response.status));
        console.error(chalk.red('Response data:', JSON.stringify(error.response.data, null, 2)));
    } else if (error.request) {
        console.error(chalk.red('No response received:', error.request));
    } else {
        console.error(chalk.red('Error message:', error.message));
        if (error.stack) {
            console.error(chalk.red('Stack trace:', error.stack));
        }
    }
};

// Helper function to shuffle array
const shuffleArray = array => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// Helper function to chunk array into smaller arrays
const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

// 1. User Login (with existing account)
async function loginUser() {
    try {
        logStep(1, 'User Login');

        // Login with existing account
        const loginResponse = await api.post('/api/user/auth/login', {
            email: config.USER.email,
            password: config.USER.password
        });

        // Extract token and set up axios instance for authenticated requests
        const token = loginResponse.data.token;
        api = axios.create({
            baseURL: config.API_URL,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        logSuccess(`Login successful for ${config.USER.email}`);
    } catch (error) {
        logError('Login failed', error);
        throw error;
    }
}

// 2. Add Products to Cart
async function addProductsToCart() {
    try {
        logStep(2, 'Adding Products to Cart');

        // Get available products
        const productsResponse = await api.get('/api/public/products');
        
        // Extract the products array from the response
        let productsList = [];
        if (productsResponse.data && productsResponse.data.data) {
            productsList = productsResponse.data.data;
        } else {
            throw new Error('Invalid products response structure');
        }

        // Create a list of all products to order (each product twice)
        const productsToOrder = [];
        productsList.forEach(product => {
            for (let i = 0; i < config.ORDERS_PER_PRODUCT; i++) {
                productsToOrder.push(product);
            }
        });

        // Shuffle the products to randomize the order
        shuffleArray(productsToOrder);

        // Split products into chunks for multiple orders
        const productChunks = chunkArray(productsToOrder, config.PRODUCTS_PER_ORDER);

        // Process each chunk as a separate order
        for (const chunk of productChunks) {
            // Clear cart before starting new order
            try {
                await api.delete('/api/user/cart');
                logSuccess('Cart cleared for new order');
            } catch (error) {
                console.warn('Warning: Could not clear cart, proceeding anyway');
            }

            // Add each product in the chunk to cart
            for (const product of chunk) {
                const productId = product._id;
                const price = product.new_price;
                
                console.log(`Attempting to add product ${productId} to cart (price: ${price})...`);
                
                try {
                    await api.post('/api/user/cart/add', {
                        productId: productId,
                        quantity: 1,
                        price: price
                    });
                    
                    await delay(config.OPERATION_DELAY);
                    logSuccess(`Added product ${productId} to cart`);
                } catch (error) {
                    logError(`Failed to add product ${productId} to cart`, error);
                    // Continue with other products even if one fails
                    continue;
                }
            }

            // Process the order for this chunk
            await processPaymentAndOrder();
            
            // Add reviews for the products in this order
            await addReviews();

            // Wait between orders
            await delay(config.OPERATION_DELAY * 2);
        }

    } catch (error) {
        logError('Failed to process products', error);
        throw error;
    }
}

// 3. Process Payment and Create Order
async function processPaymentAndOrder() {
    try {
        logStep(3, 'Processing Payment and Creating Order');

        // Get cart total
        const cartResponse = await api.get('/api/user/cart');
        
        // Check the cart data structure
        console.log('Cart response:', JSON.stringify(cartResponse.data).substring(0, 200) + '...');
        
        let cartItems = [];
        if (cartResponse.data && cartResponse.data.data && cartResponse.data.data.items) {
            cartItems = cartResponse.data.data.items;
        } else {
            throw new Error('Invalid cart response structure');
        }

        // Format products for order creation
        const formattedProducts = cartItems.map(item => ({
            product: item.productId,
            quantity: item.quantity,
            price: item.price
        }));

        // Calculate total amount
        const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

        // First, create a preliminary order
        console.log('Creating preliminary order...');
        const createOrderResponse = await api.post('/api/user/orders', {
            products: formattedProducts,
            shippingAddress: {
                fullName: 'Test User',
                address: '123 Test St',
                city: 'Test City',
                state: 'Test State',
                pincode: '123456',
                phone: '1234567890'
            },
            totalAmount: totalAmount
        });

        // Extract order ID from response
        const orderId = createOrderResponse.data.data._id;
        console.log(`Order ID: ${orderId}`);

        // Get Braintree client token
        const tokenResponse = await api.get('/api/user/braintree/token');
        logSuccess('Got payment token');

        // Process payment
        console.log('Processing payment...');
        const paymentResponse = await api.post('/api/user/braintree/payment', {
            nonce: config.PAYMENT.nonce,
            orderId: orderId,
            amount: totalAmount
        });

        if (paymentResponse.data.success) {
            logSuccess('Payment processed successfully');
            // Store the order ID for later use
            orders.push(orderId);
        } else {
            throw new Error('Payment failed');
        }

    } catch (error) {
        logError('Payment/Order processing failed', error);
        throw error;
    }
}

// 4. Add Reviews
async function addReviews() {
    try {
        logStep(4, 'Adding Reviews');
        
        // Get the latest orders for the user
        console.log('Fetching all user orders for reviews...');
        const ordersResponse = await api.get('/api/user/orders');
        
        console.log('Orders response structure:', JSON.stringify(ordersResponse.data).substring(0, 300) + '...');
        
        // Get the most recent order (it should be the one we just created)
        const latestOrder = ordersResponse.data.data[0];
        
        if (!latestOrder) {
            throw new Error('No orders found for review');
        }

        // First update the order status to Delivered so we can add reviews
        try {
            await api.put(`/api/admin/orders/${latestOrder._id}`, {
                orderStatus: 'Delivered'
            });
            console.log(`Updated order ${latestOrder._id} status to Delivered`);
        } catch (error) {
            console.warn(`Warning: Could not update order status. Error: ${error.message}`);
        }

        // Add a review for each product in the order
        const reviewedProducts = new Set(); // Track products we've already reviewed
        for (const item of latestOrder.products) {
            try {
                const productId = item.product._id;
                
                // Skip if we've already reviewed this product
                if (reviewedProducts.has(productId)) {
                    console.log(`Skipping review for product ${productId} - already reviewed`);
                    continue;
                }
                
                console.log(`Adding review for product ${productId}`);
                
                // Randomly select a rating and comment
                const rating = config.REVIEW_TEMPLATE.ratings[
                    Math.floor(Math.random() * config.REVIEW_TEMPLATE.ratings.length)
                ];
                const comment = config.REVIEW_TEMPLATE.comments[
                    Math.floor(Math.random() * config.REVIEW_TEMPLATE.comments.length)
                ];
                
                const reviewResponse = await api.post('/api/user/reviews', {
                    productId: productId,
                    rating: rating,
                    comment: comment,
                    title: `Review for ${item.product.name}`
                });
                
                if (reviewResponse.data.success) {
                    logSuccess(`Added review for product ${productId}`);
                    reviewedProducts.add(productId); // Mark this product as reviewed
                } else {
                    console.warn(`Warning: Review might not have been saved for product ${productId}`);
                }
                
                // Add delay between reviews
                await delay(config.OPERATION_DELAY);
                
            } catch (error) {
                console.warn(`Warning: Failed to add review for product. Error: ${error.message}`);
                // Continue with other reviews even if one fails
                continue;
            }
        }
        
    } catch (error) {
        logError('Failed to add reviews', error);
        // Don't throw error here, as reviews are not critical
        console.warn('Continuing despite review errors');
    }
}

// Main function to run all steps
async function runBulkTest() {
    console.log(chalk.yellow('\n=== Starting Bulk Testing ===\n'));
    
    try {
        await loginUser();
        await addProductsToCart();
        console.log(chalk.green('\n=== Bulk Testing Completed Successfully ===\n'));
    } catch (error) {
        console.error(chalk.red('\n=== Bulk Testing Failed ===\n'));
        process.exit(1);
    }
}

// Run the bulk test
runBulkTest();
