// Architect: SP
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const API_URL = 'http://localhost:5000/api';

// Test user credentials
const TEST_USER = {
    email: '2301722049020@mcc.edu.in',
    password: 'karthi'
};

// Test order data - ordering multiple items
const TEST_ORDER = {
    products: [
        {
            product: "67ce974717698bf95b3da15a", // Paperfile 1 (₹35, stock: 6)
            quantity: 2
        }
    ],
    shippingAddress: {
        fullName: "Test User",
        address: "123 Test Street",
        city: "Test City",
        state: "Test State",
        pincode: "600001",
        phone: "1234567890"
    }
};

// Sleep function for adding delays between API calls
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function loginUser() {
    try {
        const response = await axios.post(`${API_URL}/user/auth/login`, TEST_USER);
        console.log('Login successful');
        return response.data.token;
    } catch (error) {
        console.error('Login failed:', error.response?.data || error.message);
        throw error;
    }
}

async function createOrder(token) {
    try {
        const response = await axios.post(`${API_URL}/user/orders`, TEST_ORDER, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Order created successfully');
        return response.data.data._id;
    } catch (error) {
        console.error('Order creation failed:', error.response?.data || error.message);
        throw error;
    }
}

async function initiatePayment(orderId, token) {
    try {
        // First get braintree token
        const tokenResponse = await axios.get(`${API_URL}/user/braintree/token`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!tokenResponse.data.success || !tokenResponse.data.clientToken) {
            throw new Error('Failed to get client token');
        }
        
        // Then create payment with fake nonce
        const paymentData = {
            nonce: 'fake-valid-nonce',
            orderId: orderId
        };
        
        const response = await axios.post(`${API_URL}/user/braintree/payment`, paymentData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Payment initiated successfully');
        return response.data;
    } catch (error) {
        console.error('Payment initiation failed:', error.response?.data || error.message);
        throw error;
    }
}

async function verifyOrder(orderId, token) {
    try {
        const response = await axios.get(`${API_URL}/user/orders`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const order = response.data.data.find(o => o._id === orderId);
        console.log('Order verified successfully');
        return order;
    } catch (error) {
        console.error('Order verification failed:', error.response?.data || error.message);
        throw error;
    }
}

async function runTest() {
    console.log('Starting Order Payment Flow Test...');
    console.log('==================================');
    
    try {
        // 1. Login
        console.log('1. Logging in user...');
        const token = await loginUser();
        await sleep(1000);

        // 2. Create Order
        console.log('\n2. Creating order...');
        const orderId = await createOrder(token);
        await sleep(1000);

        // 3. Process Payment
        console.log('\n3. Processing payment...');
        const paymentData = await initiatePayment(orderId, token);
        await sleep(1000);

        // 4. Verify Order Status
        console.log('\n4. Verifying order status...');
        const finalOrder = await verifyOrder(orderId, token);
        console.log('\nFinal Order Status:', finalOrder.orderStatus);
        console.log('Payment Status:', finalOrder.paymentStatus);
        
        console.log('\nTest completed successfully! 🎉');
    } catch (error) {
        console.error('\nTest failed:', error.message);
    }
}

runTest();
