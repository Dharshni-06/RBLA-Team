// Architect: SP
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ReviewStars from './ReviewStars';
import { createReview, updateReview } from '../../../services/userapi/reviewAPI';
import { checkProductPurchase } from '../../../services/userapi/orderAPI';
import './ReviewForm.css';

const ReviewForm = ({ productId, existingReview = null, onSuccess }) => {
    const [formData, setFormData] = useState({
        rating: existingReview?.rating || 0,
        title: existingReview?.title || '',
        comment: existingReview?.comment || ''
    });
    const [images, setImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [checkingPurchase, setCheckingPurchase] = useState(true);

    useEffect(() => {
        const verifyPurchase = async () => {
            try {
                const response = await checkProductPurchase(productId);
                setHasPurchased(response.hasPurchased);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setCheckingPurchase(false);
            }
        };

        verifyPurchase();
    }, [productId]);

    const handleRatingChange = (newRating) => {
        setFormData(prev => ({ ...prev, rating: newRating }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 5) {
            toast.error('You can upload up to 5 images only');
            return;
        }
        setImages(prev => [...prev, ...files]);
    };

    const handleRemoveImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!hasPurchased) {
            toast.error('You must purchase this product and have it delivered before reviewing it');
            return;
        }

        if (formData.rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        try {
            setIsSubmitting(true);
            const reviewData = {
                productId,
                ...formData,
                images
            };

            const response = existingReview
                ? await updateReview(existingReview._id, reviewData)
                : await createReview(reviewData);

            if (response.success) {
                toast.success(existingReview 
                    ? 'Review updated successfully!' 
                    : 'Review submitted successfully!'
                );
                onSuccess(response.data);
                if (!existingReview) {
                    // Clear form if it's a new review
                    setFormData({
                        rating: 0,
                        title: '',
                        comment: ''
                    });
                    setImages([]);
                }
            }
        } catch (error) {
            toast.error(error.message || 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (checkingPurchase) {
        return <div className="review-form-loading">Checking purchase history...</div>;
    }

    if (!hasPurchased && !existingReview) {
        return (
            <div className="review-form-error">
                <p>You must purchase this product before you can review it.</p>
                <p>After your order is delivered, you'll be able to share your experience!</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="review-form">
            <div className="rating-container">
                <label>Your Rating</label>
                <ReviewStars 
                    rating={formData.rating} 
                    size="lg"
                    interactive={true}
                    onRatingChange={handleRatingChange}
                />
            </div>

            <div className="form-group">
                <label htmlFor="title">Review Title</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Summarize your review"
                    required
                    maxLength={100}
                />
            </div>

            <div className="form-group">
                <label htmlFor="comment">Your Review</label>
                <textarea
                    id="comment"
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    placeholder="What did you like or dislike about this product?"
                    required
                    maxLength={1000}
                    rows={4}
                />
            </div>

            <div className="form-group">
                <label>Upload Images (Up to 5)</label>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={images.length >= 5}
                />
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                    {images.map((file, idx) => (
                        <div key={idx} style={{ position: 'relative' }}>
                            <img
                                src={URL.createObjectURL(file)}
                                alt="thumbnail"
                                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                            <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                style={{
                                    position: 'absolute',
                                    top: '-5px',
                                    right: '-5px',
                                    background: 'red',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '20px',
                                    height: '20px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px'
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <button 
                type="submit" 
                className="submit-button"
                disabled={isSubmitting}
            >
                {isSubmitting 
                    ? 'Submitting...' 
                    : existingReview 
                        ? 'Update Review' 
                        : 'Submit Review'
                }
            </button>
        </form>
    );
};

export default ReviewForm;
