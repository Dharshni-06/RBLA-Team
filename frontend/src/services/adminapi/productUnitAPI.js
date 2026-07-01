// Architect: SP
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/admin';

// Create axios instance with credentials
const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true // Enable sending cookies
});

// Get all product units
export const getAllProductUnits = async () => {
    try {
        const response = await api.get('/product-units');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Create a new product unit
export const createProductUnit = async (unitData) => {
    try {
        const response = await api.post('/product-units', unitData);
        return response.data;
    } catch (error) {
        throw error;
    }
};
