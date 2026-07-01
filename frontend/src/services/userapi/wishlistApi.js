// Architect: SP
import axios from 'axios';
import { getAuthToken } from './authservice';

const BASE_URL = '/api/user/wishlist';

const getAuthHeader = () => ({
    headers: {
        Authorization: `Bearer ${getAuthToken()}`
    }
});

export const wishlistApi = {
    // Get all wishlist items
    getWishlist: async () => {
        const response = await axios.get(BASE_URL, getAuthHeader());
        return response.data;
    },

    // Add item to wishlist
    addToWishlist: async (productId) => {
        const response = await axios.post(`${BASE_URL}/add`, { productId }, getAuthHeader());
        return response.data;
    },

    // Remove item from wishlist
    removeFromWishlist: async (productId) => {
        const response = await axios.delete(`${BASE_URL}/remove/${productId}`, getAuthHeader());
        return response.data;
    },

    // Clear entire wishlist
    clearWishlist: async () => {
        const response = await axios.delete(`${BASE_URL}/clear`, getAuthHeader());
        return response.data;
    }
};

export default wishlistApi;
