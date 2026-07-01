// Architect: SP
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../../../Context/CartContext';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    cartTotal, 
    loading, 
    error,
    updateQuantity,
    removeFromCart,
    clearCart 
  } = useCart();

  if (loading) {
    return (
      <div className="cart-loading">
        <div className="loading-spinner"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')} className="continue-shopping">
          Continue Shopping
        </button>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="cart-empty">
        <h2>Your Cart is Empty</h2>
        <p>Add some products to your cart and they will show up here!</p>
        <button onClick={() => navigate('/')} className="continue-shopping">
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>Shopping Cart</h1>
      
      <div className="cart-content">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item._id} className="cart-item">
              <div className="item-image">
                <img src={item.productDetails.image} alt={item.productDetails.name} />
              </div>
              
              <div className="item-details">
                <h3>{item.productDetails.name}</h3>
                {item.productDetails.size && (
                  <p className="item-size">Size: {item.productDetails.size}</p>
                )}
                {item.productDetails.printedSide && (
                  <p className="item-print">Print: {item.productDetails.printedSide}</p>
                )}
              </div>

              <div className="item-quantity">
                <button 
                  onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                  disabled={item.quantity <= 1}
                  className="quantity-btn"
                >
                  <FontAwesomeIcon icon={faMinus} />
                </button>
                <span>{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  className="quantity-btn"
                >
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>

              <div className="item-price">
                <p className="price">₹{(item.price * item.quantity).toFixed(2)}</p>
                <p className="unit-price">₹{item.price.toFixed(2)} each</p>
              </div>

              <button 
                onClick={() => removeFromCart(item._id)}
                className="remove-item"
                title="Remove item"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{cartTotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{cartTotal >= 499 ? 'FREE' : '₹50.00'}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{(cartTotal + (cartTotal >= 499 ? 0 : 50)).toFixed(2)}</span>
          </div>
          
          <button 
            onClick={() => navigate('/checkout')} 
            className="checkout-btn"
          >
            Proceed to Checkout
          </button>
          
          <button 
            onClick={() => navigate('/')} 
            className="continue-shopping"
          >
            Continue Shopping
          </button>

          <button 
            onClick={clearCart} 
            className="clear-cart"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
