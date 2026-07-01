import React from "react";
import { useNavigate } from "react-router-dom";
import "./Whyentrepreneur1.css";
import varlogo from "../components/Assets/varlogo.png"; 
import img1 from "../components/Assets/v11.png"; 
import img2 from "../components/Assets/v9.png";
import img3 from "../components/Assets/v8.png";
import feature1 from "../components/Assets/v11.png"; 
import feature2 from "../components/Assets/v7.png";
import feature3 from "../components/Assets/v8.png";
import Slider from "react-slick";
import { FaHandsHelping } from "react-icons/fa";

const Whyentrepreneur1 = () => {  // ✅ Capitalized component name
  const navigate = useNavigate(); 
  const images = [img1, img2, img3]; // Array of images

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 2000,
    pauseOnHover: false,
    fade: true,
    cssEase: "linear",
  };

  return (
    <div className="why-page">
      {/* Header */}
      <header className="why-header">
        <img src={varlogo} alt="Varnam Logo" className="block-logo" />
        <h1>Why Entrepreneur 1</h1>
        
      </header>

      {/* About Section */}
      <section className="why-about">
        <h2>The Inspiring Journey of Entrepreneur 1's Artisans</h2>
        <p>
        The story of Entrepreneur 1 is a testament to the resilience of the human spirit, a journey marked by liberation from exploitation to empowerment. 
        Born from the shadows of slavery, individuals once trapped in mines and estates found salvation through the intervention of compassionate NGOs. 
        Rescued from the depths of despair, they embarked on a transformative path towards freedom and self-discovery. 
        Entrepreneur 1 emerged as a beacon of hope, offering not just employment but a platform for holistic rehabilitation. 
        Through skill-based training programs in block printing and tailoring, artisans discovered newfound talents and avenues for self-expression. 
        Each handmade creation became a symbol of their liberation, weaving together threads of resilience and creativity.
        From the oppressive confines of bondage, they emerged as artisans, entrepreneurs, and agents of change.
        </p>
      </section>

      {/* Hero Section */}
      <div className="hero-section">
        <Slider {...settings}>
          <div>
            <img src={img1} alt="Handcrafted Item 1" className="slider-image" />
          </div>
          <div>
            <img src={img2} alt="Handcrafted Item 2" className="slider-image" />
          </div>
          <div>
            <img src={img3} alt="Handcrafted Item 3" className="slider-image" />
          </div>
        </Slider>
        <div className="content">
        <h2>Breaking Chains, Crafting Dreams</h2>
          <p>
          Through their craft, they reclaim their rightful place in society, rewriting the narrative of their lives with courage and determination. 
          Yet, their journey is not without challenges. They confront societal stigmas and systemic barriers, but with unwavering resolve, they press forward, forging a path towards a brighter future. 
          Through the support of Entrepreneur 1 and the solidarity of their community, they stand as living testaments to the transformative power of resilience and hope. 
          In the tapestry of their journey, each thread tells a story of triumph over adversity, resilience in the face of hardship, and the enduring strength of the human spirit. 
          Theirs is a narrative of resilience, hope, and the relentless pursuit of a better tomorrow. As they continue on their path of growth and empowerment, they inspire others to believe in the boundless possibilities that lie within every individual, waiting to be unleashed with courage and determination.
          </p>
        </div>
      </div>
      <div className="image-gallery">
        {images.map((src, index) => (
          <div key={index} className="image-item">
            <img src={src} alt={`Gallery Image ${index + 1}`} className="gallery-img" />
            <div className="overlay">
              <FaHandsHelping className="overlay-icon" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Whyentrepreneur1; // ✅ Export the correctly named component
