// Architect: SP
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaStar, FaReply, FaTrash, FaEye } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Reviews.css';

const Reviews = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingStats: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    verifiedReviews: 0,
    recentReviews: 0
  });
  const [adminStore, setAdminStore] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(10);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Check authentication and fetch data
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch reviews
        const reviewsResponse = await axios.get('http://localhost:5000/api/admin/reviews', {
          withCredentials: true
        });
        
        if (reviewsResponse.data.success) {
          setReviews(reviewsResponse.data.data);
          setAdminStore(reviewsResponse.data.data[0]?.store || '');
        } else {
          setError('Failed to fetch reviews');
        }
        
        // Fetch stats
        const statsResponse = await axios.get('http://localhost:5000/api/admin/reviews/stats', {
          withCredentials: true
        });
        
        if (statsResponse.data.success) {
          setStats(statsResponse.data.data);
        } else {
          setError('Failed to fetch review statistics');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response && error.response.status === 401) {
          navigate('/admin/login');
        } else {
          setError('Error fetching data. Please try again.');
          setLoading(false);
        }
      }
    };

    checkAuthAndFetchData();
  }, [navigate]);

  // Handle view review details
  const handleViewReview = async (review) => {
    try {
      // Fetch detailed review information
      const response = await axios.get(`http://localhost:5000/api/admin/reviews/${review.id}`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setSelectedReview(response.data.data);
        setIsViewModalOpen(true);
      } else {
        setError('Failed to fetch review details');
      }
    } catch (error) {
      console.error('Error fetching review details:', error);
      setError('Error fetching review details');
    }
  };

  // Handle reply to review
  const handleReplyClick = (review) => {
    setSelectedReview(review);
    setReplyText(review.reply || '');
    setIsReplyModalOpen(true);
  };

  // Submit reply
  const handleSubmitReply = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/admin/reviews/${selectedReview.id || selectedReview._id}/reply`, {
        reply: replyText
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Reply submitted successfully');
        // Update review in the local state
        setReviews(prevReviews => 
          prevReviews.map(r => {
            const rId = r.id || r._id;
            const selectedId = selectedReview.id || selectedReview._id;
            return rId === selectedId 
              ? { ...r, reply: response.data.data.reply, replyDate: response.data.data.replyDate } 
              : r;
          })
        );
        setIsReplyModalOpen(false);
        setSelectedReview(null);
        setReplyText('');
      } else {
        toast.error('Failed to submit reply');
      }
    } catch (err) {
      console.error('Error submitting reply:', err);
      toast.error(err.response?.data?.message || 'Error submitting reply');
    }
  };

  // Close modals
  const handleCloseModal = () => {
    setIsViewModalOpen(false);
    setIsReplyModalOpen(false);
    setSelectedReview(null);
    setReplyText('');
  };

  // Filter reviews by search term and rating
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating);
    
    return matchesSearch && matchesRating;
  });

  // Sort reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'desc' 
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date);
    } else if (sortBy === 'rating') {
      return sortOrder === 'desc' 
        ? b.rating - a.rating
        : a.rating - b.rating;
    }
    return 0;
  });

  // Pagination
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = sortedReviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Render star ratings
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar 
          key={i} 
          className={i <= rating ? 'star filled' : 'star empty'} 
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="reviews-container">
      <h1>Reviews Management</h1>
      
      {/* Stats Dashboard */}
      <div className="stats-dashboard">
        <div className="stat-card">
          <h3>Total Reviews</h3>
          <p className="stat-value">{stats.totalReviews}</p>
        </div>
        <div className="stat-card">
          <h3>Average Rating</h3>
          <p className="stat-value">
            {stats.averageRating} {renderStars(Math.round(stats.averageRating))}
          </p>
        </div>
        <div className="stat-card">
          <h3>Verified Reviews</h3>
          <p className="stat-value">{stats.verifiedReviews}</p>
        </div>
        <div className="stat-card">
          <h3>Recent Reviews</h3>
          <p className="stat-value">{stats.recentReviews}</p>
          <p className="stat-subtitle">Last 30 days</p>
        </div>
      </div>
      
      {/* Rating Distribution */}
      <div className="rating-distribution">
        <h3>Rating Distribution</h3>
        <div className="rating-bars">
          {[5, 4, 3, 2, 1].map(rating => (
            <div key={rating} className="rating-bar-container">
              <div className="rating-label">
                {rating} {renderStars(rating)}
              </div>
              <div className="rating-bar-wrapper">
                <div 
                  className="rating-bar" 
                  style={{ 
                    width: `${stats.totalReviews ? (stats.ratingStats[rating] / stats.totalReviews * 100) : 0}%` 
                  }}
                ></div>
              </div>
              <div className="rating-count">{stats.ratingStats[rating]}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="search-filter-container">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search reviews by product, customer, or content" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filters">
          <div className="filter">
            <label>Rating:</label>
            <select 
              value={filterRating} 
              onChange={(e) => setFilterRating(e.target.value)}
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          
          <div className="filter">
            <label>Sort By:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Date</option>
              <option value="rating">Rating</option>
            </select>
          </div>
          
          <div className="filter">
            <label>Order:</label>
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Reviews Table */}
      <div className="reviews-table-container">
        <table className="reviews-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Customer</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentReviews.length > 0 ? (
              currentReviews.map(review => (
                <tr key={review.id}>
                  <td>{review.productName}</td>
                  <td>{review.customerName}</td>
                  <td className="rating-cell">
                    {renderStars(review.rating)}
                  </td>
                  <td className="comment-cell">
                    <div className="comment-preview">
                      {review.comment.length > 100 
                        ? `${review.comment.substring(0, 100)}...` 
                        : review.comment
                      }
                    </div>
                  </td>
                  <td>{new Date(review.date).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button 
                      className="action-btn view-btn" 
                      onClick={() => handleViewReview(review)}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button 
                      className="action-btn reply-btn" 
                      onClick={() => handleReplyClick(review)}
                      title="Reply"
                    >
                      <FaReply />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">
                  No reviews found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => paginate(1)} 
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            First
          </button>
          <button 
            onClick={() => paginate(currentPage - 1)} 
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Prev
          </button>
          
          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>
          
          <button 
            onClick={() => paginate(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
          <button 
            onClick={() => paginate(totalPages)} 
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Last
          </button>
        </div>
      )}
      
      {/* View Review Modal */}
      {isViewModalOpen && selectedReview && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Review Details</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="review-details">
                <div className="review-detail-row">
                  <span className="detail-label">Product:</span>
                  <span className="detail-value">{selectedReview.productName}</span>
                </div>
                <div className="review-detail-row">
                  <span className="detail-label">Customer:</span>
                  <span className="detail-value">{selectedReview.customerName}</span>
                </div>
                <div className="review-detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedReview.customerEmail}</span>
                </div>
                <div className="review-detail-row">
                  <span className="detail-label">Rating:</span>
                  <span className="detail-value rating-stars">
                    {renderStars(selectedReview.rating)}
                  </span>
                </div>
                <div className="review-detail-row">
                  <span className="detail-label">Title:</span>
                  <span className="detail-value">{selectedReview.title}</span>
                </div>
                <div className="review-detail-row">
                  <span className="detail-label">Review:</span>
                  <span className="detail-value review-comment">{selectedReview.comment}</span>
                </div>
                <div className="review-detail-row">
                  <span className="detail-label">Verified Purchase:</span>
                  <span className="detail-value">
                    {selectedReview.verifiedPurchase ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="review-detail-row">
                  <span className="detail-label">Helpful Votes:</span>
                  <span className="detail-value">{selectedReview.helpfulVotes}</span>
                </div>
                <div className="review-detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">
                    {new Date(selectedReview.date).toLocaleString()}
                  </span>
                </div>
                
                {selectedReview.reply && (
                  <div className="review-reply-section">
                    <h4>Your Reply:</h4>
                    <p>{selectedReview.reply}</p>
                    <p className="reply-date">
                      Replied on: {new Date(selectedReview.replyDate).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={handleCloseModal}>Close</button>
              <button 
                className="action-btn reply-btn" 
                onClick={() => {
                  handleCloseModal();
                  handleReplyClick(selectedReview);
                }}
              >
                Reply to Review
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Reply Modal */}
      {isReplyModalOpen && selectedReview && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Reply to Review</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="review-summary">
                <p><strong>Product:</strong> {selectedReview.productName}</p>
                <p><strong>Customer:</strong> {selectedReview.customerName}</p>
                <p><strong>Rating:</strong> {renderStars(selectedReview.rating)}</p>
                <p><strong>Review:</strong> {selectedReview.comment}</p>
              </div>
              <div className="reply-form">
                <label htmlFor="reply">Your Reply:</label>
                <textarea 
                  id="reply"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  rows={5}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={handleCloseModal}>Cancel</button>
              <button 
                className="action-btn submit-btn" 
                onClick={handleSubmitReply}
                disabled={!replyText.trim()}
              >
                Submit Reply
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
    </div>
  );
};

export default Reviews;
