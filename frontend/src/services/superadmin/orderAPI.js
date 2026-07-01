// Architect: SP
import axios from 'axios';
import { getSuperadminAuthHeader } from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get all orders
export const getAllOrders = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
    if (filters.toDate) queryParams.append('toDate', filters.toDate);
    
    const response = await axios.get(
      `${API_URL}/superadmin/orders?${queryParams.toString()}`,
      { headers: getSuperadminAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get order by ID
export const getOrderById = async (orderId) => {
  try {
    const response = await axios.get(
      `${API_URL}/superadmin/orders/${orderId}`,
      { headers: getSuperadminAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await axios.patch(
      `${API_URL}/superadmin/orders/${orderId}/status`,
      { status },
      { headers: getSuperadminAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all return requests globally
export const getAllReturns = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/superadmin/orders/returns`,
      { headers: getSuperadminAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update return request status
export const updateReturnStatus = async (returnId, status) => {
  try {
    const response = await axios.patch(
      `${API_URL}/superadmin/orders/returns/${returnId}/status`,
      { status },
      { headers: getSuperadminAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
