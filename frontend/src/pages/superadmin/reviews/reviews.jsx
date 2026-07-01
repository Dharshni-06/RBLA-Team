import React, { useState, useEffect } from 'react';
import { getAllReviews, deleteReview } from '../../../services/superadmin/reviewAPI';
import './Reviews.css';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    rating: '',
    fromDate: '',
    toDate: '',
    productId: ''
  });

  useEffect(() => {
    fetchReviews();
  }, [filters]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getAllReviews(filters);
      setReviews(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await deleteReview(reviewId);
      fetchReviews(); // Refresh reviews after deletion
    } catch (err) {
      setError(err.message || 'Failed to delete review');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getRatingStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) return <div className="loading">Loading reviews...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="reviews-container">
      <div className="reviews-header">
        <h2>Review Management</h2>
        <div className="filters">
          <select 
            name="rating" 
            value={filters.rating}
            onChange={handleFilterChange}
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          <input
            type="date"
            name="fromDate"
            value={filters.fromDate}
            onChange={handleFilterChange}
            placeholder="From Date"
          />
          <input
            type="date"
            name="toDate"
            value={filters.toDate}
            onChange={handleFilterChange}
            placeholder="To Date"
          />
        </div>
      </div>

      <div className="reviews-table">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Customer</th>
              <th>Rating</th>
              <th>Title</th>
              <th>Comment</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review._id}>
                <td>
                  <a href={`/superadmin/products/${review.product?._id}`}>
                    {review.product?.name || 'N/A'}
                  </a>
                </td>
                <td>{review.user?.name || 'N/A'}</td>
                <td className="rating">
                  <span className={`stars rating-${review.rating}`}>
                    {getRatingStars(review.rating)}
                  </span>
                </td>
                <td>{review.title}</td>
                <td className="comment">{review.comment}</td>
                <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                <td>
                  <button 
                    onClick={() => handleDeleteReview(review._id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reviews;
