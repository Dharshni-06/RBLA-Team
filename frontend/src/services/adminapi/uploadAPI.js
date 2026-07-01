// Architect: SP
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/admin';

// Create axios instance with credentials
const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
});

// Upload image file
export const uploadImage = async (file) => {
    try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post('/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Upload error details:', error.response?.data);
        throw error;
    }
};
