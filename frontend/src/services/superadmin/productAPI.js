// Architect: SP
import axios from 'axios';
import { getSuperadminAuthHeader } from './authService';

// Base URL for the superadmin API
const API_URL = 'http://localhost:5000/api';

// Get all products with optional filtering
export const getAllProducts = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.isActive !== undefined) queryParams.append('isActive', filters.isActive);
    if (filters.store) queryParams.append('store', filters.store);
    
    const response = await axios.get(
      `${API_URL}/superadmin/products?${queryParams.toString()}`,
      { headers: getSuperadminAuthHeader() }
    );
    
    return response.data.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to fetch products');
  }
};

// Get a single product
export const getProduct = async (id) => {
  try {
    const response = await axios.get(
      `${API_URL}/superadmin/products/${id}`,
      { headers: getSuperadminAuthHeader() }
    );
    
    return response.data.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to fetch product');
  }
};

// Create a new product
export const createProduct = async (productData) => {
  try {
    const response = await axios.post(
      `${API_URL}/superadmin/products`,
      productData,
      { headers: getSuperadminAuthHeader() }
    );
    
    return response.data.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to create product');
  }
};

// Update a product
export const updateProduct = async (id, productData) => {
  try {
    const response = await axios.put(
      `${API_URL}/superadmin/products/${id}`,
      productData,
      { headers: getSuperadminAuthHeader() }
    );
    
    return response.data.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to update product');
  }
};

// Delete a product
export const deleteProduct = async (id) => {
  try {
    const response = await axios.delete(
      `${API_URL}/superadmin/products/${id}`,
      { headers: getSuperadminAuthHeader() }
    );
    
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to delete product');
  }
};

// Update product stock
export const updateProductStock = async (id, stock) => {
  try {
    const response = await axios.patch(
      `${API_URL}/superadmin/products/${id}/stock`,
      { stock },
      { headers: getSuperadminAuthHeader() }
    );
    
    return response.data.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to update product stock');
  }
};

// Update all product stocks
export const updateAllProductStocks = async (stock, storeFilter) => {
  try {
    const queryParams = new URLSearchParams();
    if (storeFilter) queryParams.append('store', storeFilter);
    
    const response = await axios.patch(
      `${API_URL}/superadmin/products/update-all-stocks?${queryParams.toString()}`,
      { stock },
      { headers: getSuperadminAuthHeader() }
    );
    
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to update all product stocks');
  }
};

// Toggle product active status
export const toggleProductActive = async (id) => {
  try {
    const response = await axios.patch(
      `${API_URL}/superadmin/products/${id}/toggle-active`,
      {},
      { headers: getSuperadminAuthHeader() }
    );
    
    return response.data.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to toggle product active status');
  }
};
