// Architect: SP
import axios from 'axios';
import { getSuperadminAuthHeader } from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get all payments
export const getAllPayments = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
    if (filters.toDate) queryParams.append('toDate', filters.toDate);
    
    const response = await axios.get(
      `${API_URL}/superadmin/payments?${queryParams.toString()}`,
      { headers: getSuperadminAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get payment by ID
export const getPaymentById = async (paymentId) => {
  try {
    const response = await axios.get(
      `${API_URL}/superadmin/payments/${paymentId}`,
      { headers: getSuperadminAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update payment status
export const updatePaymentStatus = async (paymentId, status) => {
  try {
    const response = await axios.patch(
      `${API_URL}/superadmin/payments/${paymentId}/status`,
      { status },
      { headers: getSuperadminAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
