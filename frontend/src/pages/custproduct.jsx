import React from 'react';
import './custproduct.css';
import { Link } from 'react-router-dom';


const CustProduct = () => {
  return (
    <div className="custproduct-container">
      <h1>Welcome to Customize Your Product</h1>
      <p>Start creating your own unique product by choosing from the options below!</p>
      <Link to="/paintapp" className="customize-btn">
      <center>Click Here</center> 
  <span className="tooltip">Customize Your Own Product</span>
      </Link>
      
    </div>
  );
};

export default CustProduct;
