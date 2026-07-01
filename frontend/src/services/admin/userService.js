// Architect: SP
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin/users';

// Get all users who have ordered from the store
export const getStoreUsers = async () => {
    try {
        const response = await axios.get(API_URL, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get user statistics
export const getUserStats = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats`, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get specific user details
export const getUserDetails = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/${userId}`, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get user's orders from the store
export const getUserOrders = async (userId, page = 1, limit = 10) => {
    try {
        const response = await axios.get(
            `${API_URL}/${userId}/orders?page=${page}&limit=${limit}`, 
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
