// Architect: SP
import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import './ReviewStars.css';

const ReviewStars = ({ rating, size = 'md', interactive = false, onRatingChange }) => {
    const renderStars = () => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        // Add full stars
        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <FaStar 
                    key={`star-${i}`}
                    className={`star filled ${size}`}
                    onClick={() => interactive && onRatingChange(i + 1)}
                />
            );
        }

        // Add half star if needed
        if (hasHalfStar) {
            stars.push(
                <FaStarHalfAlt 
                    key="star-half" 
                    className={`star half-filled ${size}`}
                    onClick={() => interactive && onRatingChange(Math.ceil(rating))}
                />
            );
        }

        // Add empty stars
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <FaRegStar 
                    key={`star-empty-${i}`}
                    className={`star empty ${size}`}
                    onClick={() => interactive && onRatingChange(Math.ceil(rating) + i + 1)}
                />
            );
        }

        return stars;
    };

    return (
        <div className={`stars-container ${interactive ? 'interactive' : ''}`}>
            {renderStars()}
        </div>
    );
};

export default ReviewStars;
