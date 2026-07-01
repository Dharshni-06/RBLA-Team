import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import "./entrepreneur1.css";
import varlogo from "../components/Assets/varlogo.png"; // Adjust the path if needed
import v1 from "../components/Assets/v1.png";
import v2 from "../components/Assets/v2.png";
import v3 from "../components/Assets/v3.png";
import v4 from "../components/Assets/v4.png";
import v5 from "../components/Assets/v5.png";
import v6 from "../components/Assets/v6.png";
import v7 from "../components/Assets/v7.png";
import v8 from "../components/Assets/v8.png";
import v9 from "../components/Assets/v9.png";
import v10 from "../components/Assets/v10.png";
import v11 from "../components/Assets/v11.png";
import v12 from "../components/Assets/v12.png";
import v13 from "../components/Assets/v13.png";
import v14 from "../components/Assets/v14.png";
import v15 from "../components/Assets/v15.png";
import v16 from "../components/Assets/v16.png";
import blockPrinting from "../components/Assets/block-printing.png";
import tailoring from "../components/Assets/tailoring.png";
import handmade from "../components/Assets/handmade.png";
import { Link } from "react-router-dom";




const Entrepreneur1 = () => {
  const navigate = useNavigate(); // React Router navigation hook
  const [showMore, setShowMore] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);

  // Toggle function for 'Read More'
  const toggleReadMore = () => {
    setShowMore(!showMore);
  };

  const handleImageClick = (image) => {
    setCurrentImage(image);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentImage(null);
  };

  const images = [
    v1, v2, v3, v4, v5, v7, v8, v9, v10, v11, v12, v13, v14, v15, v16
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleNext = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const Statistics = () => {
    // State for counting animation
    const [years, setYears] = useState(0);
    const [orders, setOrders] = useState(0);
    const [clients, setClients] = useState(0);
    const [employees, setEmployees] = useState(0);

    // Function to animate numbers
    const animateCount = (setState, target, duration = 2000) => {
      let start = 0;
      const increment = target / (duration / 50); // Smooth animation effect
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          clearInterval(timer);
          setState(target);
        } else {
          setState(Math.ceil(start));
        }
      }, 50);
    };

    useEffect(() => {
      animateCount(setYears, 6);
      animateCount(setOrders, 200);
      animateCount(setClients, 300);
      animateCount(setEmployees, 20);
    }, []);

    return (
      <section className="statistics-section">
        <div className="stat-card">
          <img src="https://cdn-icons-png.flaticon.com/128/684/684908.png" alt="Years in Industry" />
          <h2 className="stat-number stat-blue">{years}Y</h2>
          <p>Years In Industry</p>
        </div>

        <div className="stat-card">
          <img src="https://cdn-icons-png.flaticon.com/128/3154/3154880.png" alt="Orders Dispatched" />
          <h2 className="stat-number stat-yellow">{orders}+</h2>
          <p>Orders Dispatched</p>
        </div>

        <div className="stat-card">
          <img src="https://cdn-icons-png.flaticon.com/128/2920/2920281.png" alt="Fulfillment Client" />
          <h2 className="stat-number stat-green">{clients}+</h2>
          <p>Fulfillment Client</p>
        </div>

        <div className="stat-card">
          <img src="https://cdn-icons-png.flaticon.com/128/4203/4203669.png" alt="Dedicated Employees" />
          <h2 className="stat-number stat-purple">{employees}+</h2>
          <p>Dedicated Employees</p>
        </div>
      </section>
    );
  };

  

  return (
    <div className="varnam-page">

      {/* Header */}
      <header className="varnam-header" style={{ backgroundImage: `url(${v6})` }}>
        <div className="header-overlay">
          <img src={varlogo} alt="Varnam Logo" className="varnam-logo" />
          <h1>Entrepreneur 1 Unit</h1>
          <p>MADE BY SURVIVORS OF BONDED LABOUR</p>
          <button>
            <Link to="/whyvarnam" style={{ textDecoration: "none", color: "inherit" }}>
              WHY ENTREPRENEUR 1
            </Link>
          </button>
        </div>
      </header>

      {/* About Section */}
      <section className="varnam-about">
        <h2>About Entrepreneur 1</h2>
        <h3><center>**Entrepreneur 1: Empowering Survivors of Bonded Labour through Sustainable Livelihood**</center></h3>

        <p className={showMore ? "expanded" : ""}>
          Welcome to Entrepreneur 1, where empowerment meets creativity. Founded in 2019, Entrepreneur 1 is an MSME (Micro, Small, and Medium Enterprise) led by survivors of bonded labor. Our journey began with a simple yet powerful mission: to transform lives through skill development and sustainable livelihoods. At Entrepreneur 1, we believe in the resilience of the human spirit and the power of community. Our members, who have overcome the shackles of bonded labor, have been equipped with training in block printing and tailoring. With dedication and determination, they have come together to form a vibrant collective, driving positive change and creating opportunities for themselves and their families.
          {showMore && (
            <span>
              <h3><center>Join us to Empower Survivors!</center></h3>
              At Entrepreneur 1, we aim to empower survivors of bonded labour through block printing and tailoring. Our handmade products are created by our trained members, who have come together to create a sustainable livelihood income generation program. Join us in creating a better world, one product at a time. Every purchase from Entrepreneur 1 is more than just a transaction; it's a contribution to a brighter future. By supporting us, you're not only investing in high-quality, handcrafted goods but also in the dreams and aspirations of those who have fought against all odds to reclaim their freedom and dignity. Join us on our journey as we strive to build a more inclusive and equitable society, one stitch at a time. Together, let's paint a canvas of change, where every thread tells a story of resilience, perseverance, and hope.
            </span>
          )}
        </p>
        <button className="read-more-btn" onClick={toggleReadMore}>
          {showMore ? "Read Less" : "Read More"}
        </button>
      </section>

      {/* Our Work Section */}
      <section className="our-work">
        <h2>Our Work</h2>
        <div className="work-container">
          <div className="work-card">
            <img src={blockPrinting} alt="Block Printing" />
            <h3>Block Printing</h3>
            <p>At Entrepreneur 1, we take pride in preserving and promoting the ancient art of block printing.</p>
            <button className="read-more-btn">READ MORE</button>
          </div>

          <div className="work-card">
            <img src={tailoring} alt="Tailoring" />
            <h3>Tailoring</h3>
            <p>Tailoring is about creating timeless pieces that embody style, comfort, and individuality.</p>
            <button className="read-more-btn">READ MORE</button>
          </div>

          <div className="work-card">
            <img src={handmade} alt="Handmade Products" />
            <h3>Handmade Products</h3>
            <p>Each handmade product is a labor of love, crafted by skilled artisans with passion.</p>
            <button className="read-more-btn">READ MORE</button>
          </div>
        </div>
      </section>

{/* Statistics Section */}
<Statistics />



      {/* Modal for Image View */}
      {isModalOpen && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={closeModal}>&times;</span>
            <img src={currentImage} alt="Selected" className="modal-image" />
          </div>
        </div>
      )}

<div className="varnam-container">
            {/* Services Section */}
            {/*<section className="varnam-section varnam-services">
                <h2>Our Services</h2>
                <ul>
                    <li>Innovative product development</li>
                    <li>State-of-the-art software solutions</li>
                    <li>Customized consultancy services</li>
                    <li>Technical training and upskilling programs</li>
                </ul>
            </section>

            {/* Contact Section */}
            {/*<section className="varnam-section varnam-contact">
                <h2>Contact Us</h2>
                <p>Have questions? Get in touch with us at:</p>
                <p>Email: info@entrepreneur1unit.com</p>
                <p>Phone: +1 234 567 8901</p>
                <button onClick={() => navigate("/AboutPage")}>Go to About Us</button>
            </section>*/}
        </div>

    
    </div>
  
  );
};

export default Entrepreneur1;
