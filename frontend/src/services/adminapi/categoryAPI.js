// Architect: SP
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/admin';

// Create axios instance with credentials
const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true // Enable sending cookies
});

// Get all categories
export const getAllCategories = async () => {
    try {
        const response = await api.get('/categories');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Create a new category
export const createCategory = async (categoryData) => {
    try {
        const response = await api.post('/categories', categoryData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update a category
export const updateCategory = async (categoryId, categoryData) => {
    try {
        const response = await api.put(`/categories/${categoryId}`, categoryData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete a category
export const deleteCategory = async (categoryId) => {
    try {
        const response = await api.delete(`/categories/${categoryId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
