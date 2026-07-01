import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../../../Context/CartContext';
import { useUser } from '../../../Context/UserContext';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems: cart, cartTotal: total, updateQuantity, removeFromCart } = useCart();
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  useEffect(() => {
    const savedAddress = localStorage.getItem('shippingAddress');
    if (savedAddress) {
      try {
        setShippingInfo(JSON.parse(savedAddress));
      } catch (e) {
        console.error('Error parsing shippingAddress from localStorage:', e);
      }
    } else if (user) {
      setShippingInfo(prev => ({
        ...prev,
        fullName: user.name || prev.fullName,
        phone: user.phoneNumber || prev.phone
      }));
    }
  }, [user]);

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('shippingAddress', JSON.stringify(shippingInfo));
    setStep(2);
    navigate('/payment');
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/')}>Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-steps">
        {['Cart Review', 'Shipping', 'Payment'].map((stepName, index) => (
          <div key={stepName} className={`step ${step >= index + 1 ? 'active' : ''}`}>
            {stepName}
          </div>
        ))}
      </div>

      <div className="checkout-content">
        <div className="order-summary">
          <h2>Order Summary</h2>
          {cart.map((item) => (
            <div key={item._id || item.productId} className="cart-item">
              <img src={item.productDetails.image} alt={item.productDetails.name} />
              <div className="item-details">
                <h3>{item.productDetails.name}</h3>
                <div className="checkout-quantity-controls">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item._id || item.productId, Math.max(1, item.quantity - 1))}
                    disabled={item.quantity <= 1}
                    className="quantity-btn"
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                  <span className="quantity-val">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item._id || item.productId, item.quantity + 1)}
                    className="quantity-btn"
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </div>
                <p className="item-price">₹{item.price * item.quantity}</p>
              </div>
              <button
                type="button"
                onClick={() => removeFromCart(item._id || item.productId)}
                className="checkout-remove-btn"
                title="Remove item"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          ))}
          <div className="total">
            <h3>Total: ₹{total}</h3>
          </div>
        </div>

        <div className="shipping-form">
          <h2>Shipping Information</h2>
          <form onSubmit={handleShippingSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={shippingInfo.fullName}
                onChange={(e) => setShippingInfo({...shippingInfo, fullName: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <textarea
                value={shippingInfo.address}
                onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={shippingInfo.city}
                  onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  value={shippingInfo.state}
                  onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Pincode</label>
                <input
                  type="text"
                  value={shippingInfo.pincode}
                  onChange={(e) => setShippingInfo({...shippingInfo, pincode: e.target.value})}
                  required
                  pattern="[0-9]{6}"
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={shippingInfo.phone}
                  onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                  required
                  pattern="[0-9]{10}"
                />
              </div>
            </div>
            <button type="submit" className="proceed-btn">
              Proceed to Payment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
