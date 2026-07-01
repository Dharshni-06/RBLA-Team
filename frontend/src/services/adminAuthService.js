// Architect: SP
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin/auth';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Login admin
export const loginAdmin = async (credentials) => {
  try {
    const response = await api.post('/login', credentials);
    
    if (response.data.admin) {
      // Store admin info (no sensitive data) in sessionStorage (session-only)
      sessionStorage.setItem('admin', JSON.stringify({
        id: response.data.admin.id,
        username: response.data.admin.username,
        name: response.data.admin.name,
        store: response.data.admin.store
      }));
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Login failed');
    }
    throw new Error('Network error. Please check your connection.');
  }
};

// Get current admin
export const getCurrentAdmin = () => {
  try {
    const admin = sessionStorage.getItem('admin');
    return admin ? JSON.parse(admin) : null;
  } catch (error) {
    console.error('Error parsing admin data:', error);
    return null;
  }
};

// Get admin's store
export const getAdminStore = () => {
  const admin = getCurrentAdmin();
  return admin ? admin.store : null;
};

// Check if admin is logged in
export const isAdminLoggedIn = async () => {
  const admin = getCurrentAdmin();
  if (!admin) return false;

  try {
    // Verify session with backend
    await api.get('/verify');
    return true;
  } catch (error) {
    console.error('Session verification failed:', error);
    sessionStorage.removeItem('admin');
    return false;
  }
};

// Logout admin
export const logoutAdmin = async () => {
  try {
    await api.post('/logout');
    sessionStorage.removeItem('admin');
  } catch (error) {
    console.error('Logout error:', error);
    // Still remove local data even if server request fails
    sessionStorage.removeItem('admin');
    throw new Error('Logout failed. Please try again.');
  }
};

// Intercept 401 responses
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Clear session storage on authentication error
      sessionStorage.removeItem('admin');
    }
    return Promise.reject(error);
  }
);

// Check and clear restored session on fresh page load (not a refresh/reload)
let isInitialLoad = true;

const checkAndClearRestoredSession = () => {
  if (isInitialLoad) {
    isInitialLoad = false;
    
    // Check if this is a fresh page load (not a refresh/reload)
    let isReload = false;
    try {
      const entries = performance.getEntriesByType('navigation');
      if (entries.length > 0) {
        isReload = entries[0].type === 'reload';
      } else {
        isReload = performance.navigation?.type === 1;
      }
    } catch (e) {
      isReload = performance.navigation?.type === 1;
    }

    if (!isReload) {
      // If it's a fresh navigation, we clear any restored sessionStorage and call logout to clear backend cookies
      if (sessionStorage.getItem('admin')) {
        sessionStorage.removeItem('admin');
        // Call backend logout asynchronously to clear cookies
        api.post('/logout')
          .catch(err => console.error('Auto-logout on fresh load failed:', err));
      }
    }
  }
};

checkAndClearRestoredSession();

