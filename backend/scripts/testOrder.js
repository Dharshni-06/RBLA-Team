// Architect: SP
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testLogin() {
    try {
        console.log('Step 1: Testing login...');
        console.log('Making request to:', `${API_URL}/auth/login`);
        
        const loginData = {
            email: '2301722049020@mcc.edu.in',
            password: 'karthi'
        };
        console.log('With data:', loginData);

        const loginResponse = await axios.post(`${API_URL}/auth/login`, loginData);
        
        console.log('\nLogin Response:', {
            success: loginResponse.data.success,
            message: loginResponse.data.message,
            hasToken: !!loginResponse.data.token
        });
        
        if (loginResponse.data.token) {
            console.log('\nGot token:', loginResponse.data.token);
            return loginResponse.data.token;
        } else {
            throw new Error('No token in login response');
        }

    } catch (error) {
        console.error('\nLogin Error:', {
            status: error.response?.status,
            message: error.response?.data?.message || error.message
        });
        throw error;
    }
}

// Only run this test first
testLogin()
    .then(token => {
        console.log('\nTest completed successfully!');
        console.log('Use this token for your order requests:', token);
    })
    .catch(error => {
        console.log('\nTest failed!');
    });
