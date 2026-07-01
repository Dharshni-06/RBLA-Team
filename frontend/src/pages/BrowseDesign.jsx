import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../Context/CartContext';
import { toast } from 'react-toastify';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import './BrowseDesign.css';

const categoryProductMap = {
  bedsheet: '6a1e605cba977b119c3adfe3', // Blue Striped Flower Bedsheet
  towel: '6a1e605cba977b119c3adfec',    // Cotton Blockprinted Towel
  bag: '6a1e605cba977b119c3adfef',      // Handmade Canvas Tote Bag
  napkin: '6a1e605cba977b119c3adff2',   // Blockprinted Napkins (Set of 6)
  cupcoaster: '6a1e605cba977b119c3adfe9', // Eco-Friendly Bamboo Coasters Set
  paperfile: '6a1e605cba977b119c3adff5', // Handmade Paper Files Organizer
  bamboo: '6a1e605cba977b119c3adfe9'    // Eco-Friendly Bamboo Coasters Set
};

const categories = [
  { value: 'all', label: 'All Designs' },
  { value: 'bedsheet', label: 'Bedsheets' },
  { value: 'towel', label: 'Towels' },
  { value: 'bag', label: 'Bags' },
  { value: 'napkin', label: 'Napkins' },
  { value: 'cupcoaster', label: 'Cup Coasters' },
  { value: 'paperfile', label: 'Paper Files' },
  { value: 'bamboo', label: 'Bamboo' }
];

export default function BrowseDesign() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();

  const [designs, setDesigns] = useState([]);
  const [filteredDesigns, setFilteredDesigns] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load category from navigation state if available
  useEffect(() => {
    if (location.state?.category) {
      // Map category plurals/singulars to match db values
      const cat = location.state.category.toLowerCase().replace(/s$/, ''); // e.g. "bedsheets" -> "bedsheet"
      if (categories.some(c => c.value === cat)) {
        setSelectedCategory(cat);
      }
    }
  }, [location]);

  // Fetch designs from database
  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/designs');
        setDesigns(response.data || []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Error connecting to database');
      } finally {
        setLoading(false);
      }
    };

    fetchDesigns();
  }, []);

  // Filter designs when category or designs change
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredDesigns(designs);
    } else {
      setFilteredDesigns(designs.filter(d => d.type?.toLowerCase() === selectedCategory));
    }
  }, [selectedCategory, designs]);

  // Helper to get full image URL or base64 format
  const getImageUrl = (image) => {
    if (!image || typeof image !== 'string') return '/placeholder.jpg';
    if (image.startsWith('data:image')) return image;
    
    // Normalize image base64 if it's stored as plain string in config
    if (!image.startsWith('/') && !image.startsWith('http')) {
      return `data:image/png;base64,${image}`;
    }

    const baseUrl = axios.defaults.baseURL || 'http://localhost:5000';
    if (image.startsWith('/')) {
      return `${baseUrl}${image}`;
    }
    return image;
  };

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Select design and proceed to checkout
  const handleSelectDesign = async (design) => {
    // Check if user is logged in (cart operations require auth token)
    const token = localStorage.getItem('token');
    if (!token) {
      toast.warning('Please log in first to checkout your selected design.');
      navigate('/loginsignup');
      return;
    }

    toast.info('Adding selected design to your cart...', { autoClose: 1500 });
    
    // Map design type to a valid MongoDB Product ID of that category
    const productId = categoryProductMap[design.type?.toLowerCase()] || '6a1e605cba977b119c3adfef';
    const typeLabel = categories.find(c => c.value === design.type?.toLowerCase())?.label || 'Custom Product';
    const product = {
      _id: productId,
      name: `${typeLabel} - Customized Design`,
      price: 250, // default custom price
      image: getImageUrl(design.image),
      size: 'default',
      color: design.config?.color || 'default'
    };

    const success = await addToCart(product, 1);
    if (success) {
      toast.success('Successfully added to cart! Proceeding to checkout...');
      navigate('/checkout');
    } else {
      toast.error('Failed to add selected design to cart.');
    }
  };

  return (
    <div className="browse-design-page">

      <div className="browse-header-section">
        <h1 className="browse-title">Explore Custom Designs</h1>
        <p className="browse-subtitle">Browse pre-saved custom templates and choose your favorite to order immediately</p>
      </div>

      <div className="tabs-container">
        {categories.map((cat) => (
          <button
            key={cat.value}
            className={`tab-btn ${selectedCategory === cat.value ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.value)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading premium designs...</p>
        </div>
      )}

      {error && (
        <div className="loading-container text-danger">
          <p>❌ {error}</p>
          <button className="tab-btn active" onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div className="designs-grid">
          {filteredDesigns.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📂</div>
              <h3 className="empty-state-title">No Designs Found</h3>
              <p className="empty-state-text">
                There are no custom designs saved under the <strong>{categories.find(c => c.value === selectedCategory)?.label}</strong> category yet. You can create your own design using the Custom Design tool!
              </p>
            </div>
          ) : (
            filteredDesigns.map((design) => (
              <div key={design._id || design.id} className="design-card">
                <div className="card-image-wrapper">
                  <span className="card-category-badge">{design.type}</span>
                  <img
                    src={getImageUrl(design.image)}
                    alt="Custom design"
                    className="design-preview-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder.jpg';
                    }}
                  />
                </div>
                <div className="card-info">
                  <div>
                    <h3 className="card-title">
                      Custom {design.type?.charAt(0).toUpperCase() + design.type?.slice(1)} Template
                    </h3>
                    <p className="card-meta">
                      Saved on {formatDate(design.createdAt || design.id)}
                    </p>
                  </div>
                  <button
                    className="select-checkout-btn"
                    onClick={() => handleSelectDesign(design)}
                  >
                    <ShoppingCart size={18} /> Select & Checkout
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
