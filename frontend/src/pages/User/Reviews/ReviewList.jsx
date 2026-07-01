// Architect: SP
import React, { useState, useEffect } from 'react';
import { FaThumbsUp } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ReviewStars from './ReviewStars';
import { getProductReviews, voteReview, deleteReview } from '../../../services/userapi/reviewAPI';
import './ReviewList.css';

const ReviewList = ({ productId, initialReviews = [] }) => {
    const [reviews, setReviews] = useState(initialReviews);
    const [loading, setLoading] = useState(!initialReviews.length);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sort, setSort] = useState('-createdAt');

    const fetchReviews = async () => {
        // If we already have initialReviews and this is the first load, skip fetching
        if (initialReviews.length > 0 && page === 1 && !loading) {
            return;
        }
        
        try {
            setLoading(true);
            const response = await getProductReviews(productId, page, sort);
            if (response.success) {
                setReviews(response.data);
                setTotalPages(response.totalPages);
            }
        } catch (error) {
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // If we have initialReviews and this is the first load, use them
        if (initialReviews.length > 0 && page === 1) {
            setReviews(initialReviews);
            setLoading(false);
        } else {
            fetchReviews();
        }
    }, [productId, page, sort, initialReviews]);

    const handleVote = async (reviewId) => {
        try {
            const response = await voteReview(reviewId);
            if (response.success) {
                setReviews(reviews.map(review => 
                    review._id === reviewId 
                        ? { ...review, helpfulVotes: review.helpfulVotes + 1 }
                        : review
                ));
                toast.success('Vote recorded!');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to vote');
        }
    };

    const handleDelete = async (reviewId) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                const response = await deleteReview(reviewId);
                if (response.success) {
                    setReviews(reviews.filter(review => review._id !== reviewId));
                    toast.success('Review deleted successfully');
                }
            } catch (error) {
                toast.error(error.message || 'Failed to delete review');
            }
        }
    };

    const handleSort = (newSort) => {
        setSort(newSort);
        setPage(1);
    };

    if (loading) {
        return <div className="reviews-loading">Loading reviews...</div>;
    }

    return (
        <div className="reviews-container">
            <div className="reviews-header">
                <h3>Customer Reviews</h3>
                <select 
                    value={sort} 
                    onChange={(e) => handleSort(e.target.value)}
                    className="sort-select"
                >
                    <option value="-createdAt">Most Recent</option>
                    <option value="-rating">Highest Rating</option>
                    <option value="rating">Lowest Rating</option>
                    <option value="-helpfulVotes">Most Helpful</option>
                </select>
            </div>

            {reviews.length === 0 ? (
                <div className="no-reviews">No reviews yet. Be the first to review this product!</div>
            ) : (
                <>
                    <div className="reviews-list">
                        {reviews.map(review => (
                            <div key={review._id} className="review-item">
                                <div className="review-header">
                                    <ReviewStars rating={review.rating} size="sm" />
                                    <span className="review-date">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                
                                <h4 className="review-title">{review.title}</h4>
                                <p className="review-comment">{review.comment}</p>
                                
                                <div className="review-footer">
                                    <div className="review-meta">
                                        <span className="reviewer-name">
                                            By {review.user.name}
                                        </span>
                                        {review.verifiedPurchase && (
                                            <span className="verified-badge">
                                                Verified Purchase
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="review-actions">
                                        <button 
                                            className="helpful-button"
                                            onClick={() => handleVote(review._id)}
                                        >
                                            <FaThumbsUp />
                                            <span>Helpful ({review.helpfulVotes})</span>
                                        </button>
                                        
                                        {/* Only show delete button for user's own reviews */}
                                        {review.user._id === localStorage.getItem('userId') && (
                                            <button 
                                                className="delete-button"
                                                onClick={() => handleDelete(review._id)}
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="page-button"
                            >
                                Previous
                            </button>
                            <span className="page-info">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="page-button"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ReviewList;
