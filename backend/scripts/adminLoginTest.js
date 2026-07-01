// Architect: SP
const axios = require('axios');

// Admin login test
async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    
    const response = await axios.post('http://localhost:5000/api/admin/auth/login', {
      username: 'liverio',
      password: 'lavdaa'
    });
    
    console.log('Login response:', response.data);
    
    if (response.data.success) {
      console.log('Login successful!');
      console.log('Token:', response.data.token);
      return response.data.token;
    } else {
      console.log('Login failed:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('Error during login:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received. Is the server running?');
      console.error(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    return null;
  }
}

// Run the test
testAdminLogin().then(token => {
  if (token) {
    console.log('Test completed successfully with token:', token);
  } else {
    console.log('Test completed with errors');
  }
});
