// Architect: SP
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/superadmin/customers';

// Get all customers
export const getAllCustomers = async () => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Create a new customer
export const createCustomer = async (customerData) => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await axios.post(API_URL, customerData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        // If there's a response with error message from our API
        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }
        // If it's a network error or other axios error
        throw new Error(error.message || 'Failed to create customer');
    }
};

// Update a customer
export const updateCustomer = async (customerId, customerData) => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await axios.put(`${API_URL}/${customerId}`, customerData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Delete a customer
export const deleteCustomer = async (customerId) => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await axios.delete(`${API_URL}/${customerId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get a single customer by ID
export const getCustomerById = async (customerId) => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${API_URL}/${customerId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Search customers
export const searchCustomers = async (searchQuery) => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${API_URL}/search`, {
            params: { query: searchQuery },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Filter customers by store
export const filterCustomersByStore = async (store) => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${API_URL}/filter`, {
            params: { store },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
