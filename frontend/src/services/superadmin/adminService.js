// Architect: SP
import axios from 'axios';
import { getSuperadminAuthHeader } from '../superadminAuthService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Get all admins
 * @returns {Promise} Promise with admins data
 */
export const getAllAdmins = async () => {
  try {
    const headers = getSuperadminAuthHeader();
    const response = await axios.get(`${API_URL}/superadmin/admins`, { headers });
    return {
      success: response.data.success,
      admins: response.data.data || [],
      count: response.data.count
    };
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error.response?.data || { message: 'Failed to fetch admins' };
  }
};

/**
 * Get admin by ID
 * @param {string} adminId - Admin ID
 * @returns {Promise} Promise with admin data
 */
export const getAdminById = async (adminId) => {
  try {
    const headers = getSuperadminAuthHeader();
    const response = await axios.get(`${API_URL}/superadmin/admins/${adminId}`, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error fetching admin ${adminId}:`, error);
    throw error.response?.data || { message: 'Failed to fetch admin details' };
  }
};

/**
 * Create new admin
 * @param {Object} adminData - Admin data
 * @returns {Promise} Promise with created admin data
 */
export const createAdmin = async (adminData) => {
  try {
    const headers = getSuperadminAuthHeader();
    const response = await axios.post(`${API_URL}/superadmin/admins`, adminData, { headers });
    return response.data;
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error.response?.data || { message: 'Failed to create admin' };
  }
};

/**
 * Update admin
 * @param {string} adminId - Admin ID
 * @param {Object} adminData - Admin data to update
 * @returns {Promise} Promise with updated admin data
 */
export const updateAdmin = async (adminId, adminData) => {
  try {
    const headers = getSuperadminAuthHeader();
    const response = await axios.put(
      `${API_URL}/superadmin/admins/${adminId}`,
      adminData,
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating admin ${adminId}:`, error);
    throw error.response?.data || { message: 'Failed to update admin' };
  }
};

/**
 * Delete admin
 * @param {string} adminId - Admin ID
 * @returns {Promise} Promise with success message
 */
export const deleteAdmin = async (adminId) => {
  try {
    const headers = getSuperadminAuthHeader();
    const response = await axios.delete(`${API_URL}/superadmin/admins/${adminId}`, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error deleting admin ${adminId}:`, error);
    throw error.response?.data || { message: 'Failed to delete admin' };
  }
};

/**
 * Get admin statistics
 * @returns {Promise} Promise with admin statistics
 */
export const getAdminStats = async () => {
  try {
    const headers = getSuperadminAuthHeader();
    const response = await axios.get(`${API_URL}/superadmin/admins/stats`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    throw error.response?.data || { message: 'Failed to fetch admin statistics' };
  }
};
