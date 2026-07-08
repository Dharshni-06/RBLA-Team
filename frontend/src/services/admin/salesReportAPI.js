import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Configure Axios with cookies (for admin authentication cookies)
const client = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

export const getRevenueAnalysis = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.groupBy) queryParams.append('groupBy', filters.groupBy);
    
    const response = await client.get(`/api/admin/sales/revenue?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getProductSalesPerformance = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.groupBy) queryParams.append('groupBy', filters.groupBy);

    const response = await client.get(`/api/admin/sales/products?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getSalesByCategory = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.groupBy) queryParams.append('groupBy', filters.groupBy);

    const response = await client.get(`/api/admin/sales/categories?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getSalesConversion = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.groupBy) queryParams.append('groupBy', filters.groupBy);

    const response = await client.get(`/api/admin/sales/conversion?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getReviewsAnalysis = async () => {
  try {
    const response = await client.get('/api/admin/sales/reviews');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getLowStockProducts = async () => {
  try {
    const response = await client.get('/api/admin/sales/low-stock-products');
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
