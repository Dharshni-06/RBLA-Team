// Architect: SP
import axios from 'axios';
import { authEvents, AUTH_EVENTS } from './authEvents';

// Base URL for the backend API (adjust if your backend runs on a different port)
const API_URL = 'http://localhost:5000/api/user/auth';

// Send OTP to email
export const sendOtp = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/send-otp`, { email });
    return response.data; // { success: true, message: 'OTP sent to your email' }
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Error sending OTP' };
  }
};

// Verify OTP
export const verifyOtp = async (email, otp) => {
  try {
    const response = await axios.post(`${API_URL}/verify-otp`, { email, otp });
    return response.data; // { success: true, message: 'OTP verified' }
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Error verifying OTP' };
  }
};

// Complete signup with password
export const completeSignup = async (email, otp, password, confirmPassword) => {
  try {
    const response = await axios.post(`${API_URL}/complete-signup`, {
      email,
      otp,
      password,
      confirmPassword,
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      authEvents.notify(AUTH_EVENTS.LOGIN);
    }
    return response.data; // { success: true, message: 'Signup completed successfully', token: '...' }
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Error completing signup' };
  }
};

// Login
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      authEvents.notify(AUTH_EVENTS.LOGIN);
    }
    return response.data; // { success: true, message: 'Login successful', token: '...' }
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Error logging in' };
  }
};

// Get auth token
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Check if user is logged in
export const isLoggedIn = () => {
  return !!localStorage.getItem('token');
};

// Logout
export const logout = () => {
  localStorage.removeItem('token');
  authEvents.notify(AUTH_EVENTS.LOGOUT);
};
