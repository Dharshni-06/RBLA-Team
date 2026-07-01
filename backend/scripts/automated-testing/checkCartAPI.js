// Architect: SP
const axios = require('axios');
const config = require('./config');

async function checkCartAPI() {
  try {
    console.log('Checking cart API...');
    
    // First login to get token
    console.log('Logging in...');
    const loginResponse = await axios.post(
      `${config.API_URL}/user/auth/login`,
      {
        email: config.TEST_USER.email,
        password: config.TEST_USER.password
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    const token = loginResponse.data.token;
    console.log('Login successful, token obtained');
    
    // Check cart with auth token
    console.log('\nChecking cart API...');
    const cartResponse = await axios.get(
      `${config.API_URL}/user/cart`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('Cart status:', cartResponse.status);
    console.log('Cart data structure:', JSON.stringify(cartResponse.data, null, 2).substring(0, 1000) + '...');
    
    // Try to add a test product to cart
    console.log('\nChecking product API for a test product...');
    const productsResponse = await axios.get(
      `${config.API_URL}/public/products`,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    if (productsResponse.data && 
        productsResponse.data.success && 
        Array.isArray(productsResponse.data.data) && 
        productsResponse.data.data.length > 0) {
      
      const testProduct = productsResponse.data.data[0];
      console.log('Using test product:', testProduct.name, 'ID:', testProduct._id);
      
      console.log('\nTrying to add product to cart...');
      const addToCartResponse = await axios.post(
        `${config.API_URL}/user/cart`,
        {
          productId: testProduct._id,
          quantity: 1
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Add to cart status:', addToCartResponse.status);
      console.log('Add to cart response:', JSON.stringify(addToCartResponse.data, null, 2));
    } else {
      console.log('No products found to test adding to cart');
    }
    
  } catch (error) {
    console.error('Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

checkCartAPI();
