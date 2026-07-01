// Architect: SP
import axios from 'axios';

// Base URL for the superadmin API
const API_URL = 'http://localhost:5000/api';

// Login superadmin
export const loginSuperadmin = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/superadmin/auth/login`, credentials);
    
    // Store token in localStorage
    localStorage.setItem('superadminToken', response.data.token);
    
    if (response.data.superadmin) {
      // Store superadmin info (no sensitive data)
      localStorage.setItem('superadmin', JSON.stringify({
        id: response.data.superadmin.id,
        username: response.data.superadmin.username
      }));
    }
    
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Login failed');
  }
};

// Logout superadmin
export const logoutSuperadmin = () => {
  localStorage.removeItem('superadminToken');
  localStorage.removeItem('superadmin');
  return { success: true };
};

// Get current superadmin
export const getCurrentSuperadmin = () => {
  try {
    const superadmin = localStorage.getItem('superadmin');
    return superadmin ? JSON.parse(superadmin) : null;
  } catch (error) {
    console.error('Error parsing superadmin data:', error);
    return null;
  }
};

// Check if superadmin is logged in
export const isSuperadminLoggedIn = async () => {
  const superadmin = getCurrentSuperadmin();
  const token = localStorage.getItem('superadminToken');
  
  if (!superadmin || !token) {
    return false;
  }
  
  try {
    // You can add a verification endpoint if needed
    return true;
  } catch (error) {
    console.error('Session verification failed:', error);
    return false;
  }
};

// Get superadmin auth header
export const getSuperadminAuthHeader = () => {
  const token = localStorage.getItem('superadminToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};
