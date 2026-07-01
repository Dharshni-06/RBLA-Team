import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import SuperadminLogin from '../components/superadmin/superadminlogin';
import Dashboard from '../components/superadmin/dashboard';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('superadminToken');
  if (!token) {
    return <Navigate to="/superadmin/login" replace />;
  }
  return children;
};

const SuperadminRoutes = () => {
  return (
    <Routes>
      <Route path="/superadmin/login" element={<SuperadminLogin />} />
      <Route 
        path="/superadmin/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default SuperadminRoutes;