// Architect: SP
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaBoxOpen, FaShippingFast, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import { isAdminLoggedIn, getAdminStore } from '../../../services/adminAuthService';
import { getStoreOrders, updateOrderStatus, getOrderStats } from '../../../services/adminapi/orderAPI';
import './Orders.css';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminStore, setAdminStore] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    canceledOrders: 0
  });

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        const isLoggedIn = await isAdminLoggedIn();
        if (!isLoggedIn) {
          navigate('/admin/login');
          return;
        }
        
        // Get admin's store
        const store = getAdminStore();
        if (store) {
          setAdminStore(store);
          
          // Fetch orders from the backend API
          const response = await getStoreOrders();
          if (response.success) {
            setOrders(response.data);
          } else {
            setError('Failed to fetch orders. Please try again.');
          }
          
          // Fetch order statistics
          const statsResponse = await getOrderStats();
          if (statsResponse.success) {
            setOrderStats(statsResponse.data);
          }
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to fetch orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthAndFetchData();
  }, [navigate]);

  // Filter orders based on search term and status filter
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.orderNumber ? order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) : false) || 
      (order.customerName ? order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) : false);
    const matchesStatus = statusFilter === '' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get current orders for pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsViewModalOpen(false);
    setSelectedOrder(null);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setIsUpdatingStatus(true);
      const response = await updateOrderStatus(orderId, newStatus);
      
      if (response.success) {
        // Update the order in the local state
        setOrders(prevOrders => 
          prevOrders.map(order => {
            if (order.id === orderId) {
              const updatedOrder = { ...order, status: newStatus };
              if (newStatus === 'Delivered' && order.paymentStatus === 'COD') {
                updatedOrder.paymentStatus = 'Paid';
              }
              return updatedOrder;
            }
            return order;
          })
        );
        
        // If the selected order is being updated, update it too
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => {
            const updatedSelected = { ...prev, status: newStatus };
            if (newStatus === 'Delivered' && prev.paymentStatus === 'COD') {
              updatedSelected.paymentStatus = 'Paid';
            }
            return updatedSelected;
          });
        }
        
        // Update order statistics
        const statsResponse = await getOrderStats();
        if (statsResponse.success) {
          setOrderStats(statsResponse.data);
        }
        
        alert(`Order status updated to ${newStatus}`);
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1>Orders Management</h1>
        <p>Manage orders for {adminStore ? adminStore.charAt(0).toUpperCase() + adminStore.slice(1) : 'your'} store</p>
      </div>

      <div className="stats-dashboard">
        <div className="stat-card total">
          <div className="stat-icon">
            <FaBoxOpen />
          </div>
          <div className="stat-info">
            <h3>Total Orders</h3>
            <p>{orderStats.totalOrders}</p>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">
            <FaSpinner />
          </div>
          <div className="stat-info">
            <h3>Pending</h3>
            <p>{orderStats.pendingOrders}</p>
          </div>
        </div>
        <div className="stat-card processing">
          <div className="stat-icon">
            <FaSpinner />
          </div>
          <div className="stat-info">
            <h3>Processing</h3>
            <p>{orderStats.processingOrders}</p>
          </div>
        </div>
        <div className="stat-card shipped">
          <div className="stat-icon">
            <FaShippingFast />
          </div>
          <div className="stat-info">
            <h3>Shipped</h3>
            <p>{orderStats.shippedOrders}</p>
          </div>
        </div>
        <div className="stat-card delivered">
          <div className="stat-icon">
            <FaCheck />
          </div>
          <div className="stat-info">
            <h3>Delivered</h3>
            <p>{orderStats.deliveredOrders}</p>
          </div>
        </div>
        <div className="stat-card canceled">
          <div className="stat-icon">
            <FaTimes />
          </div>
          <div className="stat-info">
            <h3>Canceled</h3>
            <p>{orderStats.canceledOrders}</p>
          </div>
        </div>
      </div>

      <div className="orders-filters">
        <div className="search-bar">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by order number or customer name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-dropdown">
          <FaFilter />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Canceled">Canceled</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {currentOrders.length === 0 ? (
        <div className="no-orders">
          <p>No orders found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.orderNumber}</td>
                    <td>{order.customerName}</td>
                    <td>{order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}</td>
                    <td>₹{order.total ? order.total.toFixed(2) : '0.00'}</td>
                    <td>
                      <span className={`status-badge ${order.status ? order.status.toLowerCase() : 'pending'}`}>
                        {order.status ? order.status : 'Pending'}
                      </span>
                    </td>
                    <td className="actions">
                      <button 
                        className="action-btn view-btn" 
                        onClick={() => handleViewOrder(order)}
                        title="View Order"
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="action-btn edit-btn" 
                        title="Update Status"
                        onClick={() => handleViewOrder(order)}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        title="Delete Order"
                        disabled
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            {Array.from({ length: Math.ceil(filteredOrders.length / ordersPerPage) }, (_, i) => (
              <button
                key={i + 1}
                className={currentPage === i + 1 ? 'active' : ''}
                onClick={() => paginate(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}

      {isViewModalOpen && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Order Details</h2>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="order-details">
                <div className="detail-row">
                  <span className="detail-label">Order Number:</span>
                  <span className="detail-value">{selectedOrder.orderNumber}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Customer:</span>
                  <span className="detail-value">{selectedOrder.customerName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{selectedOrder.date ? new Date(selectedOrder.date).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Total Amount:</span>
                  <span className="detail-value">₹{selectedOrder.total ? selectedOrder.total.toFixed(2) : '0.00'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Current Status:</span>
                  <span className={`status-badge ${selectedOrder.status ? selectedOrder.status.toLowerCase() : 'pending'}`}>
                    {selectedOrder.status ? selectedOrder.status : 'Pending'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Payment Status:</span>
                  <span className={`status-badge ${selectedOrder.paymentStatus ? selectedOrder.paymentStatus.toLowerCase() : 'unpaid'}`}>
                    {selectedOrder.paymentStatus ? selectedOrder.paymentStatus : 'Unpaid'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Payment Method:</span>
                  <span className="detail-value" style={{ fontWeight: '600', color: '#444' }}>
                    {selectedOrder.paymentStatus === 'COD' ? 'Cash on Delivery (COD)' : selectedOrder.paymentStatus === 'Paid' ? 'Online Payment (Card)' : 'Online (Pending)'}
                  </span>
                </div>
                
                <div className="status-update-section">
                  <h3>Update Order Status</h3>
                  <div className="status-buttons">
                    <button 
                      className={`status-btn pending ${selectedOrder.status === 'Pending' ? 'active' : ''}`}
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'Pending')}
                      disabled={isUpdatingStatus || selectedOrder.status === 'Pending'}
                    >
                      Pending
                    </button>
                    <button 
                      className={`status-btn processing ${selectedOrder.status === 'Processing' ? 'active' : ''}`}
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'Processing')}
                      disabled={isUpdatingStatus || selectedOrder.status === 'Processing'}
                    >
                      Processing
                    </button>
                    <button 
                      className={`status-btn shipped ${selectedOrder.status === 'Shipped' ? 'active' : ''}`}
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'Shipped')}
                      disabled={isUpdatingStatus || selectedOrder.status === 'Shipped'}
                    >
                      Shipped
                    </button>
                    <button 
                      className={`status-btn delivered ${selectedOrder.status === 'Delivered' ? 'active' : ''}`}
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'Delivered')}
                      disabled={isUpdatingStatus || selectedOrder.status === 'Delivered'}
                    >
                      Delivered
                    </button>
                    <button 
                      className={`status-btn canceled ${selectedOrder.status === 'Canceled' ? 'active' : ''}`}
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'Canceled')}
                      disabled={isUpdatingStatus || selectedOrder.status === 'Canceled'}
                    >
                      Canceled
                    </button>
                  </div>
                </div>
                
                {selectedOrder.products && selectedOrder.products.length > 0 && (
                  <div className="order-products">
                    <h3>Products</h3>
                    <table className="products-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.products.map((item, index) => (
                          <tr key={index}>
                            <td>{item.product ? item.product.name : 'Unknown Product'}</td>
                            <td>{item.quantity}</td>
                            <td>₹{item.price ? item.price.toFixed(2) : '0.00'}</td>
                            <td>₹{(item.price && item.quantity) ? (item.price * item.quantity).toFixed(2) : '0.00'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {selectedOrder.shippingAddress && (
                  <div className="shipping-address">
                    <h3>Shipping Address</h3>
                    <p>
                      <strong>{selectedOrder.shippingAddress.fullName || 'N/A'}</strong><br />
                      {selectedOrder.shippingAddress.address || 'N/A'}<br />
                      {selectedOrder.shippingAddress.city || 'N/A'}, {selectedOrder.shippingAddress.state || 'N/A'} - {selectedOrder.shippingAddress.pincode || 'N/A'}<br />
                      Phone: {selectedOrder.shippingAddress.phone || 'N/A'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
