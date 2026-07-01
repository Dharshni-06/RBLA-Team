import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginSuperadmin } from '../../services/superadminAuthService';
import './superadminlogin.css';

const SuperadminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await loginSuperadmin({ username, password });

      if (response.token) {
        // Store the token
        localStorage.setItem('token', response.token);
        localStorage.setItem('superadminToken', response.token);

        // Store superadmin info if available
        if (response.superadmin) {
          localStorage.setItem('superadmin', JSON.stringify(response.superadmin));
        }

        // Call the onLogin prop if provided
        if (onLogin) {
          onLogin(response.token);
        }

        // Show success toast notification
        toast.success('Superadmin logged in successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });

        // Navigate to dashboard
        navigate('/superadmin/dashboard');
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid credentials or server error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      {/* Stars Background */}
      <div className="stars"></div>

      {/* Mountains Background */}
      <div className="mountains">
        <div className="mountain mountain-1"></div>
        <div className="mountain mountain-2"></div>
        <div className="mountain mountain-3"></div>
        <div className="mountain mountain-4"></div>
      </div>

      <div className="login-page">
        <div className="login-container">
          {/* Left Section with Welcome Message and Design */}
          <div className="image-section">
            <div className="image-content">
              <h1>Welcome back!</h1>
              <p>You can sign in to access your account.</p>
            </div>
            <div className="dotted-pattern"></div>
          </div>

          {/* Right Section - Login Form */}
          <div className="login-form-section">
            <h1 className="brand-title"> All Stores </h1>
            <h2 className="login-subtitle">Superadmin Login</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleLogin} className="login-form">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="input-field"
                disabled={isLoading}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
                disabled={isLoading}
              />
              <button type="submit" className="login-button" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
              <button 
                type="button" 
                className="login-button"
                onClick={() => navigate('/UserLogin')}
                disabled={isLoading}
              >
                Back to User Login
              </button>
              <button 
                type="button" 
                className="login-button secondary"
                onClick={() => navigate('/')}
                disabled={isLoading}
              >
                Back to Home
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperadminLogin;
