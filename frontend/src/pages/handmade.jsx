import React from "react";
import { useNavigate } from "react-router-dom";
import "./handmade.css";
import vaalogo from "../components/Assets/vaalogo.png"; 
import img1 from "../components/Assets/v11.png"; 
import img2 from "../components/Assets/v9.png";
import img3 from "../components/Assets/v8.png";
import feature1 from "../components/Assets/v11.png"; 
import feature2 from "../components/Assets/v7.png";
import feature3 from "../components/Assets/v8.png";
import Slider from "react-slick";
import { FaHandsHelping } from "react-icons/fa";

const Handmade = () => {  // ✅ Capitalized component name
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
    <div className="handmade-page">
      {/* Header */}
      <header className="handmade-header">
        <img src={vaalogo} alt="Block Logo" className="block-logo" />
        <h1>Handmade Products</h1>
        <p>Your partner in excellence and innovation.</p>
      </header>

      {/* About Section */}
      <section className="handmade-about">
        <h2>About Handmade Products</h2>
        <p>
        At Vaagai, we cherish the beauty of handmade products - each creation tells a story of tradition, passion, and craftsmanship.
         With a commitment to preserving artisanal techniques and supporting local communities, our handmade products offer a unique blend of authenticity and artistry.
         Our handmade products are crafted by skilled artisans who have dedicated their lives to mastering traditional techniques passed down through generations.
          From intricate hand embroidery to delicate beadwork, each artisan brings a unique touch to their craft, resulting in one-of-a-kind pieces that radiate charm and character.
          Handmade products at Vaagai are characterized by their attention to detail and meticulous craftsmanship. 
          Every stitch, every brushstroke, and every embellishment is carefully considered, resulting in products of exceptional quality and beauty.
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

export default Handmade; // ✅ Export the correctly named component
