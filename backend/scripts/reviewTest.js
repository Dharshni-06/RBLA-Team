// Architect: SP
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const API_URL = 'http://localhost:5000/api';
let authToken = '';
let testReviewId = '';

// Test user credentials (same as testOrderPayment.js)
const testUser = {
    email: '2301722049020@mcc.edu.in',
    password: 'karthi'
};

// Test review data (using product ID from testOrderPayment.js)
const testReview = {
    productId: '67ce974717698bf95b3da15a', // Paperfile 1
    rating: 4,
    title: 'Great Product',
    comment: 'This paperfile is really good quality and durable.'
};

// Helper function to log test results
const logTest = (testName, success, error = null) => {
    if (success) {
        console.log(`✅ ${testName}: PASSED`);
    } else {
        console.log(`❌ ${testName}: FAILED`);
        if (error) console.error(error);
    }
};

// Sleep function for adding delays between API calls (same as testOrderPayment.js)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test functions
async function loginUser() {
    try {
        const response = await axios.post(`${API_URL}/user/auth/login`, testUser);
        authToken = response.data.token;
        logTest('Login', true);
        return true;
    } catch (error) {
        logTest('Login', false, error.response?.data || error.message);
        return false;
    }
}

async function createReviewTest() {
    try {
        const response = await axios.post(
            `${API_URL}/user/reviews`,
            testReview,
            {
                headers: { Authorization: `Bearer ${authToken}` }
            }
        );
        testReviewId = response.data.data._id;
        console.log('Created Review ID:', testReviewId);
        logTest('Create Review', true);
        console.log('Created Review:', {
            rating: response.data.data.rating,
            title: response.data.data.title,
            comment: response.data.data.comment
        });
        return true;
    } catch (error) {
        logTest('Create Review', false, error.response?.data || error.message);
        return false;
    }
}

async function getReviewsTest() {
    try {
        const response = await axios.get(
            `${API_URL}/user/reviews/product/${testReview.productId}`
        );
        logTest('Get Reviews', true);
        console.log('Product Reviews:', response.data.data.length);
        console.log('Review Details:', response.data.data);
        return true;
    } catch (error) {
        logTest('Get Reviews', false, error.response?.data || error.message);
        return false;
    }
}

async function updateReviewTest() {
    if (!testReviewId) {
        logTest('Update Review', false, 'No review ID available - create review failed');
        return false;
    }

    try {
        const response = await axios.put(
            `${API_URL}/user/reviews/${testReviewId}`,
            {
                rating: 5,
                title: 'Updated: Even Better!',
                comment: 'After using it more, I love this paperfile even more.'
            },
            {
                headers: { Authorization: `Bearer ${authToken}` }
            }
        );
        logTest('Update Review', true);
        console.log('Updated Review:', {
            rating: response.data.data.rating,
            title: response.data.data.title,
            comment: response.data.data.comment
        });
        return true;
    } catch (error) {
        logTest('Update Review', false, error.response?.data || error.message);
        return false;
    }
}

async function voteReviewTest() {
    if (!testReviewId) {
        logTest('Vote Review', false, 'No review ID available - create review failed');
        return false;
    }

    try {
        const response = await axios.post(
            `${API_URL}/user/reviews/${testReviewId}/vote`,
            {},
            {
                headers: { Authorization: `Bearer ${authToken}` }
            }
        );
        logTest('Vote Review', true);
        console.log('Vote count:', response.data.data.votes);
        return true;
    } catch (error) {
        logTest('Vote Review', false, error.response?.data || error.message);
        return false;
    }
}

// Run all tests
async function runTests() {
    console.log('🚀 Starting Review API Tests...\n');

    // Login first
    const loginSuccess = await loginUser();
    if (!loginSuccess) {
        console.log('\n❌ Tests aborted: Login failed');
        return;
    }

    // Add delay between tests
    await sleep(1000);

    // Run tests in sequence
    const createSuccess = await createReviewTest();
    await sleep(1000);
    
    await getReviewsTest();
    await sleep(1000);
    
    if (createSuccess) {
        await updateReviewTest();
        await sleep(1000);
        
        await voteReviewTest();
        await sleep(1000);
    } else {
        console.log('\n⚠️ Skipping update and vote tests since create review failed');
    }

    console.log('\n✨ Tests completed! Review ID:', testReviewId);
}

// Run the tests
console.log('Starting Review Flow Test...');
console.log('===========================');
runTests().catch(console.error);
