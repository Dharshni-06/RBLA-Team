import React from 'react';
import { Link } from 'react-router-dom';
import './SellerStories.css';
import about1 from '../Assets/about1.png';

const SellerStories = () => {
  return (
    <div className="seller-stories-container">
      <div className="seller-stories-left">
        <h2>SELLER STORIES</h2>
        <p>Learn more about the Creators we support and their journey to bring to you their passionate and innovative products, right at your doorstep!</p>
        <Link to="/AboutPage" className="know-sellers-btn">
          Know our sellers
        </Link>
      </div>
      <div className="seller-stories-right" style={{ backgroundImage: ` url(${about1})` }}>
        <div className="crafting-stories">
          <h2>Crafting Stories</h2>
          <p>Shaping lives at each turn</p>
        </div>
      </div>
    </div>
  );
};

export default SellerStories;
