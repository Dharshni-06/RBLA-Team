import React from 'react';
import Slider from 'react-slick'; // Import Slider
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Link } from 'react-router-dom';
import './FashionForward.css';
import T1 from '../Assets/T1.png';
import B1 from '../Assets/B1.png';
import P1 from '../Assets/P1.png';
import O1 from '../Assets/O1.png';

const FashionForward = () => {
  const categories = [
    { id: 1, image: T1, title: 'Towels', link: '/towels' },
    { id: 2, image: B1, title: 'Bedsheets', link: '/bedsheets' },
    { id: 3, image: P1, title: 'Napkins', link: '/napkins' },
    { id: 4, image: O1, title: 'Bags', link: '/bags' }
  ];

  const moreCategories = [
    { id: 5, title: 'Cupcoaster', link: '/cupcoaster' },
    { id: 6, title: 'Paperfiles', link: '/paperfiles' },
    { id: 7, title: 'Bamboo', link: '/bamboo' }
  ];

  // Slider Settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,    // Number of visible items
    slidesToScroll: 1,  // Scroll one by one
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 768, // On smaller screens
        settings: {
          slidesToShow: 2
        }
      },
      {
        breakpoint: 480, // On mobile devices
        settings: {
          slidesToShow: 1
        }
      }
    ]
  };

  return (
    <div className="fashion-forward">
      <div className="fashion-forward-left">
        <h1>
          <span>Threads Of Heritage </span>
          <span>Hands of Empowerment</span> 
          
        </h1>
        <div className="category-buttons">
          {moreCategories.map(category => (
            <Link key={category.id} to={category.link} className="category-btn">
              {category.title}
            </Link>
          ))}
        </div>
        <Link to="/ProductPage" className="shop-now-btn">
          SHOP NOW
        </Link>
      </div>

      <div className="fashion-forward-right">
        <Slider {...sliderSettings}>
          {categories.map(category => (
            <div key={category.id} className="category-card">
              <img src={category.image} alt={category.title} />
              <center><h3>{category.title}</h3></center>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default FashionForward;
