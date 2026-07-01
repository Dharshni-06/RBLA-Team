import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';
import user from '../Assets/user.png';
import home from '../Assets/home.png';
import logo from '../Assets/logo.png';

const Hero = () => {
  return (
    <div className="hero">
      <div className="hero-left">
        <h2>NEW ARRIVALS ONLY</h2>
        <div className="hero-text">
          <div className="hero-user">
            <p>New</p>
            <img src={user} alt="User Icon" />
          </div>
          <p>Collections</p>
          <p>For Everyone</p>
        </div>
        <Link to="/ProductPage" className="hero-latest-btn">
          Latest Collection
          <img src={home} alt="Home Icon" />
        </Link>
      </div>
      <div className="hero-right">
        <img src={logo} alt="Logo" className="hero-logo" />
      </div>
    </div>
  );
};

export default Hero;
