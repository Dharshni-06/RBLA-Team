import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AboutPage.css';

import artisanImage from "../components/Assets/v11.png";
import varlogo from "../components/Assets/varlogo.png";
import vaalogo from "../components/Assets/vaalogo.png";
import sirlogo from "../components/Assets/sirlogo.png";

const AboutPage = () => {
  const navigate = useNavigate();

  const handleUnitClick = (unit) => {
    if (unit === "Entrepreneur 1") navigate("/entrepreneur1");
    else if (unit === "Entrepreneur 2") navigate("/entrepreneur2");
    else if (unit === "Entrepreneur 3") navigate("/entrepreneur3");
    else navigate(`/${unit.replace(/\s+/g, '').toLowerCase()}`);
  };

  const units = [
    { name: "Entrepreneur 1", text_color: "#80002f", font_style: "italic", logo: varlogo },
    { name: "Entrepreneur 2", text_color: "#80002f", font_style: "italic", logo: vaalogo },
    { name: "Entrepreneur 3", text_color: "#80002f", font_style: "italic", logo: sirlogo }
  ];




  return (
    <div className="about-container">
      <div className="about-content">

        {/* Hero Section */}
        <div className="hero-section">
          <div className="heading">
            <h1>
               An authentic platform for pure craft.
            </h1>
          </div>
          <div className="content">
            <p>
            UnityThreads is a digital platform for some of the world's oldest and most intricate craft forms, with a special focus on the art of weaving and textile creation. We started this social enterprise close to 10 years ago in order to preserve, showcase, and share the talent of Tamil Nadu's artisans with the world. At UnityThreads, we believe in the power of connection—bringing together artisans from diverse regions of Tamil Nadu to create threads of unity through their craft.


            </p>
          </div>
        </div>

        {/* Artisan Section */}
        <div className="section artisan-section">
          <div className="heading">
            <h3>Established in 2019, Chennai, India.</h3>
          </div>
          <div className="content"><center>
            <p>
              WWe are headquartered in Chennai, India, the capital of Tamil Nadu, the city of dreams. Our objective has always been to empower our artisans to deliver sustainable products of the finest quality. We devote ourselves to these causes. Each of our products is handcrafted and unique. Each product tells the unique story of the artisan who made it.
            </p></center>
            <div className="artisan-image">
              <img src={artisanImage} alt="Artisan crafting" />
            </div>
          </div>
        </div>
        <div className="units-section">
          <h2>Our Units</h2>
          <div className="units-grid">
            {units.map((unit) => (
              <div
                key={unit.name}
                className="unit-card"
                onClick={() => handleUnitClick(unit.name)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleUnitClick(unit.name);
                  }
                }}
                aria-label={`Visit ${unit.name} page`}
              >
                <img 
                  src={unit.logo} 
                  alt={`${unit.name} Logo`} 
                />
                <p 
                  style={{ 
                    color: unit.text_color, 
                    fontStyle: unit.font_style === "italic" ? "italic" : "normal",
                    fontWeight: unit.font_style === "bold" ? "bold" : "normal"
                  }}
                >
                  {unit.name}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;
