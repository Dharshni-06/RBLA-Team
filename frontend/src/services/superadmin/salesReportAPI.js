// Architect: SP
import axios from 'axios';
import { getSuperadminAuthHeader } from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Get revenue analysis
export const getRevenueAnalysis = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.groupBy) queryParams.append('groupBy', filters.groupBy);
    
    const response = await axios.get(
      `${API_URL}/api/superadmin/sales/revenue?${queryParams.toString()}`,
      { headers: getSuperadminAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get product sales performance
export const getProductSalesPerformance = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.groupBy) queryParams.append('groupBy', filters.groupBy);

    const response = await axios.get(
      `${API_URL}/api/superadmin/sales/products?${queryParams.toString()}`,
      { headers: getSuperadminAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get sales by category
export const getSalesByCategory = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.groupBy) queryParams.append('groupBy', filters.groupBy);

    const response = await axios.get(
      `${API_URL}/api/superadmin/sales/categories?${queryParams.toString()}`,
      { headers: getSuperadminAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get sales conversion metrics
export const getSalesConversion = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.groupBy) queryParams.append('groupBy', filters.groupBy);

    const response = await axios.get(
      `${API_URL}/api/superadmin/sales/conversion?${queryParams.toString()}`,
      { headers: getSuperadminAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get reviews analysis
export const getReviewsAnalysis = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/superadmin/sales/reviews`,
      { headers: getSuperadminAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Function to get low stock products (stock < 10)
export const getLowStockProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/superadmin/sales/low-stock-products`, {
      headers: getSuperadminAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch low stock products');
  }
};

export default {
  getRevenueAnalysis,
  getProductSalesPerformance,
  getSalesByCategory,
  getSalesConversion,
  getReviewsAnalysis,
  getLowStockProducts
};
