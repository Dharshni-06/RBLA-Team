// Architect: SP
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../Context/CartContext';
import { useUser } from '../../../Context/UserContext';
import { createOrder, cancelOrder } from '../../../services/userapi/orderAPI';
import { 
  getClientToken, 
  processPayment, 
  validateCard, 
  detectCardType, 
  formatCardNumber, 
  validateExpiry, 
  formatExpiry 
} from '../../../services/braintreeService';
import './PaymentPage.css';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal: total, clearCart } = useCart();
  const { user } = useUser();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: ''
  });

  const [validation, setValidation] = useState({
    cardNumber: true,
    cardHolder: true,
    expiry: true,
    cvv: true
  });

  // Handle card number input with formatting and validation
  const handleCardNumberChange = (e) => {
    const formattedNumber = formatCardNumber(e.target.value);
    setCardInfo({ ...cardInfo, cardNumber: formattedNumber });
    setValidation({
      ...validation,
      cardNumber: validateCard(formattedNumber)
    });
  };

  // Handle expiry date input with formatting and validation
  const handleExpiryChange = (e) => {
    const formattedExpiry = formatExpiry(e.target.value);
    setCardInfo({ ...cardInfo, expiry: formattedExpiry });
    setValidation({
      ...validation,
      expiry: validateExpiry(formattedExpiry)
    });
  };

  // Get card type icon class
  const getCardTypeIcon = () => {
    if (!cardInfo.cardNumber) return '';
    const type = detectCardType(cardInfo.cardNumber);
    return `card-icon ${type}`;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Retrieve shipping address from localStorage
      const savedAddress = localStorage.getItem('shippingAddress');
      const shippingAddress = savedAddress ? JSON.parse(savedAddress) : null;

      // Create order first
      const orderData = {
        products: cartItems.map(item => ({
          product: item.productId,
          quantity: item.quantity
        })),
        shippingAddress: {
          fullName: shippingAddress?.fullName || user?.name || '',
          address: shippingAddress?.address || user?.address || '',
          city: shippingAddress?.city || user?.city || '',
          state: shippingAddress?.state || user?.state || '',
          pincode: shippingAddress?.pincode || user?.pincode || '',
          phone: shippingAddress?.phone || user?.phone || ''
        },
        paymentStatus: paymentMethod === 'cod' ? 'COD' : 'Unpaid'
      };

      const orderResponse = await createOrder(orderData);
      
      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create order');
      }

      // If COD, we place order and finish immediately
      if (paymentMethod === 'cod') {
        clearCart();
        localStorage.removeItem('shippingAddress');
        navigate('/orders');
        return;
      }

      // Get Braintree token
      const tokenResponse = await getClientToken();
      
      if (!tokenResponse.success || !tokenResponse.clientToken) {
        throw new Error('Failed to initialize payment');
      }

      // Process payment
      const paymentResponse = await processPayment(
        orderResponse.data._id,
        cardInfo
      );

      if (paymentResponse.success) {
        clearCart();
        localStorage.removeItem('shippingAddress');
        navigate('/orders');
      } else {
        throw new Error(paymentResponse.message || 'Payment failed');
      }

    } catch (err) {
      setError(err.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      <h2>Payment Details</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="payment-methods">
        <div className="method-selector">
          <button 
            className={`method-btn ${paymentMethod === 'card' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('card')}
            disabled={loading}
          >
            Credit/Debit Card
          </button>
          <button 
            className={`method-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('upi')}
            disabled={loading}
          >
            UPI
          </button>
          <button 
            className={`method-btn ${paymentMethod === 'cod' ? 'active' : ''}`}
            onClick={() => setPaymentMethod('cod')}
            disabled={loading}
          >
            Cash on Delivery
          </button>
        </div>

        {paymentMethod === 'card' && (
          <form className="card-form">
            <div className="form-group">
              <label>Card Number</label>
              <div className="card-input-wrapper">
                <input
                  type="text"
                  value={cardInfo.cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  required
                  maxLength="19"
                  disabled={loading}
                  className={!validation.cardNumber ? 'invalid' : ''}
                />
                <span className={getCardTypeIcon()}></span>
              </div>
              {!validation.cardNumber && (
                <span className="error-text">Invalid card number</span>
              )}
            </div>
            
            <div className="form-group">
              <label>Card Holder Name</label>
              <input
                type="text"
                value={cardInfo.cardHolder}
                onChange={(e) => setCardInfo({...cardInfo, cardHolder: e.target.value})}
                placeholder="John Doe"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="text"
                  value={cardInfo.expiry}
                  onChange={handleExpiryChange}
                  placeholder="MM/YY"
                  required
                  maxLength="5"
                  disabled={loading}
                  className={!validation.expiry ? 'invalid' : ''}
                />
                {!validation.expiry && (
                  <span className="error-text">Invalid expiry date</span>
                )}
              </div>
              
              <div className="form-group">
                <label>CVV</label>
                <input
                  type="password"
                  value={cardInfo.cvv}
                  onChange={(e) => setCardInfo({...cardInfo, cvv: e.target.value})}
                  placeholder="123"
                  required
                  maxLength="3"
                  disabled={loading}
                />
              </div>
            </div>
          </form>
        )}

        {paymentMethod === 'upi' && (
          <div className="upi-form">
            <div className="form-group">
              <label>UPI ID</label>
              <input
                type="text"
                placeholder="username@upi"
                required
                disabled={loading}
              />
            </div>
          </div>
        )}

        {paymentMethod === 'cod' && (
          <div className="cod-info">
            <p>Pay ₹{total} at the time of delivery</p>
          </div>
        )}

        <div className="payment-summary">
          <h3>Order Total: ₹{total}</h3>
          <button 
            type="submit"
            onClick={handlePayment} 
            className="pay-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
