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
        const status = tracking.orderStatus;
        const isCanceled = status === 'Canceled' || status === 'Cancelled';
        const hasReturns = Array.isArray(tracking.returnRequests) && tracking.returnRequests.length > 0;
        const isRefunded = tracking.paymentStatus === 'Refunded';

        let steps = ['Pending', 'Processing', 'Delivered'];

        if (isCanceled) {
            steps = ['Pending', 'Processing', 'Canceled'];
        } else if (hasReturns || isRefunded) {
            const returnStatus = tracking.returnRequests[0]?.status; // 'Pending', 'Approved', 'Rejected'
            if (returnStatus === 'Rejected') {
                steps = ['Pending', 'Processing', 'Delivered', 'Return Rejected'];
            } else if (isRefunded || returnStatus === 'Approved') {
                steps = ['Pending', 'Processing', 'Delivered', 'Return Approved', 'Refunded'];
            } else {
                steps = ['Pending', 'Processing', 'Delivered', 'Return Pending'];
            }
        }

        // Adjust orderStatus name mapping for indexOf matching
        let currentStatusMapped = status;
        if (isCanceled) {
            currentStatusMapped = 'Canceled';
        } else if (hasReturns || isRefunded) {
            const returnStatus = tracking.returnRequests[0]?.status;
            if (returnStatus === 'Rejected') {
                currentStatusMapped = 'Return Rejected';
            } else if (isRefunded || returnStatus === 'Approved') {
                currentStatusMapped = 'Refunded';
            } else {
                currentStatusMapped = 'Return Pending';
            }
        } else if (status === 'Cancelled') {
            currentStatusMapped = 'Canceled';
        }

        const currentIndex = steps.indexOf(currentStatusMapped);
        
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

    const isOrderCanceled = tracking.orderStatus === 'Canceled' || tracking.orderStatus === 'Cancelled';
    const activeReturn = Array.isArray(tracking.returnRequests) && tracking.returnRequests.length > 0 ? tracking.returnRequests[0] : null;

    return (
        <div className="tracking-container">
            <div className="tracking-header">
                <h1>Track Order</h1>
                <p className="order-id">Order #{tracking.orderNumber || orderId.slice(-8)}</p>
            </div>

            <div className="tracking-content">
                {/* Cancellation Alert Banner */}
                {isOrderCanceled && (
                    <div className="status-alert-banner alert-canceled">
                        <div className="alert-icon">⚠️</div>
                        <div className="alert-body">
                            <h3>Order Cancelled</h3>
                            <p>{tracking.cancelReason ? `Reason: ${tracking.cancelReason}` : 'This order has been cancelled.'}</p>
                        </div>
                    </div>
                )}

                {/* Refund Completed Alert Banner */}
                {tracking.paymentStatus === 'Refunded' && (
                    <div className="status-alert-banner alert-refunded">
                        <div className="alert-icon">💳</div>
                        <div className="alert-body">
                            <h3>Refund Processed</h3>
                            <p>A refund has been initiated and completed back to your original payment method.</p>
                        </div>
                    </div>
                )}

                {/* Return Request Progress Banner */}
                {activeReturn && tracking.paymentStatus !== 'Refunded' && (
                    <div className={`status-alert-banner alert-return-${activeReturn.status.toLowerCase()}`}>
                        <div className="alert-icon">🔄</div>
                        <div className="alert-body">
                            <h3>Return Request: {activeReturn.status}</h3>
                            {activeReturn.status === 'Pending' && (
                                <p>We are reviewing your return request for <strong>{activeReturn.product?.name || 'the item'}</strong>. Reason: "{activeReturn.reason}".</p>
                            )}
                            {activeReturn.status === 'Approved' && (
                                <p>Your return request for <strong>{activeReturn.product?.name || 'the item'}</strong> has been approved. The item will be picked up shortly and your refund is in progress.</p>
                            )}
                            {activeReturn.status === 'Rejected' && (
                                <p>Your return request for <strong>{activeReturn.product?.name || 'the item'}</strong> could not be approved. Please contact support for more details.</p>
                            )}
                        </div>
                    </div>
                )}

                <div className="tracking-timeline">
                    {getStatusSteps().map((step, index) => {
                        // Apply custom CSS class name depending on status type
                        let stepClass = 'step-normal';
                        if (step.status === 'Canceled' || step.status === 'Return Rejected') {
                            stepClass = 'step-failed';
                        } else if (step.status.startsWith('Return') || step.status === 'Refunded') {
                            stepClass = 'step-return';
                        }

                        return (
                            <div 
                                key={step.status} 
                                className={`timeline-step ${step.completed ? 'completed' : ''} ${step.current ? 'current' : ''} ${stepClass}`}
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
                                    <div className={`timeline-line ${step.completed ? 'completed' : ''} ${stepClass}`} />
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="delivery-info">
                    {!isOrderCanceled && tracking.orderStatus !== 'Refunded' && (
                        <div className="info-card">
                            <h2>Estimated Delivery</h2>
                            <p className="delivery-date">{getEstimatedDelivery()}</p>
                            {tracking.orderStatus === 'Delivered' && tracking.deliveryDate && (
                                <p className="actual-delivery">
                                    Delivered on: {new Date(tracking.deliveryDate).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    )}

                    {isOrderCanceled && (
                        <div className="info-card info-card-cancelled">
                            <h2>Cancellation Info</h2>
                            <p className="info-text">This order was cancelled and will not be delivered.</p>
                            <p className="info-subtext">If your account was debited, a reversal has been triggered.</p>
                        </div>
                    )}

                    {tracking.paymentStatus === 'Refunded' && (
                        <div className="info-card info-card-refunded">
                            <h2>Refund Summary</h2>
                            <p className="info-text">Status: <strong>Fully Refunded</strong></p>
                            <p className="info-subtext">Credit should appear in your payment account in 5-7 business days.</p>
                        </div>
                    )}

                    <div className="info-card">
                        <h2>Shipping Address</h2>
                        <div className="address-details">
                            <p><strong>{tracking.shippingAddress?.fullName || tracking.shippingAddress?.name}</strong></p>
                            <p>{tracking.shippingAddress?.address}</p>
                            <p>{tracking.shippingAddress?.city}, {tracking.shippingAddress?.state || tracking.shippingAddress?.country}</p>
                            <p>PIN: {tracking.shippingAddress?.pincode || tracking.shippingAddress?.postalCode}</p>
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
                    {!isOrderCanceled && tracking.orderStatus !== 'Delivered' && tracking.orderStatus !== 'Refunded' && (
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
