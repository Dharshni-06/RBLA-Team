// Architect: SP
import axios from 'axios';
import { getAuthToken } from './authservice';

const BASE_URL = 'http://localhost:5000/api/user/reviews';

// Check if user can review a product
export const canReviewProduct = async (productId) => {
    try {
        const response = await axios.get(
            `${BASE_URL}/can-review/${productId}`,
            {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            }
        );
        return response.data;
    } catch (error) {
        return { canReview: false, message: error.response?.data?.message || 'Unable to verify purchase' };
    }
};

// Create a new review
export const createReview = async (reviewData) => {
    try {
        const response = await axios.post(
            `${BASE_URL}`,
            reviewData,
            {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            throw { success: false, message: 'Please login to submit a review' };
        }
        throw error.response?.data || { success: false, message: 'Failed to submit review' };
    }
};

// Get reviews for a product
export const getProductReviews = async (productId, page = 1, limit = 10) => {
    try {
        const response = await axios.get(
            `${BASE_URL}/product/${productId}?page=${page}&limit=${limit}`
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, message: 'Failed to fetch reviews' };
    }
};

// Update a review
export const updateReview = async (reviewId, reviewData) => {
    try {
        const response = await axios.put(
            `${BASE_URL}/${reviewId}`,
            reviewData,
            {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            throw { success: false, message: 'Please login to update your review' };
        }
        throw error.response?.data || { success: false, message: 'Failed to update review' };
    }
};

// Delete a review
export const deleteReview = async (reviewId) => {
    try {
        const response = await axios.delete(
            `${BASE_URL}/${reviewId}`,
            {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            throw { success: false, message: 'Please login to delete your review' };
        }
        throw error.response?.data || { success: false, message: 'Failed to delete review' };
    }
};

// Vote on a review
export const voteReview = async (reviewId) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/${reviewId}/vote`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            throw { success: false, message: 'Please login to vote on reviews' };
        }
        throw error.response?.data || { success: false, message: 'Failed to vote on review' };
    }
};
