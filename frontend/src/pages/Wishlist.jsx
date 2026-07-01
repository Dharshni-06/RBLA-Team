import React from 'react';
import { Link } from 'react-router-dom';
import './Wishlist.css'; 
import bheart from "../components/Assets/bheart.png";

const Wishlist = () => {
  return (
    <div className="wishlist-container">
      <div className="empty-wishlist">
        <img src={bheart} alt="bheart" />
        <h2>Wishlist Feature Coming Soon</h2>
        <p>We're working on bringing you a better shopping experience.</p>
        <Link to="/">
          <button className="shop-now-btn">Continue Shopping</button>
        </Link>
      </div>
    </div>
  );
};

export default Wishlist;
