import React from "react";
import "./Footer.css";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaLinkedinIn, } from "react-icons/fa";
import Chatbot from "../Chatbot/Chatbot";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Quick Links Section */}
        <div className="footer-section">
          <h3>Get to Know Us</h3>
          <ul>
            <li><Link to="/AboutPage">About RBLA</Link></li>
            <li><Link to="/ProductPage">Products</Link></li>
            <li><Link to="/careers">Careers</Link></li>
            <li><Link to="/press">Press Releases</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Services</h3>
          <ul>
            <li><Link to="/bulkorders">Bulk Orders</Link></li>
          </ul>
        </div>


        <div className="footer-section-help">
          <h3>Terms and Conditions</h3>
          <ul>
            <li><Link to="/ReturnOrder">Returns Centre</Link></li>
            <li><Link to="/Report Fraud">Report Fraud</Link></li>
            <li><Link to="/HelpCenter">Help Center</Link></li>


          </ul>
        </div>

        {/* Social Links Section */}
        <div className="footer-section">
          <h3>Connect with us</h3>
          <div className="social-links">
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <FaYoutube />
            </a>
            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedinIn />
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bottom Section */}
      <div className="footer-bottom">
        <div className="footer-bottom-left">
          <Link to="/UserLogin" className="superadmin-link">Super Admin Login</Link>
        </div>
        <div className="footer-bottom-right">
          <p>Designed & Developed by MCA'27 @MCC</p>
        </div>
      </div>
      {/*<Chatbot/>*/}
    </footer>
  );
};

export default Footer;