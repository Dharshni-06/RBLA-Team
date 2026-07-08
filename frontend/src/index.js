import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { SnackbarProvider } from 'notistack';
import axios from 'axios';  // ✅ add this import

// ✅ Add interceptor here
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.response?.data?.expired) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      alert('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SnackbarProvider
      maxSnack={3}
      autoHideDuration={3000}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right'
      }}
    >
      <App />
    </SnackbarProvider>
  </React.StrictMode>
);

