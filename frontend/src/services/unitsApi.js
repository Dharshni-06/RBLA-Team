// Architect: SP
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/units';

// Get all units
export const getAllUnits = async () => {
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

// Create a new unit
export const createUnit = async (unitData) => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await axios.post(API_URL, unitData, {
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
        throw new Error(error.message || 'Failed to create unit');
    }
};

// Update a unit
export const updateUnit = async (unitId, unitData) => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await axios.put(`${API_URL}/${unitId}`, unitData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Delete a unit
export const deleteUnit = async (unitId) => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await axios.delete(`${API_URL}/${unitId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get a single unit by ID
export const getUnitById = async (unitId) => {
    try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${API_URL}/${unitId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
