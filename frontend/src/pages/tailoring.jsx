import React from "react";
import { useNavigate } from "react-router-dom";
import "./tailoring.css";
import vaalogo from "../components/Assets/vaalogo.png"; 
import img1 from "../components/Assets/v11.png"; 
import img2 from "../components/Assets/v9.png";
import img3 from "../components/Assets/v8.png";
import feature1 from "../components/Assets/v11.png"; 
import feature2 from "../components/Assets/v7.png";
import feature3 from "../components/Assets/v8.png";
import Slider from "react-slick";
import { FaHandsHelping } from "react-icons/fa";

const Tailoring = () => {  // ✅ Capitalized component name
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
    <div className="tailoring-page">
      {/* Header */}
      <header className="tailoring-header">
        <img src={vaalogo} alt="Block Logo" className="block-logo" />
        <h1>Tailoring</h1>
        <p>Your partner in excellence and innovation.</p>
      </header>

      {/* About Section */}
      <section className="tailoring-about">
        <h2>About Tailoring</h2>
        <p>
        At Vaagai, we believe that tailoring is more than just stitching fabric; it's about creating timeless pieces that embody style, comfort, and individuality. With a deep-rooted appreciation for craftsmanship and attention to detail, our tailors bring decades of expertise to every garment they create. Tailoring is a skill that requires precision and an eye for detail. From taking accurate measurements to selecting the finest fabrics, our skilled tailors ensure that each garment is crafted to perfection. Whether it's a bespoke suit, a traditional kurta, or a contemporary dress, every stitch is meticulously placed to achieve the perfect fit and silhouette. At Vaagai, we understand that every individual is unique, which is why we offer customization options for our tailored garments. From choosing fabrics and colors to selecting design details and embellishments, customers have the opportunity to personalize their garments.
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
          <p>
            At Vaagai, we take pride in preserving and promoting the ancient art of block printing, a tradition that dates back centuries in the rich tapestry of Indian culture. Block printing is more than just a craft; it's a celebration of heritage, creativity, and craftsmanship. Originating in regions like Rajasthan and Gujarat, block printing has been passed down through generations, with artisans honing their skills and refining techniques over centuries. At Vaagai, we pay homage to this heritage by working with master craftsmen who embody the spirit of this timeless art form. Block printing is a labor-intensive process that requires precision, patience, and passion. It begins with the carving of intricate designs onto wooden blocks, each meticulously crafted to perfection. These blocks are then dipped into natural dyes made from plants, minerals, and other organic sources, ensuring vibrant colors and eco-friendly production.
          </p>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <section className="why-choose-us">
        <h2>Why Choose Us</h2>
        <div className="features-container">
          <div className="feature-card">
            <img src={feature1} alt="Unique Designs" />
            <h3>Unique Designs</h3>
            <p>
            Our products feature unique designs inspired by the rich cultural heritage of India. From vibrant block-printed textiles to intricately embroidered garments, each item tells a story and celebrates the diversity of our artistic traditions.
            </p>
          </div>
          <div className="feature-card">
            <img src={feature2} alt="High-Quality Materials" />
            <h3>High-Quality Materials</h3>
            <p>
              We are committed to using high-quality, ethically sourced materials in our products. Whether it's hand-spun cotton, natural dyes, or eco-friendly fabrics, we prioritize sustainability and durability without compromising on style.
            </p>
          </div>
          <div className="feature-card">
            <img src={feature3} alt="Versatile Range" />
            <h3>Versatile Range</h3>
            <p>
              Whether you're looking for clothing, home decor, or accessories, Vaagai offers a versatile range of products to suit every need and occasion. From everyday essentials to statement pieces, our collection has something for everyone.
            </p>
          </div>
        </div>
      </section>

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

export default Tailoring; // ✅ Export the correctly named component
