// Architect: SP
const axios = require('axios');

// Test superadmin login
async function testSuperadminLogin() {
  try {
    console.log('Testing superadmin login...');
    
    const response = await axios.post(
      'http://localhost:5000/api/superadmin/auth/login',
      {
        username: 'paul786',
        password: 'paul9801'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Login successful!');
    console.log('Response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Login failed!');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    
    throw error;
  }
}

// Run the test
testSuperadminLogin()
  .then(data => {
    console.log('Test completed successfully!');
  })
  .catch(error => {
    console.error('Test failed!');
  });
