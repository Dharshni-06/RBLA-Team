// Architect: SP
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin/sales';

// Get sales overview with optional timeframe filter
export const getSalesOverview = async (timeframe = 'all') => {
    try {
        console.log('Calling getSalesOverview with timeframe:', timeframe);
        const response = await axios.get(`${API_URL}/overview`, {
            params: { timeframe },
            withCredentials: true
        });
        console.log('Sales overview response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Sales overview error:', error);
        throw error.response?.data || error.message;
    }
};

// Get detailed sales report with date range and pagination
export const getSalesReport = async (params = {}) => {
    try {
        console.log('Calling getSalesReport with params:', params);
        const response = await axios.get(`${API_URL}/report`, {
            params,
            withCredentials: true
        });
        console.log('Sales report response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Sales report error:', error);
        throw error.response?.data || error.message;
    }
};
