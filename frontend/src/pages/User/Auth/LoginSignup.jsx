// Architect: SP
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { sendOtp, verifyOtp, completeSignup } from '../../../services/userapi/authservice';
import { useUser } from '../../../Context/UserContext';
import './LoginSignup.css';

const LoginSignup = () => {
  const navigate = useNavigate();
  const { login: contextLogin, error: contextError, clearError } = useUser();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
  });
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  // Password validation function
  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password)
    };
    
    setPasswordRequirements(requirements);

    if (!password) {
      return 'Password is required';
    }
    
    const missingRequirements = [];
    if (!requirements.length) missingRequirements.push('at least 8 characters');
    if (!requirements.uppercase) missingRequirements.push('one uppercase letter');
    if (!requirements.lowercase) missingRequirements.push('one lowercase letter');
    if (!requirements.number) missingRequirements.push('one number');
    if (!requirements.special) missingRequirements.push('one special character (!@#$%^&*)');

    return missingRequirements.length > 0 
      ? `Password must contain ${missingRequirements.join(', ')}`
      : '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');

    // Add validation while keeping original functionality
    if (name === 'email') {
      setValidationErrors(prev => ({
        ...prev,
        email: validateEmail(value)
      }));
    } else if (name === 'password') {
      setValidationErrors(prev => ({
        ...prev,
        password: validatePassword(value)
      }));
    } else if (name === 'confirmPassword') {
      if (value !== formData.password) {
        setValidationErrors(prev => ({
          ...prev,
          confirmPassword: 'Passwords do not match'
        }));
      } else {
        setValidationErrors(prev => ({
          ...prev,
          confirmPassword: ''
        }));
      }
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await sendOtp(formData.email);
      if (response.success) {
        let successMsg = response.message;
        if (response.otp) {
          successMsg += ` (Development Mode: OTP auto-filled: ${response.otp})`;
          setFormData(prev => ({ ...prev, otp: response.otp }));
        }
        setMessage(successMsg);
        setStep(2);
      }
    } catch (error) {
      setError(error.message || 'An error occurred while sending OTP');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await verifyOtp(formData.email, formData.otp);
      if (response.success) {
        setMessage(response.message);
        setStep(3);
      }
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await completeSignup(
        formData.email,
        formData.otp,
        formData.password,
        formData.confirmPassword
      );

      if (response.success) {
        const loginSuccess = await contextLogin({
          email: formData.email,
          password: formData.password
        });

        if (loginSuccess) {
          setMessage('Signup successful!');
          navigate('/');
        } else {
          setError('Signup completed but login failed. Please try logging in.');
        }
      }
    } catch (error) {
      setError(error.message || 'An error occurred during signup');
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validate before submission
    const emailError = validateEmail(formData.email);
    const passwordError = !formData.password ? 'Password is required' : '';
    
    setValidationErrors({
      email: emailError,
      password: passwordError,
      confirmPassword: ''
    });

    // If there are validation errors, don't proceed
    if (emailError || passwordError) {
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const success = await contextLogin({
        email: formData.email,
        password: formData.password
      });

      if (success) {
        setMessage('Login successful!');
        navigate('/');
      } else {
        setError(contextError || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setError(error.message || 'An error occurred during login');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
          <div className="auth-toggle">
            <button
              className={isLogin ? 'active' : ''}
              onClick={() => setIsLogin(true)}
              disabled={loading}
            >
              Login
            </button>
            <button
              className={!isLogin ? 'active' : ''}
              onClick={() => {
                setIsLogin(false);
                setStep(1);
                setFormData({ email: '', otp: '', password: '', confirmPassword: '' });
                setError('');
                setMessage('');
              }}
              disabled={loading}
            >
              Sign Up
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        {isLogin ? (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                className={validationErrors.email ? 'error' : ''}
              />
              {validationErrors.email && (
                <div className="error-message">{validationErrors.email}</div>
              )}
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                className={validationErrors.password ? 'error' : ''}
              />
              {validationErrors.password && (
                <div className="error-message">{validationErrors.password}</div>
              )}
            </div>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form className="auth-form">
            {step === 1 && (
              <>
                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className={validationErrors.email ? 'error' : ''}
                  />
                  {validationErrors.email && (
                    <div className="error-message">{validationErrors.email}</div>
                  )}
                </div>
                <button onClick={handleSendOtp} className="auth-button" disabled={loading}>
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="form-group">
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter OTP"
                    value={formData.otp}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
                <button onClick={handleVerifyOtp} className="auth-button" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </>
            )}

            {step === 3 && (
              <>
                <div className="form-group">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className={validationErrors.password ? 'error' : ''}
                  />
                  {formData.password && (
                    <div className="password-requirements">
                      <p>Password Requirements:</p>
                      <ul>
                        <li className={passwordRequirements.length ? 'met' : 'not-met'}>
                          {passwordRequirements.length ? '✓' : '✗'} At least 8 characters
                        </li>
                        <li className={passwordRequirements.uppercase ? 'met' : 'not-met'}>
                          {passwordRequirements.uppercase ? '✓' : '✗'} One uppercase letter
                        </li>
                        <li className={passwordRequirements.lowercase ? 'met' : 'not-met'}>
                          {passwordRequirements.lowercase ? '✓' : '✗'} One lowercase letter
                        </li>
                        <li className={passwordRequirements.number ? 'met' : 'not-met'}>
                          {passwordRequirements.number ? '✓' : '✗'} One number
                        </li>
                        <li className={passwordRequirements.special ? 'met' : 'not-met'}>
                          {passwordRequirements.special ? '✓' : '✗'} One special character (!@#$%^&*)
                        </li>
                      </ul>
                    </div>
                  )}
                  {validationErrors.password && (
                    <div className="error-message">{validationErrors.password}</div>
                  )}
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={validationErrors.confirmPassword ? 'error' : ''}
                  />
                  {validationErrors.confirmPassword && (
                    <div className="error-message">{validationErrors.confirmPassword}</div>
                  )}
                </div>
                <button onClick={handleSignup} className="auth-button" disabled={loading || Object.values(validationErrors).some(error => error)}>
                  {loading ? 'Signing up...' : 'Complete Signup'}
                </button>
              </>
            )}
          </form>
        )}

        <Link to="/" className="home-button">
          <FontAwesomeIcon icon={faHome} />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
};

export default LoginSignup;
