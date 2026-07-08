// Architect: SP
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderDetails } from '../../../../services/userapi/orderAPI';
import { useUser } from '../../../../Context/UserContext';
import './OrderDetails.css';

const OrderDetails = () => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useUser();

    const getFullImageUrl = (imagePath) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http')) return imagePath;
        const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
        return `http://localhost:5000${path}`;
    };

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchOrderDetails();
    }, [isAuthenticated, orderId, navigate]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await getOrderDetails(orderId);
            if (response.success) {
                setOrder(response.data);
            } else {
                setError('Failed to fetch order details');
            }
        } catch (error) {
            setError(error.message || 'Failed to fetch order details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="order-details-loading">Loading order details...</div>;
    }

    if (error) {
        return <div className="order-details-error">{error}</div>;
    }

    if (!order) {
        return <div className="order-details-not-found">Order not found</div>;
    }

    return (
        <div className="order-details-container">
            <div className="order-details-header">
                <h1>Order Details</h1>
                <div className="order-meta">
                    <p>Order #{order.orderNumber || order._id.slice(-8)}</p>
                    <p>Placed on: {new Date(order.orderDate || order.orderedDate || order.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="order-details-content">
                <div className="order-status-section">
                    <h2>Order Status</h2>
                    <div className={`status-badge ${order.orderStatus.toLowerCase()}`}>
                        {order.orderStatus}
                    </div>
                    <div className={`payment-status ${order.paymentStatus.toLowerCase()}`}>
                        Payment: {order.paymentStatus}
                    </div>
                </div>

                <div className="shipping-details">
                    <h2>Shipping Details</h2>
                    <div className="address-card">
                        <p><strong>{order.shippingAddress.fullName}</strong></p>
                        <p>{order.shippingAddress.address}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                        <p>PIN: {order.shippingAddress.pincode}</p>
                        <p>Phone: {order.shippingAddress.phone}</p>
                    </div>
                </div>

                <div className="order-items">
                    <h2>Order Items</h2>
                    {order.products.map((item) => {
                        // Get the image URL from either images array or image_url
                        let imageUrl = getFullImageUrl(
                            item.product.image_url ||
                            (item.product.images && item.product.images.length > 0 ? item.product.images[0] : null)
                        );

                        return (
                            <div key={item._id} className="order-item">
                                <div className="item-image">
                                    <img 
                                        src={imageUrl || '/images/placeholder.png'} 
                                        alt={item.product.name}
                                        onError={(e) => {
                                            e.target.src = '/images/placeholder.png';
                                            e.target.onerror = null;
                                        }}
                                    />
                                </div>
                                <div className="item-details">
                                    <h3>{item.product.name}</h3>
                                    <p className="item-description">{item.product.description}</p>
                                    <div className="item-meta">
                                        <p>Quantity: {item.quantity}</p>
                                        <p>Price: ₹{item.price}</p>
                                        <p>Total: ₹{item.price * item.quantity}</p>
                                    </div>
                                    {(() => {
                                        const productReturn = Array.isArray(order.returnRequests) ? order.returnRequests.find(r => {
                                            const rProdId = typeof r.product === 'object' ? r.product?._id?.toString() : r.product?.toString();
                                            const itemProdId = typeof item.product === 'object' ? item.product?._id?.toString() : item.product?.toString();
                                            return rProdId && itemProdId && rProdId === itemProdId;
                                        }) : null;
                                        
                                        if (productReturn) {
                                            const status = productReturn.status.toLowerCase();
                                            return (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    <div className={`return-status-details-box return-status-${status}`}>
                                                        <div className="return-status-title">
                                                            {status === 'pending' && '⏳ Return Pending'}
                                                            {status === 'approved' && '✅ Return Approved'}
                                                            {status === 'rejected' && '❌ Return Rejected'}
                                                        </div>
                                                        <div className="return-status-msg">
                                                            {status === 'pending' && 'Your return request is currently under review. Our team will verify the details and update your status within 24-48 hours.'}
                                                            {status === 'approved' && 'Your return request has been approved! Our pickup agent will collect the item from your shipping address within 2-3 business days. Once inspected, your refund will be processed.'}
                                                            {status === 'rejected' && 'Your return request was not approved. Return requests are subject to inspection and must meet our quality guidelines.'}
                                                        </div>
                                                    </div>
                                                    <button 
                                                        className="return-item-btn" 
                                                        onClick={() => navigate('/returnorder', { 
                                                            state: { 
                                                                orderId: order.orderNumber || order._id, 
                                                                email: user?.email || order.shippingAddress?.email || '', 
                                                                productId: item.product._id,
                                                                productName: item.product.name
                                                            } 
                                                        })}
                                                        style={{ marginTop: '0', alignSelf: 'flex-start' }}
                                                    >
                                                        View Return Status
                                                    </button>
                                                </div>
                                            );
                                        }
                                        
                                        const isWithin72Hours = (deliveryDate) => {
                                            if (!deliveryDate || deliveryDate === 'null' || deliveryDate === 'undefined') return true;
                                            const deliveryTime = new Date(deliveryDate).getTime();
                                            if (isNaN(deliveryTime)) return true;
                                            const currentTime = new Date().getTime();
                                            const timeDiff = currentTime - deliveryTime;
                                            const hoursDiff = timeDiff / (1000 * 60 * 60);
                                            return hoursDiff <= 72;
                                        };
                                        
                                        if (order.orderStatus && order.orderStatus.toLowerCase() === 'delivered' && isWithin72Hours(order.deliveryDate)) {
                                            return (
                                                <button 
                                                    className="return-item-btn" 
                                                    onClick={() => navigate('/returnorder', { 
                                                        state: { 
                                                            orderId: order.orderNumber || order._id, 
                                                            email: user?.email || order.shippingAddress?.email || '', 
                                                            productId: item.product._id,
                                                            productName: item.product.name
                                                        } 
                                                    })}
                                                >
                                                    Return Product
                                                </button>
                                            );
                                        }
                                        
                                        return null;
                                    })()}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="order-summary">
                    <h2>Order Summary</h2>
                    <div className="summary-details">
                        <div className="summary-row">
                            <span>Subtotal:</span>
                            <span>₹{order.totalAmount}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping:</span>
                            <span>₹{order.totalAmount > 1000 ? 0 : 50}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total:</span>
                            <span>₹{order.totalAmount > 1000 ? order.totalAmount : order.totalAmount + 50}</span>
                        </div>
                    </div>
                </div>

                <div className="order-actions">
                    <button 
                        onClick={() => navigate(`/orders/${order._id}/track`)}
                        className="track-button"
                    >
                        Track Order
                    </button>
                    {order.orderStatus === 'Pending' && (
                        <button 
                            onClick={() => navigate('/')}
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

export default OrderDetails;
