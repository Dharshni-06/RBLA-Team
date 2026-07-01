// Architect: SP
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/admin';

// Create axios instance with credentials
const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true // Enable sending cookies
});

// Get all products with optional filters
export const getAllProducts = async (filters = {}) => {
    try {
        const response = await api.get('/products', { params: filters });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get single product
export const getProduct = async (productId) => {
    try {
        const response = await api.get(`/products/${productId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Create new product
export const createProduct = async (productData) => {
    try {
        const response = await api.post('/products', productData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update product
export const updateProduct = async (productId, productData) => {
    try {
        const response = await api.put(`/products/${productId}`, productData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete product
export const deleteProduct = async (productId) => {
    try {
        const response = await api.delete(`/products/${productId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update product stock
export const updateProductStock = async (productId, stock) => {
    try {
        const response = await api.patch(`/products/${productId}/stock`, { stock });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Toggle product active status
export const toggleProductActive = async (productId) => {
    try {
        const response = await api.patch(`/products/${productId}/toggle-active`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update all product stocks
export const updateAllProductStocks = async (stock) => {
    try {
        const response = await api.patch('/products/update-all-stocks', { stock });
        return response.data;
    } catch (error) {
        throw error;
    }
};
