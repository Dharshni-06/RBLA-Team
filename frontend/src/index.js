import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { SnackbarProvider } from 'notistack';
import axios from 'axios';

const redirectToLogin = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  if (window.location.pathname !== '/loginsignup') {
    window.location.replace('/loginsignup');
  }
};

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.response?.data?.expired) {
      redirectToLogin();
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

