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

// 1. Admin Login
async function loginAdmin() {
    try {
        logStep(1, 'Admin Login');
        
        // Login with admin credentials
        const loginResponse = await api.post('/api/admin/auth/login', {
            username: 'liverio',
            password: 'lavdaa'
        });

        console.log('Login response headers:', loginResponse.headers); // Debug headers
        console.log('Login response data:', JSON.stringify(loginResponse.data, null, 2)); // Debug data
        console.log('Set-Cookie header:', loginResponse.headers['set-cookie']); // Debug cookies

        // The token should be in the cookies
        const cookies = loginResponse.headers['set-cookie'];
        if (!cookies || cookies.length === 0) {
            throw new Error('No cookies received in login response');
        }

        // Extract token from cookies (looking for adminToken now)
        const tokenCookie = cookies.find(cookie => cookie.startsWith('adminToken='));
        if (!tokenCookie) {
            throw new Error('No adminToken cookie found in response');
        }

        const token = tokenCookie.split(';')[0].split('=')[1];
        if (!token) {
            throw new Error('Could not extract token from cookie');
        }

        // Set the token for all future requests with Bearer prefix
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Set auth token:', `Bearer ${token}`); // Debug log

        logSuccess('Admin login successful');
    } catch (error) {
        logError('Admin login failed', error);
        throw error;
    }
}

// 2. Update Product Stocks
async function updateProductStocks() {
    try {
        logStep(2, 'Updating Product Stocks');

        // Debug log to check headers
        console.log('Request headers:', {
            common: api.defaults.headers.common,
            regular: api.defaults.headers
        });

        // Get all products
        const productsResponse = await api.get('/api/admin/products');
        
        if (!productsResponse.data || !productsResponse.data.data) {
            throw new Error('Invalid products response structure');
        }
        
        const products = productsResponse.data.data;
        console.log(`Found ${products.length} products to update`);

        // Update each product's stock
        for (const product of products) {
            try {
                // Keep existing product data and only update stock
                const updateData = {
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    new_price: product.new_price,
                    category: product.category,
                    stock: 100,
                    image_url: product.image_url,
                    images: product.images
                };

                const updateResponse = await api.put(`/api/admin/products/${product._id}`, updateData);

                if (updateResponse.data.success) {
                    logSuccess(`Updated stock for product: ${product.name}`);
                } else {
                    console.warn(`Warning: Update might not have been saved for product ${product.name}`);
                }
            } catch (error) {
                logError(`Failed to update product ${product.name}`, error);
                // Continue with other products even if one fails
                continue;
            }
        }

        logSuccess('Finished updating product stocks');
    } catch (error) {
        logError('Failed to update product stocks', error);
        throw error;
    }
}

// Main function to run all steps
async function updateAllStocks() {
    console.log(chalk.yellow('\n=== Starting Stock Update ===\n'));
    
    try {
        await loginAdmin();
        await updateProductStocks();
        console.log(chalk.green('\n=== Stock Update Completed Successfully ===\n'));
    } catch (error) {
        console.error(chalk.red('\n=== Stock Update Failed ===\n'));
        process.exit(1);
    }
}

// Run the stock update
updateAllStocks();
