// Architect: SP
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { trackOrder } from '../../../../services/userapi/orderAPI';
import { useUser } from '../../../../Context/UserContext';
import './OrderTracking.css';

const OrderTracking = () => {
    const [tracking, setTracking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useUser();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchTrackingDetails();
    }, [isAuthenticated, orderId, navigate]);

    const fetchTrackingDetails = async () => {
        try {
            setLoading(true);
            const response = await trackOrder(orderId);
            if (response.success) {
                setTracking(response.data);
            } else {
                setError('Failed to fetch tracking details');
            }
        } catch (error) {
            setError(error.message || 'Failed to fetch tracking details');
        } finally {
            setLoading(false);
        }
    };

    const getStatusSteps = () => {
        const steps = ['Pending', 'Processing', 'Delivered'];
        const currentIndex = steps.indexOf(tracking.orderStatus);
        
        return steps.map((step, index) => ({
            status: step,
            completed: index <= currentIndex,
            current: index === currentIndex
        }));
    };

    const getEstimatedDelivery = () => {
        if (!tracking.orderDate) return 'Not available';
        
        const orderDate = new Date(tracking.orderDate);
        const deliveryDate = new Date(orderDate);
        deliveryDate.setDate(deliveryDate.getDate() + 7); // Assuming 7 days delivery time
        
        return deliveryDate.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return <div className="tracking-loading">Loading tracking details...</div>;
    }

    if (error) {
        return <div className="tracking-error">{error}</div>;
    }

    if (!tracking) {
        return <div className="tracking-not-found">Tracking information not found</div>;
    }

    return (
        <div className="tracking-container">
            <div className="tracking-header">
                <h1>Track Order</h1>
                <p className="order-id">Order #{tracking.orderNumber || orderId.slice(-8)}</p>
            </div>

            <div className="tracking-content">
                <div className="tracking-timeline">
                    {getStatusSteps().map((step, index) => (
                        <div 
                            key={step.status} 
                            className={`timeline-step ${step.completed ? 'completed' : ''} ${step.current ? 'current' : ''}`}
                        >
                            <div className="step-indicator">
                                {step.completed ? '✓' : index + 1}
                            </div>
                            <div className="step-content">
                                <h3>{step.status}</h3>
                                {step.current && (
                                    <p className="step-date">
                                        {new Date(tracking.orderDate).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                            {index < getStatusSteps().length - 1 && (
                                <div className={`timeline-line ${step.completed ? 'completed' : ''}`} />
                            )}
                        </div>
                    ))}
                </div>

                <div className="delivery-info">
                    <div className="info-card">
                        <h2>Estimated Delivery</h2>
                        <p className="delivery-date">{getEstimatedDelivery()}</p>
                        {tracking.orderStatus === 'Delivered' && tracking.deliveryDate && (
                            <p className="actual-delivery">
                                Delivered on: {new Date(tracking.deliveryDate).toLocaleDateString()}
                            </p>
                        )}
                    </div>

                    <div className="info-card">
                        <h2>Shipping Address</h2>
                        <div className="address-details">
                            <p><strong>{tracking.shippingAddress?.fullName}</strong></p>
                            <p>{tracking.shippingAddress?.address}</p>
                            <p>{tracking.shippingAddress?.city}, {tracking.shippingAddress?.state}</p>
                            <p>PIN: {tracking.shippingAddress?.pincode}</p>
                            <p>Phone: {tracking.shippingAddress?.phone}</p>
                        </div>
                    </div>
                </div>

                <div className="tracking-actions">
                    <button 
                        onClick={() => navigate(`/orders/${orderId}`)}
                        className="view-details-button"
                    >
                        View Order Details
                    </button>
                    {tracking.orderStatus !== 'Delivered' && (
                        <button 
                            onClick={() => window.location.href = 'mailto:support@example.com'}
                            className="contact-support-button"
                        >
                            Contact Support
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
