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

async function loginUser() {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, TEST_USER);
        return response.data.token;
    } catch (error) {
        console.error('Login failed:', error.response?.data || error.message);
        return null;
    }
}

async function testBraintreePayment() {
    try {
        console.log('1. Logging in user...');
        const token = await loginUser();
        if (!token) {
            console.error('Failed to login. Aborting test.');
            return;
        }
        console.log('✓ Login successful');

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // Step 2: Get client token
        console.log('\n2. Getting Braintree client token...');
        const tokenResponse = await axios.get(
            `${API_URL}/user/braintree/token`,
            { headers }
        );
        const clientToken = tokenResponse.data.clientToken;
        console.log('✓ Received client token:', clientToken);

        // Step 3: Process a test payment
        console.log('\n3. Processing test payment...');
        const paymentResponse = await axios.post(
            `${API_URL}/user/braintree/payment`,
            {
                nonce: 'fake-valid-nonce', // Braintree's test nonce
                amount: '10.00',
                orderId: 'TEST-ORDER-' + Date.now()
            },
            { headers }
        );

        if (paymentResponse.data.success) {
            console.log('✓ Payment successful!');
            console.log('Transaction ID:', paymentResponse.data.transaction.id);
            console.log('Amount:', paymentResponse.data.transaction.amount);
            console.log('Status:', paymentResponse.data.transaction.status);
        }

        // Step 4: Get payment history
        console.log('\n4. Fetching payment history...');
        const historyResponse = await axios.get(
            `${API_URL}/user/braintree/history`,
            { headers }
        );
        console.log('✓ Payment history:', JSON.stringify(historyResponse.data, null, 2));

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

// Run the test
console.log('Starting Braintree Payment Test...');
console.log('=================================');
testBraintreePayment();
