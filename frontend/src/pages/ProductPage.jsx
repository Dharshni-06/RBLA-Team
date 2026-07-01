import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSlidersH, faSortAmountDown, faTimes, faTag } from '@fortawesome/free-solid-svg-icons';
import { getAllProducts } from '../services/publicapi/productAPI';
import './ProductPage.css';

const ProductPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // newest, price-asc, price-desc, name-asc
  const [maxPrice, setMaxPrice] = useState(2000);
  const [minPrice, setMinPrice] = useState(0);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch all products
  useEffect(() => {
    const fetchAllProductsData = async () => {
      try {
        setLoading(true);
        const response = await getAllProducts({ isActive: true });
        if (response && response.success) {
          setProducts(response.data || []);
          setFilteredProducts(response.data || []);
          
          // Calculate min/max price dynamically based on products
          if (response.data && response.data.length > 0) {
            const prices = response.data.map(p => p.new_price);
            const max = Math.max(...prices);
            setMaxPrice(max);
          }
        } else {
          setError(response?.message || 'Failed to fetch products');
        }
      } catch (err) {
        setError(err?.message || 'Error fetching products');
      } finally {
        setLoading(false);
      }
    };

    fetchAllProductsData();
  }, []);

  // Compute categories dynamically
  const categories = ['All', ...new Set(products.map(p => p.category?.name).filter(Boolean))];

  // Apply filters, search and sorting
  useEffect(() => {
    let result = [...products];

    // Search query filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category?.name === selectedCategory);
    }

    // Price range filter
    result = result.filter(p => p.new_price >= minPrice && p.new_price <= maxPrice);

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

    setFilteredProducts(result);
  }, [searchQuery, selectedCategory, sortBy, minPrice, maxPrice, products]);

  // Helper function to get full image URL
  const getImageUrl = (product) => {
    if (!product) return null;
    if (product.image_url?.startsWith('http')) return product.image_url;
    if (product.images?.[0]?.startsWith('http')) return product.images[0];
    
    const baseUrl = 'http://localhost:5000';
    return product.image_url ? 
      `${baseUrl}${product.image_url}` : 
      product.images?.[0] ? 
      `${baseUrl}${product.images[0]}` : 
      '/placeholder.jpg';
  };

  // Helper to calculate discount percentage
  const getDiscountPercent = (oldPrice, newPrice) => {
    if (!oldPrice || oldPrice <= newPrice) return null;
    return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
  };

  return (
    <div className="product-page-container">
      {/* Hero Header Section */}
      <div className="product-page-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content-inner">
          <h1>Explore Our Creations</h1>
          <p>Handcrafted with heritage, woven with love and empowerment.</p>
        </div>
      </div>

      <div className="product-page-content">
        {/* Search and Sort Toolbar */}
        <div className="toolbar-container">
          <div className="search-box-wrapper">
            <FontAwesomeIcon icon={faSearch} className="search-icon-inside" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="product-search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="clear-search-btn">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>

          <div className="toolbar-actions">
            <button className="mobile-filter-toggle" onClick={() => setShowMobileFilters(true)}>
              <FontAwesomeIcon icon={faSlidersH} /> Filters
            </button>

            <div className="sort-wrapper">
              <FontAwesomeIcon icon={faSortAmountDown} className="sort-icon-inside" />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="product-sort-select"
              >
                <option value="newest">Latest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        <div className="main-layout-grid">
          {/* Desktop Sidebar Filters */}
          <aside className={`filters-sidebar ${showMobileFilters ? 'mobile-show' : ''}`}>
            <div className="sidebar-header">
              <h3>Filters</h3>
              <button className="close-mobile-filters" onClick={() => setShowMobileFilters(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="filter-group">
              <h4>Categories</h4>
              <ul className="category-filter-list">
                {categories.map((cat) => (
                  <li key={cat}>
                    <button
                      className={`category-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setShowMobileFilters(false);
                      }}
                    >
                      {cat}
                      <span className="category-count">
                        ({cat === 'All' ? products.length : products.filter(p => p.category?.name === cat).length})
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="filter-group">
              <h4>Price Range</h4>
              <div className="price-slider-info">
                <span>₹{minPrice}</span>
                <span>to</span>
                <span>₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="price-range-slider"
              />
            </div>

            <button 
              className="clear-all-filters-btn" 
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setSortBy('newest');
                setMaxPrice(2000);
                setMinPrice(0);
                setShowMobileFilters(false);
              }}
            >
              Reset All Filters
            </button>
          </aside>

          {/* Product Grid area */}
          <div className="products-grid-section">
            {loading && (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading collection...</p>
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            {!loading && !error && filteredProducts.length === 0 && (
              <div className="no-products-container">
                <h2>No Products Found</h2>
                <p>We couldn't find any products matching your selected search criteria.</p>
                <button 
                  className="reset-search-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setMaxPrice(2000);
                  }}
                >
                  Clear search filters
                </button>
              </div>
            )}

            {!loading && !error && filteredProducts.length > 0 && (
              <div className="products-grid-layout">
                {filteredProducts.map((product) => {
                  const discount = getDiscountPercent(product.old_price, product.new_price);
                  return (
                    <div className="premium-product-card" key={product._id}>
                      {discount && (
                        <div className="discount-badge animate-pulse">
                          <FontAwesomeIcon icon={faTag} /> {discount}% OFF
                        </div>
                      )}
                      
                      <div className="product-card-image-wrapper">
                        <Link to={`/product/${product._id}`}>
                          <img
                            src={getImageUrl(product)}
                            alt={product.name}
                            className="product-card-image"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/placeholder.jpg';
                            }}
                          />
                        </Link>
                      </div>

                      <div className="product-card-details">
                        <span className="product-card-category">{product.category?.name || 'Handmade'}</span>
                        <h3 className="product-card-title">
                          <Link to={`/product/${product._id}`}>{product.name}</Link>
                        </h3>
                        <p className="product-card-description">
                          {product.description.length > 80 
                            ? `${product.description.substring(0, 80)}...` 
                            : product.description}
                        </p>
                        
                        {product.size && (
                          <div className="product-card-size">
                            Size: {product.size.breadth}x{product.size.height} {product.unit?.name || 'in'}
                          </div>
                        )}

                        <div className="product-card-footer">
                          <div className="price-wrapper">
                            <span className="current-price">₹{product.new_price}</span>
                            {product.old_price > product.new_price && (
                              <span className="old-price">₹{product.old_price}</span>
                            )}
                          </div>
                          
                          {product.stock > 0 ? (
                            <Link to={`/product/${product._id}`} className="view-details-action-btn">
                              View Details
                            </Link>
                          ) : (
                            <button className="sold-out-action-btn" disabled>
                              Out of Stock
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
