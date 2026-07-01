// Architect: SP
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/admin';

// Create axios instance with credentials
const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true // Enable sending cookies
});

// Get all orders for the admin's store
export const getStoreOrders = async () => {
    try {
        const response = await api.get('/orders');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get order statistics for the admin's store
export const getOrderStats = async () => {
    try {
        const response = await api.get('/orders/stats');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get a single order by ID
export const getOrderById = async (orderId) => {
    try {
        const response = await api.get(`/orders/${orderId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
    try {
        const response = await api.patch(`/orders/${orderId}/status`, { status });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get all return requests for the admin's store
export const getStoreReturns = async () => {
    try {
        const response = await api.get('/orders/returns');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update return request status
export const updateReturnStatus = async (returnId, status) => {
    try {
        const response = await api.patch(`/orders/returns/${returnId}/status`, { status });
        return response.data;
    } catch (error) {
        throw error;
    }
};
