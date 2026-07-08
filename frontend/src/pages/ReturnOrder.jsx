import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faBoxOpen, faShippingFast, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import './ReturnOrder.css';

const ReturnOrder = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    orderId: '',
    email: '',
    productId: '',
    reason: '',
    details: ''
  });
  const [errors, setErrors] = useState({});
  const [products, setProducts] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isPrepopulated, setIsPrepopulated] = useState(false);

  // Prepopulate if navigating from orders with state
  useEffect(() => {
    if (location.state) {
      const { orderId, email, productId } = location.state;
      setFormData(prev => ({
        ...prev,
        orderId: orderId || '',
        email: email || '',
        productId: productId || ''
      }));
      setIsPrepopulated(true);
      if (orderId && email) {
        verifyAndLoadProducts(orderId, email, productId);
      }
    }
  }, [location]);

  // Dynamically load products if user types orderId and email manually
  useEffect(() => {
    if (!isPrepopulated && formData.orderId.trim() && formData.email.trim() && /\S+@\S+\.\S+/.test(formData.email)) {
      const timer = setTimeout(() => {
        verifyAndLoadProducts(formData.orderId.trim(), formData.email.trim());
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [formData.orderId, formData.email, isPrepopulated]);

  const verifyAndLoadProducts = async (orderId, email, selectProductId = null) => {
    try {
      setLoadingProducts(true);
      const response = await axios.get('/api/public/general/orders/verify-return', {
        params: { orderId, email }
      });
      if (response.data.success) {
        setProducts(response.data.products || []);
        setReturnRequests(response.data.returnRequests || []);
        if (selectProductId) {
          setFormData(prev => ({ ...prev, productId: selectProductId }));
        } else if (response.data.products && response.data.products.length > 0) {
          if (response.data.products.length === 1) {
            setFormData(prev => ({ ...prev, productId: response.data.products[0].id }));
          }
        }
        setErrors(prev => ({ ...prev, orderId: '', email: '', verify: '' }));
      }
    } catch (err) {
      console.error('Order verification failed:', err);
      setProducts([]);
      setReturnRequests([]);
      setErrors(prev => ({
        ...prev,
        verify: err.response?.data?.message || 'Verification failed. Check Order ID and Email.'
      }));
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.orderId.trim()) {
      tempErrors.orderId = 'Order ID is required';
    }
    
    if (!formData.email.trim()) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
    }

    if (!formData.productId) {
      tempErrors.productId = 'Please select a product to return';
    }

    if (!formData.reason) {
      tempErrors.reason = 'Please select a reason for the return';
    }

    if (formData.reason === 'other' && !formData.details.trim()) {
      tempErrors.details = 'Additional details are required for other reason';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await axios.post('/api/public/general/orders/return', {
          orderId: formData.orderId,
          email: formData.email,
          productId: formData.productId,
          reason: formData.reason,
          details: formData.reason === 'other' ? formData.details : undefined
        });

        if (response.data.success) {
          toast.success('Return request submitted successfully! Our logistics team will review and contact you in 24-48 hours.');
          setFormData({
            orderId: '',
            email: '',
            productId: '',
            reason: '',
            details: ''
          });
          setProducts([]);
          setReturnRequests([]);
          setErrors({});
          setIsPrepopulated(false);
        }
      } catch (err) {
        console.error('Error submitting return:', err);
        toast.error(err.response?.data?.message || 'Failed to submit return request.');
      }
    } else {
      toast.error('Please correct the validation errors in the form.');
    }
  };

  return (
    <div className="returns-page-container">
      {/* Hero Header */}
      <div className="returns-page-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Returns Centre</h1>
          <p>We want you to love your handloom creations. Read our policy or request a return below.</p>
        </div>
      </div>

      <div className="returns-content-section">
        {/* Step-by-Step Instructions */}
        <section className="instructions-section">
          <h2>How Our Return Process Works</h2>
          <div className="underline"></div>

          <div className="steps-container">
            <div className="step-card">
              <div className="step-number-icon">
                <FontAwesomeIcon icon={faFileAlt} />
              </div>
              <h3>1. Submit Request</h3>
              <p>Fill out the return request form below with your Order ID, Email, and reason for return.</p>
            </div>
            
            <div className="step-card">
              <div className="step-number-icon">
                <FontAwesomeIcon icon={faBoxOpen} />
              </div>
              <h3>2. Pack the Item</h3>
              <p>Keep the product unused, in its original condition, with tags and packaging intact.</p>
            </div>

            <div className="step-card">
              <div className="step-number-icon">
                <FontAwesomeIcon icon={faShippingFast} />
              </div>
              <h3>3. Free Pick-up</h3>
              <p>Our delivery executive will pick up the package from your address within 2-3 business days.</p>
            </div>

            <div className="step-card">
              <div className="step-number-icon">
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <h3>4. Refund Processed</h3>
              <p>Once inspected, the refund will be credited to your account within 5-7 business days.</p>
            </div>
          </div>
        </section>

        {/* Return Form Section */}
        <section className="returns-form-section">
          <div className="returns-form-wrapper">
            <h2>Initiate a Return</h2>
            <div className="underline"></div>
            <p className="form-helper-text">
              Please enter your details below. Returns must be requested within <strong>3 days</strong> of delivery.
            </p>

            <form onSubmit={handleSubmit} className="returns-form">
              <div className="form-group">
                <label htmlFor="orderId">Order ID / Transaction ID *</label>
                <input
                  type="text"
                  id="orderId"
                  name="orderId"
                  value={formData.orderId}
                  onChange={handleInputChange}
                  className={errors.orderId ? 'input-error' : ''}
                  placeholder="e.g., 64b8f52ef322a105c87e412b"
                  disabled={isPrepopulated}
                />
                {errors.orderId && <span className="error-text">{errors.orderId}</span>}
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
                  disabled={isPrepopulated}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              {loadingProducts && (
                <div className="loading-products-indicator">
                  <span className="spinner-small"></span> Verifying order and loading items...
                </div>
              )}

              {errors.verify && <div className="error-text verify-error">{errors.verify}</div>}

              {products.length > 0 && (
                <div className="form-group">
                  <label htmlFor="productId">Product to Return *</label>
                  <select
                    id="productId"
                    name="productId"
                    value={formData.productId}
                    onChange={handleInputChange}
                    className={errors.productId ? 'input-error' : ''}
                    disabled={isPrepopulated && formData.productId !== ''}
                  >
                    <option value="">-- Select Product --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} - ₹{p.price} ({p.store})
                      </option>
                    ))}
                  </select>
                  {errors.productId && <span className="error-text">{errors.productId}</span>}
                </div>
              )}

              {(() => {
                const selectedReturnRequest = returnRequests.find(
                  r => r.product === formData.productId || r.product?._id === formData.productId
                );

                if (selectedReturnRequest) {
                  return (
                    <div className="existing-return-status animate-fade-in">
                      <div className={`status-banner banner-${selectedReturnRequest.status.toLowerCase()}`}>
                        {selectedReturnRequest.status === 'Pending' && '⏳ Return Request Pending'}
                        {selectedReturnRequest.status === 'Approved' && '✅ Return Request Approved'}
                        {selectedReturnRequest.status === 'Rejected' && '❌ Return Request Rejected'}
                      </div>
                      
                      <div className="status-detail-group">
                        <p><strong>Order Number:</strong> {selectedReturnRequest.orderNumber}</p>
                        <p><strong>Date Requested:</strong> {new Date(selectedReturnRequest.createdAt).toLocaleDateString()}</p>
                        <p><strong>Reason:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedReturnRequest.reason.replace('-', ' ')}</span></p>
                        {selectedReturnRequest.details && (
                          <p><strong>Details:</strong> {selectedReturnRequest.details}</p>
                        )}
                      </div>

                      <div className="status-message-box">
                        <h4>Return Status Update</h4>
                        <p>
                          {selectedReturnRequest.status === 'Pending' && 'Your return request has been received and is currently under review by our logistics team. We will verify the details and update your status in 24-48 hours.'}
                          {selectedReturnRequest.status === 'Approved' && 'Your return request has been approved! Our representative will visit your shipping address to collect the item within 2-3 business days. Please keep the product unused and in its original packaging.'}
                          {selectedReturnRequest.status === 'Rejected' && 'Your return request was not approved. Return requests are subject to inspection and must meet our quality guidelines. If you believe this is an error, please contact customer support.'}
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <>
                    <div className="form-group">
                      <label htmlFor="reason">Reason for Return *</label>
                      <select
                        id="reason"
                        name="reason"
                        value={formData.reason}
                        onChange={handleInputChange}
                        className={errors.reason ? 'input-error' : ''}
                      >
                        <option value="">-- Select Reason --</option>
                        <option value="size-issue">Size / Dimensions Mismatch</option>
                        <option value="damaged">Product Received Damaged</option>
                        <option value="wrong-item">Received Wrong Product</option>
                        <option value="quality">Quality Not As Expected</option>
                        <option value="other">Other Reason</option>
                      </select>
                      {errors.reason && <span className="error-text">{errors.reason}</span>}
                    </div>

                    {formData.reason === 'other' && (
                      <div className="form-group animate-fade-in">
                        <label htmlFor="details">Other Reasons *</label>
                        <textarea
                          id="details"
                          name="details"
                          rows="4"
                          value={formData.details}
                          onChange={handleInputChange}
                          className={errors.details ? 'input-error' : ''}
                          placeholder="Provide additional details about the other reason..."
                          required
                        ></textarea>
                        {errors.details && <span className="error-text">{errors.details}</span>}
                      </div>
                    )}

                    <button type="submit" className="submit-return-btn">
                      Submit Return Inquiry
                    </button>
                  </>
                );
              })()}
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ReturnOrder;
