// Architect: SP
import axios from 'axios';
import { getSuperadminAuthHeader } from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get all reviews
export const getAllReviews = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.rating) queryParams.append('rating', filters.rating);
    if (filters.fromDate) queryParams.append('fromDate', filters.fromDate);
    if (filters.toDate) queryParams.append('toDate', filters.toDate);
    if (filters.productId) queryParams.append('productId', filters.productId);
    
    const response = await axios.get(
      `${API_URL}/superadmin/reviews?${queryParams.toString()}`,
      { headers: getSuperadminAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get review by ID
export const getReviewById = async (reviewId) => {
  try {
    const response = await axios.get(
      `${API_URL}/superadmin/reviews/${reviewId}`,
      { headers: getSuperadminAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete review
export const deleteReview = async (reviewId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/superadmin/reviews/${reviewId}`,
      { headers: getSuperadminAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
