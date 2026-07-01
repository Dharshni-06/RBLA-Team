// Architect: SP
import axios from 'axios';
import { API_URL } from '../../config';

const API = `${API_URL}/api/admin/orders`;

/**
 * Get all orders for the admin's store
 */
export const getStoreOrders = async () => {
  try {
    const response = await axios.get(API, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching orders' };
  }
};

/**
 * Get order statistics for the admin's store
 */
export const getOrderStats = async () => {
  try {
    const response = await axios.get(`${API}/stats`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching order statistics' };
  }
};

/**
 * Get a single order by ID
 */
export const getOrderById = async (orderId) => {
  try {
    const response = await axios.get(`${API}/${orderId}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching order details' };
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await axios.patch(`${API}/${orderId}/status`, { status }, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error updating order status' };
  }
};
