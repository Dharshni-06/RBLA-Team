import React from 'react';
import { useNavigate } from 'react-router-dom';
import SPlogo from '../components/Assets/splogo.png';
import './UserLogin.css';

const UserLogin = () => {
  const navigate = useNavigate();

  const handleAdminLogin = () => {
    navigate('/admin/login');
  };

  const handleSuperAdminLogin = () => {
    navigate('/superadmin/login');
  };

  return (
    <div className="user-login-container">
      <div className="main-content">
        {/* Left side - Organization Info */}
        <div className="business-logo">
          <img src={SPlogo} alt="Logo" className="sp-logo" />
          <h2>RBLA</h2>
          <p className="organization-desc">
            Rescue Bonded Labour Association (RBLA) is dedicated to identifying, rescuing, and rehabilitating bonded laborers across India. 
            Through our tireless efforts, we work to break the chains of modern slavery and restore dignity to vulnerable workers.
          </p>
        </div>

        {/* Right side - Login Form */}
        <div className="login-card">
          <div className="welcome-section">
            <h1>WELCOME</h1>
            <p>Please select your login type to continue</p>
          </div>

          

          <div className="login-type-buttons">
            <button 
              className="type-button admin-btn"
              onClick={handleAdminLogin}
            >
              Login as Admin
            </button>
            <button 
              className="type-button superadmin-btn"
              onClick={handleSuperAdminLogin}
            >
              Login as Superadmin
            </button>
          </div>

          <div className="back-buttons-container">
            <button onClick={() => navigate(-1)} className="back-btn-link">
              ← Go Back
            </button>
            <button onClick={() => navigate('/')} className="back-btn-link home-btn-link">
              🏠 Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
