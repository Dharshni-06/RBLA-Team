// Architect: SP
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/user/orders';

// Helper to get auth header
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
};

// Create new order
export const createOrder = async (orderData) => {
    try {
        const response = await axios.post(BASE_URL, orderData, getAuthHeader());
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            throw { success: false, message: 'Please login to place an order' };
        }
        throw error.response?.data || { success: false, message: 'Failed to create order' };
    }
};

// Get all orders for user
export const getUserOrders = async () => {
    try {
        const response = await axios.get(BASE_URL, getAuthHeader());
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            throw { success: false, message: 'Please login to view orders' };
        }
        throw error.response?.data || { success: false, message: 'Failed to fetch orders' };
    }
};

// Get single order details
export const getOrderDetails = async (orderId) => {
    try {
        const response = await axios.get(`${BASE_URL}/${orderId}`, getAuthHeader());
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            throw { success: false, message: 'Please login to view order details' };
        }
        throw error.response?.data || { success: false, message: 'Failed to fetch order details' };
    }
};

// Track order status
export const trackOrder = async (orderId) => {
    try {
        const response = await axios.get(`${BASE_URL}/${orderId}/track`, getAuthHeader());
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            throw { success: false, message: 'Please login to track order' };
        }
        throw error.response?.data || { success: false, message: 'Failed to track order' };
    }
};

// Cancel order
export const cancelOrder = async (orderId) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/${orderId}/cancel`,
            {},
            getAuthHeader()
        );
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            throw { success: false, message: 'Please login to cancel order' };
        }
        throw error.response?.data || { success: false, message: 'Failed to cancel order' };
    }
};

// Check if user has purchased a product
export const checkProductPurchase = async (productId) => {
    try {
        const response = await axios.get(
            `${BASE_URL}/check-purchase/${productId}`,
            getAuthHeader()
        );
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            throw { success: false, message: 'Please login to check purchase status' };
        }
        throw error.response?.data || { success: false, message: 'Failed to check purchase status' };
    }
};
