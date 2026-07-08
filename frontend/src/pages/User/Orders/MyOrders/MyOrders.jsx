// Architect: SP
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserOrders } from '../../../../services/userapi/orderAPI';
import { useUser } from '../../../../Context/UserContext';
import './MyOrders.css';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await getUserOrders();
            // Ensure we're setting an array
            setOrders(response.data || []);
            setError(null);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError(error.message || 'Failed to fetch orders');
            setOrders([]); // Reset orders to empty array on error
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'status-pending';
            case 'processing':
                return 'status-processing';
            case 'shipped':
                return 'status-shipped';
            case 'delivered':
                return 'status-delivered';
            case 'cancelled':
            case 'canceled':
                return 'status-cancelled';
            default:
                return '';
        }
    };

    const getFullImageUrl = (path) => {
        if (!path) return '/images/placeholder.png';
        return path.startsWith('http') ? path : `http://localhost:5000${path}`;
    };

    if (loading) {
        return <div className="orders-loading">Loading your orders...</div>;
    }

    if (error) {
        return <div className="orders-error">{error}</div>;
    }

    if (!Array.isArray(orders) || orders.length === 0) {
        return (
            <div className="orders-empty">
                <h2>No orders found</h2>
                <p>You haven't placed any orders yet.</p>
                <button onClick={() => navigate('/products')}>Start Shopping</button>
            </div>
        );
    }

    return (
        <div className="my-orders-container">
            <h2>My Orders</h2>
            <div className="orders-list">
                {orders.map((order) => (
                    <div key={order._id} className="order-card">
                        <div className="order-header">
                            <div className="order-info">
                                <h3>Order #{order.orderNumber || order._id.slice(-8)}</h3>
                                <p>Placed on: {new Date(order.orderDate || order.orderedDate || order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <span className={`order-status ${getStatusColor(order.orderStatus)}`}>
                                {order.orderStatus}
                            </span>
                        </div>
                        
                        <div className="order-products">
                            {Array.isArray(order.products) && order.products.map((item) => {
                                // Safely handle null product
                                if (!item?.product) {
                                    return null;
                                }

                                // Get the image URL from either images array or image_url
                                let imageUrl = getFullImageUrl(
                                    item.product.image_url || 
                                    (item.product.images && item.product.images.length > 0 ? item.product.images[0] : null)
                                );

                                return (
                                    <div key={item._id} className="order-product">
                                        <img 
                                            src={imageUrl}
                                            alt={item.product.name}
                                            className="product-image"
                                            onError={(e) => {
                                                e.target.src = '/images/placeholder.png';
                                                e.target.onerror = null;
                                            }}
                                        />
                                        <div className="product-details">
                                            <h4>{item.product.name}</h4>
                                            <p>Quantity: {item.quantity}</p>
                                            <p>Price: ₹{item.product.new_price}</p>
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
                                                
                                                if (order.orderStatus && order.orderStatus.toLowerCase() === 'delivered') {
                                                    const canReturn = isWithin72Hours(order.deliveryDate);
                                                    return (
                                                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                                            {canReturn && (
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
                                                                    style={{ margin: 0 }}
                                                                >
                                                                    Return Product
                                                                </button>
                                                            )}
                                                            <button 
                                                                className="return-item-btn" 
                                                                onClick={() => navigate(`/review/${item.product._id}`)}
                                                                style={{ backgroundColor: '#80002f', color: '#fff', border: 'none', margin: 0 }}
                                                            >
                                                                Write Review
                                                            </button>
                                                        </div>
                                                    );
                                                }
                                                
                                                return null;
                                            })()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <div className="order-footer">
                            <div className="order-total">
                                <p>Total Amount: <span className="total-amount">₹{order.totalAmount}</span></p>
                                <p className="payment-status">Payment Status: <span className={`status-badge payment-${order.paymentStatus?.toLowerCase()}`}>{order.paymentStatus}</span></p>
                            </div>
                            <div className="order-actions">
                                <button onClick={() => navigate(`/orders/${order._id}`)} className="view-details-btn">
                                    View Details
                                </button>
                                <button onClick={() => navigate(`/orders/${order._id}/track`)} className="track-order-btn">
                                    Track Order
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyOrders;
