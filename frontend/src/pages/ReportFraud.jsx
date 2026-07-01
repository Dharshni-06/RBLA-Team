import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faUpload, faTimes } from '@fortawesome/free-solid-svg-icons';
import './ReportFraud.css';

const ReportFraud = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    suspectUrl: '',
    details: '',
    screenshot: null
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      screenshot: e.target.files[0]
    }));
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.email.trim()) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
    }

    if (!formData.details.trim()) {
      tempErrors.details = 'Please provide details about the suspicious activity';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Submitting Fraud Report:', formData);
      toast.success('Thank you. Your report has been securely submitted. Our legal and security team will investigate immediately.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        suspectUrl: '',
        details: '',
        screenshot: null
      });
      setErrors({});
    } else {
      toast.error('Please fill in the required fields before submitting.');
    }
  };

  return (
    <div className="fraud-page-container">
      {/* Hero Header */}
      <div className="fraud-page-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Report Fraud & Counterfeits</h1>
          <p>Protecting our women cooperatives and brand integrity. Report copycat sites, unauthorized sellers, or suspicious listings.</p>
        </div>
      </div>

      <div className="fraud-content-section">
        {/* Info Box */}
        <section className="fraud-info-section">
          <div className="info-alert-card">
            <div className="icon-shield">
              <FontAwesomeIcon icon={faShieldAlt} />
            </div>
            <div className="info-text">
              <h3>Our Commitment to Brand Authenticity</h3>
              <p>
                All official Unity Threads handloom, blockprinted, and handcrafted products are sold exclusively 
                on this website. We do not sell on unauthorized online marketplaces or through individual social media accounts 
                requesting direct bank transfers. If you spot copycats or fraud, please report it below.
              </p>
            </div>
          </div>
        </section>

        {/* Fraud Form Section */}
        <section className="fraud-form-section">
          <div className="fraud-form-wrapper">
            <h2>Fraud Reporting Form</h2>
            <div className="underline"></div>

            <form onSubmit={handleSubmit} className="fraud-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Your Name (Optional)</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Your Phone (Optional)</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'input-error' : ''}
                  placeholder="name@example.com"
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="suspectUrl">Suspicious Website Link / Seller Profile URL (Optional)</label>
                <input
                  type="text"
                  id="suspectUrl"
                  name="suspectUrl"
                  value={formData.suspectUrl}
                  onChange={handleInputChange}
                  placeholder="e.g., https://fake-site.com/unitythreads"
                />
              </div>

              <div className="form-group">
                <label htmlFor="details">Description of Suspicious Activity *</label>
                <textarea
                  id="details"
                  name="details"
                  rows="4"
                  value={formData.details}
                  onChange={handleInputChange}
                  className={errors.details ? 'input-error' : ''}
                  placeholder="Describe where you saw the fraudulent activity, what they were offering, or any details about unauthorized messaging..."
                ></textarea>
                {errors.details && <span className="error-text">{errors.details}</span>}
              </div>

              <div className="form-group">
                <label>Screenshot / Proof (Optional)</label>
                <div className="file-upload-box">
                  <input
                    type="file"
                    id="screenshot"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="screenshot" className="file-upload-label">
                    <FontAwesomeIcon icon={faUpload} />
                    <span>{formData.screenshot ? formData.screenshot.name : 'Upload Screenshot (PNG, JPG)'}</span>
                  </label>
                </div>
              </div>

              <button type="submit" className="submit-fraud-btn">
                Submit Security Report
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReportFraud;
