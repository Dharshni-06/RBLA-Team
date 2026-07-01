// Architect: SP
const axios = require('axios');
const config = require('./config');
const chalk = require('chalk');

// Create axios instance with default config
const api = axios.create({
    baseURL: config.API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

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
    }
};

// Helper function to delay execution
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to shuffle array
const shuffleArray = array => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// Helper function to chunk array
const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

// Test user credentials
const USER_CREDENTIALS = {
    email: 'payerkordiaknn.k.e.9.7.2.9@gmail.com',
    password: 'jijo'
};

// Chennai addresses for testing
const CHENNAI_ADDRESSES = [
    {
        fullName: "Rajesh Kumar",
        address: "42/21 Gandhi Street, T. Nagar",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600017",
        phone: "9876543210"
    },
    {
        fullName: "Priya Sundaram",
        address: "15 Poonamallee High Road, Kilpauk",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600010",
        phone: "9898765432"
    },
    {
        fullName: "Mohammed Ali",
        address: "78 Whites Road, Royapettah",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600014",
        phone: "9765432109"
    },
    {
        fullName: "Lakshmi Venkatesh",
        address: "25 East Coast Road, Besant Nagar",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600090",
        phone: "9654321098"
    },
    {
        fullName: "John Peter",
        address: "12/5 College Road, Anna Nagar",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600040",
        phone: "9543210987"
    },
    {
        fullName: "Srinivasan Raghavan",
        address: "45 Dr. Radhakrishnan Salai, Adyar",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600020",
        phone: "9432109876"
    },
    {
        fullName: "Fatima Begum",
        address: "89 Pantheon Road, Egmore",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600008",
        phone: "9321098765"
    },
    {
        fullName: "Arun Kumar",
        address: "156 LB Road, Thiruvanmiyur",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600041",
        phone: "9210987654"
    },
    {
        fullName: "Meena Krishnan",
        address: "34 Cathedral Road, Gopalapuram",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600086",
        phone: "9109876543"
    },
    {
        fullName: "David Williams",
        address: "67 Sterling Road, Nungambakkam",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600034",
        phone: "9098765432"
    },
    {
        fullName: "Ramesh Chandran",
        address: "23 Sardar Patel Road, Little Mount",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600015",
        phone: "9987654321"
    },
    {
        fullName: "Anita Sharma",
        address: "112 GST Road, Chromepet",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600044",
        phone: "9876543219"
    },
    {
        fullName: "Karthik Raja",
        address: "78 100 Feet Road, Vadapalani",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600026",
        phone: "9765432198"
    },
    {
        fullName: "Zara Ahmed",
        address: "45 Greams Road, Thousand Lights",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600006",
        phone: "9654321987"
    },
    {
        fullName: "Vijay Kumar",
        address: "234 Mount Road, Teynampet",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600018",
        phone: "9543219876"
    },
    {
        fullName: "Deepa Menon",
        address: "56 Velachery Main Road, Velachery",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600042",
        phone: "9432198765"
    },
    {
        fullName: "Samuel Joseph",
        address: "89 Paper Mills Road, Perambur",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600011",
        phone: "9321987654"
    },
    {
        fullName: "Kavitha Raman",
        address: "12 South Usman Road, West Mambalam",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600033",
        phone: "9219876543"
    },
    {
        fullName: "Ibrahim Khan",
        address: "167 Poonamallee High Road, Koyambedu",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600107",
        phone: "9198765432"
    },
    {
        fullName: "Shanti Mohan",
        address: "45 Lattice Bridge Road, Adyar",
        city: "Chennai",
        state: "Tamil Nadu",
        pincode: "600020",
        phone: "9087654321"
    }
];

// 1. User Login
async function loginUser() {
    try {
        logStep(1, 'User Login');
        console.log('Attempting login with:', USER_CREDENTIALS.email);

        const loginResponse = await api.post('/api/user/auth/login', USER_CREDENTIALS);
        
        if (!loginResponse.data.success) {
            throw new Error('Login failed');
        }

        // Set auth token for future requests
        const token = loginResponse.data.token;
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Auth token set for future requests');

        logSuccess('User login successful');
    } catch (error) {
        logError('Login failed', error);
        throw error;
    }
}

// 2. Add Products to Cart
async function addProductsToCart(products) {
    try {
        logStep(2, 'Adding Products to Cart');

        // Clear cart first
        try {
            await api.delete('/api/user/cart');
            logSuccess('Cart cleared');
        } catch (error) {
            console.warn('Warning: Could not clear cart, proceeding anyway');
        }

        // Add each product to cart
        for (const product of products) {
            console.log(`Attempting to add product ${product._id} to cart (price: ${product.new_price})...`);
            
            await api.post('/api/user/cart/add', {
                productId: product._id,
                quantity: 1,
                price: product.new_price
            });

            logSuccess(`Added product ${product._id} to cart`);
            
            // Add delay between requests
            await delay(config.OPERATION_DELAY);
        }
    } catch (error) {
        logError('Failed to add products to cart', error);
        throw error;
    }
}

// 3. Process Payment and Create Order
async function processPaymentAndOrder() {
    try {
        logStep(3, 'Processing Payment and Creating Order');

        // Get cart total
        const cartResponse = await api.get('/api/user/cart');
        console.log('Cart response:', JSON.stringify(cartResponse.data, null, 2));
        
        let cartItems = [];
        if (cartResponse.data && cartResponse.data.data && cartResponse.data.data.items) {
            cartItems = cartResponse.data.data.items;
        } else {
            throw new Error('Invalid cart response structure');
        }

        // Calculate total amount
        const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

        // Get random address for this order
        const randomAddress = CHENNAI_ADDRESSES[Math.floor(Math.random() * CHENNAI_ADDRESSES.length)];
        
        // Create order with shipping address
        const orderData = {
            products: cartItems.map(item => ({
                product: item.productId,  // Use productId instead of _id
                quantity: item.quantity,
                price: item.price
            })),
            shippingAddress: randomAddress,
            totalAmount
        };

        console.log('Order data:', JSON.stringify(orderData, null, 2));
        console.log('Creating order with address:', randomAddress.fullName, 'at', randomAddress.address);
        
        const orderResponse = await api.post('/api/user/orders', orderData);
        
        if (!orderResponse.data.success) {
            throw new Error('Order creation failed: ' + JSON.stringify(orderResponse.data));
        }

        const orderId = orderResponse.data.data._id;
        logSuccess('Order created successfully');

        // Process payment
        console.log('Processing payment...');
        const paymentResponse = await api.post('/api/user/braintree/payment', {
            nonce: 'fake-valid-nonce',
            orderId: orderId,
            amount: totalAmount
        });

        if (paymentResponse.data.success) {
            logSuccess('Payment processed successfully');
        } else {
            throw new Error('Payment failed: ' + JSON.stringify(paymentResponse.data));
        }

    } catch (error) {
        logError('Payment/Order processing failed', error);
        throw error;
    }
}

// Main function to run bulk test
async function runBulkTest() {
    try {
        console.log('\n=== Starting Bulk Testing ===\n');

        // 1. Login user
        await loginUser();

        // 2. Get all products
        const productsResponse = await api.get('/api/public/products');
        if (!productsResponse.data || !productsResponse.data.data) {
            throw new Error('Invalid products response: ' + JSON.stringify(productsResponse.data));
        }
        const allProducts = productsResponse.data.data;
        console.log(`Found ${allProducts.length} products`);

        // Create chunks of 3 products each for multiple orders
        const productChunks = chunkArray(shuffleArray(allProducts), 3);
        console.log(`Created ${productChunks.length} chunks of 3 products each\n`);

        // Process 10 orders
        for (let i = 0; i < 10; i++) {
            console.log(`\nProcessing order ${i + 1} of 10`);
            
            // Get a random chunk of products
            const randomChunk = productChunks[Math.floor(Math.random() * productChunks.length)];
            
            // Add products to cart and create order
            await addProductsToCart(randomChunk);
            await processPaymentAndOrder();
            
            // Add delay between orders
            if (i < 9) {
                console.log('Waiting before next order...');
                await delay(config.OPERATION_DELAY * 2);
            }
        }

        console.log('\n=== Bulk Testing Completed Successfully ===\n');
    } catch (error) {
        console.log('\n=== Bulk Testing Failed ===');
        console.log('Status:', error.response?.status);
        console.log('Response data:', JSON.stringify(error.response?.data, null, 2));
    }
}

// Run the bulk test
runBulkTest();
