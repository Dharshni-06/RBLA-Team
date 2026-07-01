// Architect: SP
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/user/cart';

// Helper to get auth header
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
};

// Get cart
export const getCart = async () => {
    try {
        const response = await axios.get(BASE_URL, getAuthHeader());
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Add to cart
export const addToCart = async (productData) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/add`,
            productData,
            getAuthHeader()
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Update cart item
export const updateCartItem = async (itemData) => {
    try {
        const response = await axios.put(
            `${BASE_URL}/update`,
            itemData,
            getAuthHeader()
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Remove from cart
export const removeFromCart = async (itemId) => {
    try {
        const response = await axios.delete(
            `${BASE_URL}/remove/${itemId}`,
            getAuthHeader()
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Clear cart
export const clearCart = async () => {
    try {
        const response = await axios.delete(
            `${BASE_URL}/clear`,
            getAuthHeader()
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
