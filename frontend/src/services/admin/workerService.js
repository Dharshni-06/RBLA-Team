// Architect: SP
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin/workers';

// Get all workers
export const getWorkers = async () => {
    try {
        const response = await axios.get(API_URL, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Add new worker
export const addWorker = async (workerData) => {
    try {
        const response = await axios.post(API_URL, workerData, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Update worker
export const updateWorker = async (workerId, workerData) => {
    try {
        const response = await axios.put(`${API_URL}/${workerId}`, workerData, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Delete worker
export const deleteWorker = async (workerId) => {
    try {
        const response = await axios.delete(`${API_URL}/${workerId}`, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get worker details
export const getWorkerDetails = async (workerId) => {
    try {
        const response = await axios.get(`${API_URL}/${workerId}`, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
