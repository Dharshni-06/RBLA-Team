import React, { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../../../services/superadmin/orderAPI';
import './Orders.css';
import { FaSearch, FaFilter, FaEye, FaSpinner } from 'react-icons/fa';

const Orders = ({ initialSearch = '' }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    fromDate: '',
    toDate: '',
    search: initialSearch || ''
  });

  useEffect(() => {
    if (initialSearch !== undefined) {
      setFilters(prev => ({ ...prev, search: initialSearch }));
    }
  }, [initialSearch]);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllOrders(filters);
      setOrders(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (err) {
      setError(err.message || 'Failed to update order status');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#ffa726';
      case 'processing': return '#29b6f6';
      case 'delivered': return '#66bb6a';
      case 'canceled': return '#ef5350';
      default: return '#9e9e9e';
    }
  };

  if (loading) return (
    <div className="loading">
      <FaSpinner className="spinner" />
      <span>Loading orders...</span>
    </div>
  );
  
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h2>Order Management</h2>
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search orders..."
            className="search-input"
          />
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <FaFilter className="filter-icon" />
          <select 
            name="status" 
            value={filters.status}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Delivered">Delivered</option>
            <option value="Canceled">Canceled</option>
          </select>
        </div>

        <div className="date-filters">
          <div className="date-group">
            <label>From:</label>
            <input
              type="date"
              name="fromDate"
              value={filters.fromDate}
              onChange={handleFilterChange}
              className="date-input"
            />
          </div>
          <div className="date-group">
            <label>To:</label>
            <input
              type="date"
              name="toDate"
              value={filters.toDate}
              onChange={handleFilterChange}
              className="date-input"
            />
          </div>
        </div>
      </div>

      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Customer</th>
              <th>Products</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Order Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.filter(order => {
              if (!filters.search) return true;
              const searchLower = filters.search.toLowerCase();
              const orderNum = (order.orderNumber || order._id || '').toLowerCase();
              const customerName = (order.user?.name || '').toLowerCase();
              const customerEmail = (order.user?.email || '').toLowerCase();
              
              const productNamesMatch = order.products?.some(item => 
                (item.product?.name || '').toLowerCase().includes(searchLower)
              );
              
              return orderNum.includes(searchLower) || 
                     customerName.includes(searchLower) || 
                     customerEmail.includes(searchLower) ||
                     productNamesMatch;
            }).map((order) => (
              <tr key={order._id} className="order-row">
                <td className="order-number">{order.orderNumber || order._id}</td>
                <td className="customer-name">{order.user?.name || 'N/A'}</td>
                <td className="products-list">
                  {order.products.map((item, index) => (
                    <div key={index} className="product-item">
                      <span className="product-name">{item.product?.name}</span>
                      <span className="product-quantity">×{item.quantity}</span>
                      <span className="product-price">₹{item.price}</span>
                    </div>
                  ))}
                </td>
                <td className="total-amount">
                  ₹{order.products.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
                </td>
                <td>
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="status-select"
                    style={{ 
                      '--status-color': getStatusColor(order.orderStatus),
                      backgroundColor: `${getStatusColor(order.orderStatus)}15`
                    }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Canceled">Canceled</option>
                  </select>
                  {(order.orderStatus === 'Canceled' || order.orderStatus === 'Cancelled') && order.cancelReason && (
                    <div className="cancel-reason" style={{ fontSize: '11px', color: '#ef5350', marginTop: '4px', maxWidth: '150px', wordBreak: 'break-word', textAlign: 'left' }}>
                      Reason: {order.cancelReason}
                    </div>
                  )}
                </td>
                <td className="order-date">
                  {new Date(order.orderDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td>
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="view-details-btn"
                  >
                    <FaEye /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="payment-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="payment-modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="payment-modal-header" style={{ background: 'linear-gradient(135deg, #ffa726, #f06292)' }}>
              <h3>Order Details: #{selectedOrder.orderNumber || selectedOrder._id.slice(-8)}</h3>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>&times;</button>
            </div>
            <div className="payment-modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              <div className="detail-row">
                <strong>Customer:</strong>
                <span>{selectedOrder.user?.name || 'N/A'} ({selectedOrder.user?.email || 'N/A'})</span>
              </div>
              <div className="detail-row">
                <strong>Order Date:</strong>
                <span>{new Date(selectedOrder.orderDate).toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <strong>Order Status:</strong>
                <span className="status-badge" style={{ backgroundColor: `${getStatusColor(selectedOrder.orderStatus)}15`, color: getStatusColor(selectedOrder.orderStatus), fontWeight: '700', padding: '4px 8px', borderRadius: '12px' }}>
                  {selectedOrder.orderStatus}
                </span>
              </div>
              <div className="detail-row">
                <strong>Payment Status:</strong>
                <span className="status-badge" style={{ backgroundColor: selectedOrder.paymentStatus === 'Paid' ? '#e8f5e9' : '#fff3e0', color: selectedOrder.paymentStatus === 'Paid' ? '#2e7d32' : '#e65100', fontWeight: '700', padding: '4px 8px', borderRadius: '12px' }}>
                  {selectedOrder.paymentStatus}
                </span>
              </div>
              
              <div style={{ marginTop: '15px' }}>
                <h4 style={{ color: '#ffa726', margin: '0 0 10px 0', fontSize: '14px', fontWeight: '600' }}>Products</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedOrder.products.map((item, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9f9f9', padding: '10px 12px', borderRadius: '8px', border: '1px solid #eee' }}>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: '600', fontSize: '13px', color: '#2c3e50' }}>{item.product?.name || 'Deleted Product'}</div>
                        <div style={{ fontSize: '11px', color: '#7f8c8d' }}>Qty: {item.quantity} &times; ₹{item.price}</div>
                      </div>
                      <div style={{ fontWeight: '700', color: '#2c3e50', fontSize: '13px' }}>
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-row" style={{ borderTop: '2px solid #eee', paddingTop: '12px', marginTop: '10px' }}>
                <strong>Total Amount:</strong>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#e65100' }}>
                  ₹{selectedOrder.products.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
                </span>
              </div>

              {selectedOrder.shippingAddress && (
                <div className="billing-address-section">
                  <h4 style={{ color: '#ffa726', margin: '0 0 10px 0', fontSize: '14px', fontWeight: '600' }}>Shipping Address</h4>
                  <p><strong>{selectedOrder.shippingAddress.fullName}</strong></p>
                  <p>{selectedOrder.shippingAddress.address}</p>
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}</p>
                  <p>Phone: {selectedOrder.shippingAddress.phone}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
