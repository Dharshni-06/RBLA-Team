// Architect: SP
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/public';

// Create axios instance
const api = axios.create({
    baseURL: BASE_URL
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
  console.log('Starting Request:', {
    url: request.url,
    method: request.method,
    data: request.data,
    params: request.params
  });
  return request;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
);

// Get marquee message
export const getMarqueeMessage = async () => {
  try {
    const response = await api.get('/marquee');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get new collections
export const getNewCollections = async () => {
  try {
    const response = await api.get('/newcollections');
    return response.data;
  } catch (error) {
    throw error;
  }
};
