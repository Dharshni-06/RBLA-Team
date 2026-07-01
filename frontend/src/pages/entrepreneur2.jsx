import React from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import "./entrepreneur2.css";
import vaalogo from "../components/Assets/vaalogo.png"; // Adjust the path if needed

const Entrepreneur2 = () => {
  const navigate = useNavigate(); // React Router navigation hook

  return (
    <div className="vaagai-page">
      
      {/* Header */}
      <header className="vaagai-header">
        <img src={vaalogo} alt="Vaagai Logo" className="vaagai-logo" />
        <h1>Entrepreneur 2 Unit</h1>
        <p>MADE BY SURVIVORS OF BONDED LABOUR</p>
      </header>

      {/* About Section */}
      <section className="vaagai-about">
        <h2>About Entrepreneur 2 Unit</h2>
        <p>
          The Entrepreneur 2 Unit, established in 2019, is a community-owned enterprise operated by resilient survivors of bonded labor who have successfully reclaimed their freedom and dignity. Specializing in handloom weaving, block printing, and custom tailoring, our skilled artisans create high-quality, eco-friendly textile products. Our mission is to preserve traditional Tamil Nadu weaving techniques, build sustainable livelihoods for our families, and share our unique handmade creations with the world.
        </p>
      </section>

      <div className="vaagai-container">
            {/* Services Section */}
            <section className="vaagai-section vaagai-services">
                <h2>Our Services</h2>
                <ul>
                    <li>Handloom weaving & home textiles</li>
                    <li>Traditional block printing & dyeing</li>
                    <li>Custom tailoring & custom designs</li>
                    <li>Skill development & vocational training</li>
                </ul>
            </section>

            {/* Contact Section */}
            <section className="vaagai-section vaagai-contact">
                <h2>Contact Us</h2>
                <p>Have questions? Get in touch with us at:</p>
                <p>Email: info@vaagaiunit.com</p>
                <p>Phone: +91 98765 43210</p>
                <button onClick={() => navigate("/AboutPage")}>Go to About Us</button>
            </section>
        </div>

    </div>
  );
};

export default Entrepreneur2;
