// Architect: SP
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/superadmin/workers';

// Fetch all workers
export const getWorkers = async () => {
  try {
    const token = localStorage.getItem('superadminToken');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    const response = await axios.get(API_URL, config);
    return response.data.workers;
  } catch (error) {
    console.error('Error fetching workers:', error);
    throw error;
  }
};

// Add a new worker
export const addWorker = async (workerData) => {
  try {
    const token = localStorage.getItem('superadminToken');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    const response = await axios.post(API_URL, workerData, config);
    return response.data;
  } catch (error) {
    console.error('Error adding worker:', error);
    throw error;
  }
};

// Update an existing worker
export const updateWorker = async (id, updatedData) => {
  try {
    const token = localStorage.getItem('superadminToken');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    const response = await axios.put(`${API_URL}/${id}`, updatedData, config);
    return response.data;
  } catch (error) {
    console.error('Error updating worker:', error);
    throw error;
  }
};

// Delete a worker by ID
export const deleteWorker = async (id) => {
  try {
    const token = localStorage.getItem('superadminToken');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    const response = await axios.delete(`${API_URL}/${id}`, config);
    return response.data;
  } catch (error) {
    console.error('Error deleting worker:', error);
    throw error;
  }
};
