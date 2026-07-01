// Architect: SP
import axios from 'axios';

// Base URL for admin-related endpoints
const API_URL = 'http://localhost:5000/api/superadmin/admins';

// Create a new admin
export const createAdmin = async (adminData) => {
  try {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token); // Debug log

    if (!token) {
      throw new Error('Authentication required. Please login.');
    }

    console.log('Making API request with token...'); // Debug log
    const response = await axios.post(API_URL, adminData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    console.log('API Response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Admin creation error details:', {
      response: error.response,
      message: error.message,
      token: localStorage.getItem('token')
    });
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || 'Failed to create admin');
  }
};

// Get all admins
export const getAllAdmins = async () => {
  try {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token); // Debug log

    if (!token) {
      throw new Error('Authentication required. Please login.');
    }

    console.log('Making API request with token...'); // Debug log
    const response = await axios.get(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    console.log('API Response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Admin fetch error details:', {
      response: error.response,
      message: error.message,
      token: localStorage.getItem('token')
    });
    throw new Error(error.response?.data?.message || 'Failed to fetch admins');
  }
};

// Get a single admin by ID
export const getAdminById = async (adminId) => {
  try {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token); // Debug log

    if (!token) {
      throw new Error('Authentication required. Please login.');
    }

    console.log('Making API request with token...'); // Debug log
    const response = await axios.get(`${API_URL}/${adminId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    console.log('API Response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Admin fetch error details:', {
      response: error.response,
      message: error.message,
      token: localStorage.getItem('token')
    });
    throw new Error(error.response?.data?.message || 'Failed to fetch admin');
  }
};

// Update an admin by ID
export const updateAdmin = async (adminId, adminData) => {
  try {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token); // Debug log

    if (!token) {
      throw new Error('Authentication required. Please login.');
    }

    console.log('Making API request with token...'); // Debug log
    const response = await axios.put(`${API_URL}/${adminId}`, adminData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    console.log('API Response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Admin update error details:', {
      response: error.response,
      message: error.message,
      token: localStorage.getItem('token')
    });
    throw new Error(error.response?.data?.message || 'Failed to update admin');
  }
};

// Delete an admin by ID
export const deleteAdmin = async (adminId) => {
  try {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token); // Debug log

    if (!token) {
      throw new Error('Authentication required. Please login.');
    }

    console.log('Making API request with token...'); // Debug log
    const response = await axios.delete(`${API_URL}/${adminId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    console.log('API Response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Admin deletion error details:', {
      response: error.response,
      message: error.message,
      token: localStorage.getItem('token')
    });
    throw new Error(error.response?.data?.message || 'Failed to delete admin');
  }
};

// Get admins by store
export const getAdminsByStore = async (storeName) => {
  try {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token); // Debug log

    if (!token) {
      throw new Error('Authentication required. Please login.');
    }

    console.log('Making API request with token...'); // Debug log
    const response = await axios.get(`${API_URL}/store/${storeName}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    console.log('API Response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Admins by store fetch error details:', {
      response: error.response,
      message: error.message,
      token: localStorage.getItem('token')
    });
    throw new Error(error.response?.data?.message || 'Failed to fetch admins by store');
  }
};
