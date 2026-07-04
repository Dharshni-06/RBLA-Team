import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Bamboo.css';


import { getProductsByCategory } from '../services/publicapi/productAPI';

const Bamboo = () => {
  const navigate = useNavigate();

  const [bamboo, setBamboo] = useState([]);
  const [filteredBamboo, setFilteredBamboo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [dynamicMaxPrice, setDynamicMaxPrice] = useState(2000);
  const [selectedRating, setSelectedRating] = useState('All');

  useEffect(() => {
    const fetchBamboo = async () => {
      try {
        setLoading(true);
        console.log('Fetching bamboo products...');
        const response = await getProductsByCategory('Bamboo');
        console.log('Bamboo API response:', response);
        if (response && response.success) {
          console.log('Setting bamboo data:', response.data);
          const data = response.data || [];
          setBamboo(data);
          setFilteredBamboo(data);
          if (data.length > 0) {
            const prices = data.map(p => p.new_price);
            const highest = Math.max(...prices);
            setDynamicMaxPrice(highest);
            setMaxPrice(highest);
          }
        } else {
          const errorMsg = response?.message || 'Failed to fetch bamboo products';
          console.error('API Error:', errorMsg);
          setError(errorMsg);
        }
      } catch (error) {
        const errorMsg = error?.response?.data?.message || error.message || 'Error fetching bamboo products';
        console.error('Fetch Error:', error);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchBamboo();
  }, []);

  useEffect(() => {
    let result = [...bamboo];

    // Search query filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Price range filter
    result = result.filter(p => p.new_price >= minPrice && p.new_price <= maxPrice);

    // Rating filter
    if (selectedRating !== 'All') {
      const minStars = Number(selectedRating);
      result = result.filter(p => (p.averageRating || 0) >= minStars);
    }

    // Sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => a.new_price - b.new_price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.new_price - a.new_price);
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredBamboo(result);
  }, [searchQuery, sortBy, minPrice, maxPrice, selectedRating, bamboo]);

  // Helper function to get full image URL
  const getImageUrl = (product) => {
    if (!product) return null;
    
    // If image_url starts with http or https, use it as is
    if (product.image_url?.startsWith('http')) {
      return product.image_url;
    }
    
    // If using images array
    if (product.images?.[0]?.startsWith('http')) {
      return product.images[0];
    }
    
    // Otherwise, prepend the backend URL
    const baseUrl = 'http://localhost:5000';
    return product.image_url ? 
      `${baseUrl}${product.image_url}` : 
      product.images?.[0] ? 
        `${baseUrl}${product.images[0]}` : 
        '/placeholder.jpg';
  };

  return (
    <div className="bamboo-container">
      
      
      <div className="bamboo-content">
        <h1>Welcome to the Bamboo Collection!</h1>

        {/* Filter Bar */}
        <div className="filter-bar-container">
          <div className="filter-search-wrapper">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-search-input"
            />
          </div>

          <div className="filter-price-wrapper">
            <span className="price-label">Max Price: ₹{maxPrice}</span>
            <input
              type="range"
              min="0"
              max={dynamicMaxPrice > 0 ? dynamicMaxPrice : 2000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="filter-price-slider"
            />
          </div>

          <div className="filter-sort-wrapper">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-sort-select"
            >
              <option value="newest">Latest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>

          <div className="filter-sort-wrapper">
            <select 
              value={selectedRating} 
              onChange={(e) => setSelectedRating(e.target.value)}
              className="filter-sort-select"
            >
              <option value="All">All Ratings</option>
              <option value="5">5 Stars only</option>
              <option value="4">4 Stars & Above</option>
              <option value="3">3 Stars & Above</option>
              <option value="2">2 Stars & Above</option>
              <option value="1">1 Star & Above</option>
            </select>
          </div>

          <button 
            className="filter-reset-btn"
            onClick={() => {
              setSearchQuery('');
              setMaxPrice(dynamicMaxPrice);
              setSortBy('newest');
              setSelectedRating('All');
            }}
          >
            Reset
          </button>
        </div>

        {loading && <div className="loading">Loading bamboo products...</div>}
        {error && <div className="error-message">{error}</div>}

        {!loading && !error && filteredBamboo.length === 0 && (
          <div className="no-products">No products match your filters.</div>
        )}

        <div className="product-grid">
          {filteredBamboo.map((product) => (
            <div className="product-card" key={product._id}>
              <Link to={`/product/${product._id}`}>
                <img 
                  src={getImageUrl(product)} 
                  alt={product.name} 
                  className="product-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder.jpg';
                  }}
                />
              </Link>

              <h3>{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <p className="product-size">Size: {product.size?.breadth}x{product.size?.height} {product.unit?.name}</p>
              <p className="product-price">₹{product.new_price}</p>
              <p className="original-price">Original Price: ₹{product.old_price}</p>
              <Link to={`/product/${product._id}`} className="view-details-btn">
                View Details
              </Link>
            </div>
          ))}
        </div>

        <div className="design-steps">
          <h3>Next Step for Design</h3>
          <div className="design-options">
            <div
              className="design-option"
              onClick={() => navigate("/browse-design", { state: { category: 'Bamboo' } })}
              role="button"
              aria-label="Browse Design"
            >
              Browse Design →
            </div>
            <div
              className="design-option"
              onClick={() => navigate("/bamboo-customizer")}
              role="button"
              aria-label="Custom Design"
            >
              Custom Design →
            </div>
            <div
              className="design-option"
              onClick={() => navigate("/upload-design")}
              role="button"
              aria-label="Upload Design and Checkout"
            >
              Upload Design and Checkout →
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default Bamboo;