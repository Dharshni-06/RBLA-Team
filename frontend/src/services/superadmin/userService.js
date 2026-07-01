// Architect: SP
import axios from 'axios';
import { getSuperadminAuthHeader } from '../superadminAuthService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Get all users with optional filtering and pagination
 * @param {Object} params - Query parameters
 * @returns {Promise} - Promise with users data
 */
export const getAllUsers = async (params = {}) => {
  try {
    const headers = getSuperadminAuthHeader();
    
    // Build query string from params
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    
    const response = await axios.get(
      `${API_URL}/superadmin/users?${queryParams.toString()}`,
      { headers }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error.response?.data || { message: 'Failed to fetch users' };
  }
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise} - Promise with user data
 */
export const getUserById = async (userId) => {
  try {
    const headers = getSuperadminAuthHeader();
    const response = await axios.get(`${API_URL}/superadmin/users/${userId}`, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error.response?.data || { message: 'Failed to fetch user details' };
  }
};

/**
 * Update user
 * @param {string} userId - User ID
 * @param {Object} userData - User data to update
 * @returns {Promise} - Promise with updated user data
 */
export const updateUser = async (userId, userData) => {
  try {
    const headers = getSuperadminAuthHeader();
    const response = await axios.put(
      `${API_URL}/superadmin/users/${userId}`,
      userData,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw error.response?.data || { message: 'Failed to update user' };
  }
};

/**
 * Delete user
 * @param {string} userId - User ID
 * @returns {Promise} - Promise with success message
 */
export const deleteUser = async (userId) => {
  try {
    const headers = getSuperadminAuthHeader();
    const response = await axios.delete(`${API_URL}/superadmin/users/${userId}`, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    throw error.response?.data || { message: 'Failed to delete user' };
  }
};

/**
 * Get user statistics
 * @returns {Promise} - Promise with user statistics
 */
export const getUserStats = async () => {
  try {
    const headers = getSuperadminAuthHeader();
    const response = await axios.get(`${API_URL}/superadmin/users/stats`, { headers });
    
    // Return the stats object directly from the response
    return response.data;
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    throw error.response?.data || { message: 'Failed to fetch user statistics' };
  }
};
