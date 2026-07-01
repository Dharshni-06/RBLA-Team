// Architect: SP
import axios from 'axios';
import { getSuperadminAuthHeader } from './authService';

// Base URL for the superadmin API
const API_URL = 'http://localhost:5000/api';

// Get all categories
export const getAllCategories = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/superadmin/categories`,
      { headers: getSuperadminAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to fetch categories');
  }
};

// Create a new category
export const createCategory = async (categoryData) => {
  try {
    const response = await axios.post(
      `${API_URL}/superadmin/categories`,
      categoryData,
      { headers: getSuperadminAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to create category');
  }
};

// Update a category
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await axios.put(
      `${API_URL}/superadmin/categories/${id}`,
      categoryData,
      { headers: getSuperadminAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to update category');
  }
};

// Delete a category
export const deleteCategory = async (id) => {
  try {
    const response = await axios.delete(
      `${API_URL}/superadmin/categories/${id}`,
      { headers: getSuperadminAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to delete category');
  }
};
