// Architect: SP
const axios = require('axios');

async function checkProductsAPI() {
  try {
    console.log('Checking products API structure...');
    
    const response = await axios.get('http://localhost:5000/api/public/products');
    
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    
    // Check if data is an array
    if (Array.isArray(response.data)) {
      console.log('Response is an array with', response.data.length, 'items');
      if (response.data.length > 0) {
        console.log('First item structure:', JSON.stringify(response.data[0], null, 2));
      }
    } 
    // Check if data has a products property that is an array
    else if (response.data && Array.isArray(response.data.products)) {
      console.log('Response has a products array with', response.data.products.length, 'items');
      if (response.data.products.length > 0) {
        console.log('First item structure:', JSON.stringify(response.data.products[0], null, 2));
      }
    }
    // Check if data is an object with product items
    else if (response.data && typeof response.data === 'object') {
      const keys = Object.keys(response.data);
      console.log('Response is an object with', keys.length, 'keys');
      console.log('Keys:', keys);
      if (keys.length > 0) {
        console.log('First item structure:', JSON.stringify(response.data[keys[0]], null, 2));
      }
    }
    else {
      console.log('Unexpected response structure');
    }
    
    // Show the full raw response (truncated)
    const dataString = JSON.stringify(response.data);
    console.log('\nRaw response (truncated):', dataString.substring(0, 1000) + (dataString.length > 1000 ? '...' : ''));
    
  } catch (error) {
    console.error('Error checking API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

checkProductsAPI();
