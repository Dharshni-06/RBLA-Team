// Architect: SP
import axios from 'axios';

const BASE_URL = '/api/payment';

// Helper to get authorization token
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

/**
 * Call backend to generate a Razorpay order.
 * @param {Number} amount Total order amount in standard unit (INR)
 * @param {String} currency Currency code (default 'INR')
 */
export const createRazorpayOrder = async (amount, currency = 'INR') => {
    try {
        const response = await axios.post(`${BASE_URL}/create-order`, { amount, currency }, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response?.data || { 
            success: false, 
            message: 'Failed to create Razorpay order' 
        };
    }
};

/**
 * Call backend to verify payment signature.
 * @param {Object} paymentData Payment verification fields
 */
export const verifyRazorpayPayment = async (paymentData) => {
    try {
        const response = await axios.post(`${BASE_URL}/verify-payment`, paymentData, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response?.data || { 
            success: false, 
            message: 'Payment verification failed' 
        };
    }
};

/**
 * Call backend to finalize the order checkout.
 * @param {Object} checkoutData Full order, address, and payment details
 */
export const finalizeCheckout = async (checkoutData) => {
    try {
        const response = await axios.post(`${BASE_URL}/checkout`, checkoutData, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response?.data || { 
            success: false, 
            message: 'Checkout finalization failed' 
        };
    }
};
