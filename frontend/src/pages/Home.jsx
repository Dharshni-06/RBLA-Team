import React from 'react';
import { useNavigate } from 'react-router-dom';
import FashionForward from '../components/FashionForward/FashionForward';
import SellerStories from '../components/SellerStories/SellerStories';
import './Home.css';
import Chatbot from "../components/Chatbot/Chatbot";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <FashionForward />
      <SellerStories />
      
      <section className="bulk-orders">
        <div className="bulk-orders-content">
          <h1>Place a bulk order with us</h1>
          <div className="underline"></div>
          <p>
            We partner with store owners, corporate clients, event companies, or others 
            interested in wholesale buying. Each order will be fully customized to fit your needs.
          </p>
          <button className="bulk-orders-btn" onClick={() => navigate('/contactus')}>
            Get In Touch
          </button>
          <button className="bulk-btn" onClick={() => navigate('/bulkorders')}>
            Learn More
          </button>
        </div>
        <div className="bulk-orders-image"></div>
      </section>

      {/* ✅ Add chatbot here so it floats */}
      <Chatbot />
    </div>
  );
};

export default Home;
