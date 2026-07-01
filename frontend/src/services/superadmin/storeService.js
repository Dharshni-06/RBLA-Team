// Architect: SP
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Get all stores
export const getAllStores = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/superadmin/stores`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Create new store
export const createStore = async (storeData) => {
  try {
    const response = await axios.post(`${API_URL}/api/superadmin/stores`, storeData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Get store by ID
export const getStoreById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/superadmin/stores/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Update store
export const updateStore = async (id, storeData) => {
  try {
    const response = await axios.put(`${API_URL}/api/superadmin/stores/${id}`, storeData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Delete store
export const deleteStore = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/api/superadmin/stores/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};
