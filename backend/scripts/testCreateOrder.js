// Architect: SP
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testOrderCreation() {
    try {
        // Step 1: Get fresh token
        console.log('Step 1: Getting fresh token...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: '2301722049020@mcc.edu.in',
            password: 'karthi'
        });

        if (!loginResponse.data.success) {
            throw new Error(`Login failed: ${loginResponse.data.message}`);
        }

        const token = loginResponse.data.token;
        console.log('\nLogin successful!');
        console.log('Token:', token);

        // Step 2: Create order with fresh token
        console.log('\nStep 2: Creating order...');
        
        const orderData = {
            products: [{
                product: "67ce8f3f17698bf95b3da0c6",
                quantity: 2
            }],
            shippingAddress: {
                fullName: "Test User",
                address: "123 Test St",
                city: "Test City",
                state: "Test State",
                pincode: "123456",
                phone: "1234567890"
            }
        };

        console.log('\nOrder Data:', JSON.stringify(orderData, null, 2));
        console.log('\nRequest URL:', `${API_URL}/user/orders`);
        console.log('Authorization Header:', `Bearer ${token}`);

        const orderResponse = await axios.post(
            `${API_URL}/user/orders`,
            orderData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('\nOrder Creation Response:', {
            status: orderResponse.status,
            data: orderResponse.data
        });

    } catch (error) {
        console.error('\nError Details:');
        
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Server Response:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            });

            if (error.response.status === 401) {
                console.error('\nAuthentication Error: Please check if:');
                console.error('1. The user is logged in');
                console.error('2. The token is valid and not expired');
                console.error('3. The user is verified');
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No Response from Server:', error.message);
            console.error('Please check if the server is running at:', API_URL);
        } else {
            // Something happened in setting up the request
            console.error('Request Setup Error:', error.message);
        }

        process.exit(1);
    }
}

// Run the test
console.log('Starting Order Creation Test...\n');
testOrderCreation();
