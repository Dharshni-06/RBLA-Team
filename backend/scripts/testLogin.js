// Architect: SP
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const API_URL = 'http://localhost:5000/api';

// Test user credentials
const testUser = {
    email: '2301722049020@mcc.edu.in',
    password: 'karthi'
};

async function testLogin() {
    try {
        console.log('🔑 Attempting to login with:', testUser.email);

        const response = await axios.post(`${API_URL}/user/auth/login`, testUser);
        
        console.log('\nServer Response:', {
            success: response.data.success,
            message: response.data.message,
            hasToken: !!response.data.token
        });

        if (response.data.success) {
            console.log('\n✅ Login successful!');
            console.log('Token (first 20 chars):', response.data.token.substring(0, 20) + '...');
        } else {
            console.log('\n❌ Login failed:', response.data.message);
        }
    } catch (error) {
        console.log('\n❌ Error occurred:');
        if (error.response) {
            // Server responded with error
            console.log('Status:', error.response.status);
            console.log('Error:', error.response.data);
        } else if (error.request) {
            // Request was made but no response
            console.log('No response received from server');
            console.log('Is the server running on port 5000?');
        } else {
            // Error in request setup
            console.log('Error:', error.message);
        }
    }
}

// Run the test
console.log('Starting Login Test...');
console.log('====================\n');
testLogin();
