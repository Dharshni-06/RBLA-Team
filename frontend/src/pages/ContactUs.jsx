import React from 'react';
import './ContactUs.css';
import { FaInstagram, FaFacebookF, FaTwitter, FaUser, FaEnvelope, FaPhone, FaComment, FaPen } from "react-icons/fa";

const ContactUs = () => {
  return (
    <> {/* React Fragment to wrap multiple sections */}
      <section className="contact-us">
        <div className="contact-us-left">
          <h1>Contact</h1>
          <div className="underline"></div>
          <p>
            We’d love to help you with an order, for general customer service
            enquiries or product questions. The best time to reach us is Mon - Sat
            9:00 am - 6:00 pm (Indian Standard Time).
          </p>
          <div className="contact-details">
            <h3>Visit Office</h3>
            <p>No.7, Ganganagram, Irular Colony, Karthikapuram, Thiruthani, Thiruvallur - 631209, Tamilnadu.</p>
          </div>
          <div className="contact-details">
            <h3>Email</h3>
            <a href="mailto:varnamtamilnadu@gmail.com">
              varnamtamilnadu@gmail.com
            </a>
          </div>
          <div className="contact-details phone-numbers">
            <div className="phone">
              <h3>Phone</h3>
              <a href="tel:+91 95972 35265">+91 95972 35265</a><br />
              <a href="tel:+91 97879 59372">+91 97879 59372</a>
            </div>
          </div>
          <div className="social-icons">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FaTwitter />
            </a>
          </div>
        </div>
        
        <section className="contact-us-right">
          <div className="contact-form-container">
            <h1>Get In Touch With Us</h1>
            <p>
              We're dedicated to providing exceptional customer service and ensuring your shopping experience with Entrepreneur 1 is nothing short of delightful.
            </p>
            <form className="contact-form">
              <div className="form-group">
                <div className="input-field">
                  <input type="text" placeholder="Your Name" required />
                  <FaUser className="input-icon" />
                </div>
                <div className="input-field">
                  <input type="email" placeholder="Email" required />
                  <FaEnvelope className="input-icon" />
                </div>
              </div>
              <div className="form-group">
                <div className="input-field">
                  <input type="tel" placeholder="Phone" required />
                  <FaPhone className="input-icon" />
                </div>
                <div className="input-field">
                  <input type="text" placeholder="Subject" required />
                  <FaComment className="input-icon" />
                </div>
              </div>
              <div className="input-field textarea-field">
                <textarea placeholder="Message" required></textarea>
                <FaPen className="input-icon" />
              </div>
              <button type="submit" className="submit-btn">Send Message</button>
            </form>
          </div>
        </section>
      </section>
      
      {/* OpenStreetMap Section */}
<section className="map-container">
  <iframe
    title="OpenStreetMap"
    src="https://www.openstreetmap.org/export/embed.html?bbox=79.6080,13.1871,79.6085,13.1876&layer=mapnik"
    width="100%"
    height="450"
    style={{ border: 0 }}
    allowFullScreen=""
    loading="lazy"
  ></iframe>
</section>

    </>
  );
};

export default ContactUs;