import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import "./entrepreneur3.css"; // Update to the correct CSS file for Siragugal
import siragugalLogo from "../components/Assets/sirlogo.png"; // Adjust the path if needed

const Entrepreneur3 = () => {
  const navigate = useNavigate(); // React Router navigation hook
  const [showMore, setShowMore] = useState(false);

  // Toggle function for 'Read More'
  const toggleReadMore = () => {
    setShowMore(!showMore);
  };

  return (
    <div className="siragugal-page">
      
      {/* Header */}
      <header className="siragugal-header">
        <img src={siragugalLogo} alt="Siragugal Logo" className="siragugal-logo" />
        <h1>Entrepreneur 3 Unit</h1>
        <p>MADE BY SURVIVORS OF BONDED LABOUR</p>
      </header>

      {/* About Section */}
      <section className="siragugal-about">
        <h2>About Entrepreneur 3 Unit</h2>
        <h4><center>**Entrepreneur 3: Empowering Survivors of Bonded Labour through Sustainable Livelihood**</center></h4>

        <p className={showMore ? "expanded" : ""}>
          'Entrepreneur 3' is a remarkable community enterprise that stands as a beacon of hope and empowerment for individuals who have endured the harsh realities of bonded labour. Established in 2019 in the town of Thiruthani, located in the Tiruvallur district of Tamil Nadu, Entrepreneur 3 is a collective of survivors who have transformed their lives through resilience, skill development, and entrepreneurship. This initiative, which initially brought together 14 individuals, has evolved into a thriving block printing and tailoring unit, providing not just livelihood, but also dignity and purpose to those involved.

          {showMore && (
            <span>
              The foundation of Entrepreneur 3 lies in its profound mission to create sustainable livelihoods for individuals who have been freed from the chains of bonded labour. These survivors, having faced years of exploitation and oppression, have now become role models for others in similar circumstances. Through rigorous training in block printing and tailoring, they have acquired valuable skills that enable them to generate a stable income. This transformation is not just about economic independence; it is about breaking the cycle of poverty and marginalization, offering these individuals a chance at a better life.
              
              In many ways, Entrepreneur 3 represents a shift from victimhood to empowerment. The survivors, who were once trapped in a system of forced labour and subjugation, have now taken charge of their own destinies. By running a block printing unit, they are not only earning a livelihood but also preserving a traditional craft that is deeply rooted in Indian culture. Block printing, with its intricate designs and vibrant colors, is a reflection of their creativity and resilience. Tailoring, too, serves as a form of self-expression and an avenue for economic empowerment.

              The significance of Entrepreneur 3 goes beyond its economic impact. It is a symbol of hope for other survivors of bonded labour, proving that they too can overcome their circumstances and achieve freedom and dignity. Entrepreneur 3’s success demonstrates the power of collective action, as the 14 founding members have worked together to build something truly transformative. Their journey from being survivors to becoming entrepreneurs is a testament to their strength and determination. It also sends a powerful message to the wider society, encouraging people to support such initiatives and contribute to the eradication of bonded labour.
            </span>
            
          )}
        </p>
        <button className="read-more-btn" onClick={toggleReadMore}>
          {showMore ? "Read Less" : "Read More"}
        </button>
      </section>

      <div className="siragugal-container">
            {/* Services Section */}
            <section className="siragugal-section siragugal-services">
                <h2>Our Services</h2>
                <ul>
                  <li>Sanitary Napkin Unit - Meesanallur</li>
                  <li>Siragugal Bricks</li>
                  <li>Siragugal Handicrafts</li>
                </ul>
            </section>

            {/* Contact Section */}
            <section className="siragugal-section siragugal-contact">
                <h2>Contact Us</h2>
                <p>Have questions? Get in touch with us at:</p>
                <p>Email: info@siragugalunit.com</p>
                <p>Phone: +91 98765 43210</p>
                <button onClick={() => navigate("/AboutPage")}>Go to About Us</button>
            </section>
        </div>
    </div>
  );
};

export default Entrepreneur3;
