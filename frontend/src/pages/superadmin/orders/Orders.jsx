import React, { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../../../services/superadmin/orderAPI';
import './Orders.css';
import { FaSearch, FaFilter, FaEye, FaSpinner } from 'react-icons/fa';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    fromDate: '',
    toDate: '',
    search: ''
  });

  useEffect(() => {
    fetchOrders();
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
            {orders.map((order) => (
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
                    onClick={() => window.location.href = `/superadmin/orders/${order._id}`}
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
    </div>
  );
};

export default Orders;
