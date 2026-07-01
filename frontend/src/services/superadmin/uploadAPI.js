// Architect: SP
import axios from 'axios';
import { getSuperadminAuthHeader } from './authService';

// Base URL for the superadmin API
const API_URL = 'http://localhost:5000/api';

// Upload image
export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await axios.post(
      `${API_URL}/superadmin/upload/image`,
      formData,
      { 
        headers: {
          ...getSuperadminAuthHeader(),
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data.fileUrl;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Failed to upload image');
  }
};
