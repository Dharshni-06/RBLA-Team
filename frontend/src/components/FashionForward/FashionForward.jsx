import React, { useState, useEffect } from 'react';
import Slider from 'react-slick'; // Import Slider
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Link, useNavigate } from 'react-router-dom';
import './FashionForward.css';
import { useUser } from '../../Context/UserContext';
import { getRecentlyViewed } from '../../services/recentlyViewedService';
import T1 from '../Assets/T1.png';
import B1 from '../Assets/B1.png';
import P1 from '../Assets/P1.png';
import O1 from '../Assets/O1.png';

const FashionForward = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useUser();
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Fetch recently viewed products whenever authentication or user changes
  useEffect(() => {
    const updateRecent = () => {
      if (isAuthenticated) {
        const userKey = user?._id || user?.email;
        const items = getRecentlyViewed(userKey);
        setRecentlyViewed(items);
      } else {
        setRecentlyViewed([]);
      }
    };

    updateRecent();

    // Listen for real-time updates when a product is viewed elsewhere in the app
    const handleUpdate = () => updateRecent();
    window.addEventListener('recently_viewed_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('recently_viewed_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [isAuthenticated, user]);

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

  const showRecentlyViewed = isAuthenticated && recentlyViewed.length > 0;

  // Prepare products array so Slick can loop infinitely even with 1 or 2 items
  let displayProducts = recentlyViewed;
  if (recentlyViewed.length === 1) {
    displayProducts = [recentlyViewed[0], recentlyViewed[0], recentlyViewed[0]];
  } else if (recentlyViewed.length === 2) {
    displayProducts = [...recentlyViewed, ...recentlyViewed];
  }

  // Slider Settings
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2
        }
      },
      {
        breakpoint: 480,
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
        {showRecentlyViewed ? (
          <div className="recently-viewed-carousel-wrapper">
            <div className="recently-viewed-header">
              <span className="recent-badge">✨ RECENTLY VIEWED</span>
            </div>
            <Slider {...sliderSettings}>
              {displayProducts.map((product, index) => (
                <div
                  key={product._id ? `${product._id}-${index}` : index}
                  className="category-card recent-product-card"
                  onClick={() => navigate(`/product/${product._id}`)}
                  role="button"
                  tabIndex={0}
                  title={`View ${product.name}`}
                >
                  <div className="recent-product-img-wrapper">
                    <img
                      src={product.image || '/placeholder.jpg'}
                      alt={product.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder.jpg';
                      }}
                    />
                    {product.category && (
                      <span className="recent-card-category">{product.category}</span>
                    )}
                  </div>
                  <div className="recent-card-body">
                    <h3 className="recent-card-title">{product.name}</h3>
                    {product.price && (
                      <div className="recent-card-price-row">
                        <span className="recent-card-price">₹{product.price}</span>
                        {product.old_price && product.old_price > product.price && (
                          <span className="recent-card-old-price">₹{product.old_price}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        ) : (
          <Slider {...sliderSettings}>
            {categories.map(category => (
              <div 
                key={category.id} 
                className="category-card"
                onClick={() => navigate(category.link)}
                style={{ cursor: 'pointer' }}
              >
                <img src={category.image} alt={category.title} />
                <center><h3>{category.title}</h3></center>
              </div>
            ))}
          </Slider>
        )}
      </div>
    </div>
  );
};

export default FashionForward;
