// Architect: SP
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Helper function to get auth header
const getAuthHeader = () => {
    const token = localStorage.getItem('superadminToken');
    return { Authorization: `Bearer ${token}` };
};

// Get all workers with filters
export const getWorkers = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await axios.get(
            `${API_URL}/api/superadmin/workers?${queryParams}`,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get worker by ID
export const getWorkerById = async (id) => {
    try {
        const response = await axios.get(
            `${API_URL}/api/superadmin/workers/${id}`,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Create new worker
export const createWorker = async (workerData) => {
    try {
        const response = await axios.post(
            `${API_URL}/api/superadmin/workers`,
            workerData,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Update worker
export const updateWorker = async (id, workerData) => {
    try {
        const response = await axios.put(
            `${API_URL}/api/superadmin/workers/${id}`,
            workerData,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Delete worker
export const deleteWorker = async (id) => {
    try {
        const response = await axios.delete(
            `${API_URL}/api/superadmin/workers/${id}`,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get worker statistics
export const getWorkerStats = async () => {
    try {
        const response = await axios.get(
            `${API_URL}/api/superadmin/workers/stats`,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
