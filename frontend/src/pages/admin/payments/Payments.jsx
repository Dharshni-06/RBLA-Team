// Architect: SP
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaEye, FaDownload } from 'react-icons/fa';
import { isAdminLoggedIn, getAdminStore } from '../../../services/adminAuthService';
import axios from 'axios';
import './Payments.css';

const Payments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminStore, setAdminStore] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentsPerPage] = useState(5);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [paymentStats, setPaymentStats] = useState({
    totalPayments: 0,
    authorizedPayments: 0,
    settledPayments: 0,
    failedPayments: 0,
    voidedPayments: 0,
    totalRevenue: 0
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
          
          // Fetch payments from the API
          await fetchPayments();
          
          // Fetch payment statistics
          await fetchPaymentStats();
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setError('Authentication failed. Please log in again.');
        navigate('/admin/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthAndFetchData();
  }, [navigate]);

  const fetchPayments = async () => {
    try {
      // Get the admin token from cookies
      const response = await axios.get('http://localhost:5000/api/admin/payments', {
        withCredentials: true
      });

      if (response.data.success) {
        console.log('Payments data:', response.data);
        setPayments(response.data.data);
      } else {
        setError('Failed to fetch payments');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('Error fetching payments. Please try again.');
    }
  };

  const fetchPaymentStats = async () => {
    try {
      // Get the admin token from cookies
      const response = await axios.get('http://localhost:5000/api/admin/payments/stats', {
        withCredentials: true
      });

      if (response.data.success) {
        console.log('Payment stats:', response.data);
        setPaymentStats(response.data.data);
        setTotalRevenue(response.data.data.totalRevenue || 0);
      } else {
        console.error('Failed to fetch payment stats:', response.data);
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    }
  };

  // Filter payments based on search term, status filter, and date filter
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      (payment.orderNumber && payment.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (payment.customerName && payment.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (payment.transactionId && payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === '' || payment.status === statusFilter;
    
    let matchesDate = true;
    if (payment.date) {
      const paymentDate = new Date(payment.date);
      const today = new Date();
      const oneDay = 24 * 60 * 60 * 1000;
      
      if (dateFilter === 'today') {
        matchesDate = paymentDate.toDateString() === today.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(today - 7 * oneDay);
        matchesDate = paymentDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(today - 30 * oneDay);
        matchesDate = paymentDate >= monthAgo;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Get current payments for pagination
  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // View payment details
  const handleViewPayment = async (payment) => {
    try {
      // Fetch detailed payment information
      const response = await axios.get(`http://localhost:5000/api/admin/payments/${payment.id}`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        setSelectedPayment(response.data.data);
        setIsViewModalOpen(true);
      } else {
        setError('Failed to fetch payment details');
      }
    } catch (error) {
      console.error('Error fetching payment details:', error);
      setError('Error fetching payment details');
    }
  };

  const handleDownloadInvoice = (payment) => {
    // Implement download invoice functionality
    console.log('Download invoice for payment:', payment.id);
    // This would typically generate a PDF invoice and trigger a download
  };

  const handleCloseModal = () => {
    setIsViewModalOpen(false);
    setSelectedPayment(null);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading payments...</p>
      </div>
    );
  }

  return (
    <div className="payments-container">
      <div className="payments-header">
        <h1>Payments Management</h1>
        <p>Manage payments for {adminStore} store</p>
      </div>
      
      {/* Payment Statistics */}
      <div className="payments-stats">
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-value">₹{paymentStats.totalRevenue?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="stat-card">
          <h3>Completed Payments</h3>
          <p className="stat-value">{paymentStats.settledPayments || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Payments</h3>
          <p className="stat-value">{paymentStats.authorizedPayments || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Failed/Refunded</h3>
          <p className="stat-value">{(paymentStats.failedPayments || 0) + (paymentStats.voidedPayments || 0)}</p>
        </div>
      </div>

      <div className="payments-filters">
        <div className="search-bar">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by order number, customer name or transaction ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-options">
          <div className="filter-dropdown">
            <FaFilter />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="settled">Completed</option>
              <option value="authorized">Pending</option>
              <option value="failed">Failed</option>
              <option value="voided">Refunded</option>
            </select>
          </div>
          <div className="filter-dropdown">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="payments-table-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="loading-message">Loading payments...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="7" className="error-message">{error}</td>
              </tr>
            ) : currentPayments.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data-message">No payments found</td>
              </tr>
            ) : (
              currentPayments.map(payment => (
                <tr key={payment.id}>
                  <td>{payment.orderNumber}</td>
                  <td>{payment.customerName}</td>
                  <td>{new Date(payment.date).toLocaleDateString()}</td>
                  <td>₹{payment.amount?.toFixed(2) || payment.storeAmount?.toFixed(2) || '0.00'}</td>
                  <td>{payment.paymentMethod}</td>
                  <td>
                    <span className={`status-badge ${payment.status.toLowerCase()}`}>
                      {payment.status.toLowerCase() === 'authorized' ? 'Pending' : payment.status.toLowerCase() === 'settled' ? 'Completed' : payment.status}
                    </span>
                  </td>
                  <td className="actions">
                    <button 
                      className="action-btn view-btn" 
                      onClick={() => handleViewPayment(payment)}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button 
                      className="action-btn download-btn" 
                      onClick={() => handleDownloadInvoice(payment)}
                      title="Download Invoice"
                    >
                      <FaDownload />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        {Array.from({ length: Math.ceil(filteredPayments.length / paymentsPerPage) }, (_, i) => (
          <button
            key={i + 1}
            className={currentPage === i + 1 ? 'active' : ''}
            onClick={() => paginate(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {isViewModalOpen && selectedPayment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Payment Details</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="payment-details">
                <div className="payment-detail-row">
                  <span className="detail-label">Order Number:</span>
                  <span className="detail-value">{selectedPayment.orderNumber}</span>
                </div>
                <div className="payment-detail-row">
                  <span className="detail-label">Transaction ID:</span>
                  <span className="detail-value">{selectedPayment.transactionId}</span>
                </div>
                <div className="payment-detail-row">
                  <span className="detail-label">Customer:</span>
                  <span className="detail-value">{selectedPayment.customerName}</span>
                </div>
                <div className="payment-detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedPayment.customerEmail}</span>
                </div>
                <div className="payment-detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{new Date(selectedPayment.date).toLocaleString()}</span>
                </div>
                <div className="payment-detail-row">
                  <span className="detail-label">Total Amount:</span>
                  <span className="detail-value">₹{selectedPayment.amount?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="payment-detail-row">
                  <span className="detail-label">Store Amount:</span>
                  <span className="detail-value">₹{selectedPayment.storeAmount?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="payment-detail-row">
                  <span className="detail-label">Method:</span>
                  <span className="detail-value">{selectedPayment.paymentMethod}</span>
                </div>
                <div className="payment-detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`status-badge ${selectedPayment.status.toLowerCase()}`}>
                    {selectedPayment.status.toLowerCase() === 'authorized' ? 'Pending' : selectedPayment.status.toLowerCase() === 'settled' ? 'Completed' : selectedPayment.status}
                  </span>
                </div>
                <div className="payment-detail-row">
                  <span className="detail-label">Order Status:</span>
                  <span className={`status-badge ${selectedPayment.orderStatus?.toLowerCase() || 'pending'}`}>
                    {selectedPayment.orderStatus?.charAt(0).toUpperCase() + selectedPayment.orderStatus?.slice(1) || 'Pending'}
                  </span>
                </div>

                {/* Order Products */}
                {selectedPayment.order && selectedPayment.order.products && selectedPayment.order.products.length > 0 && (
                  <div className="order-products">
                    <h4>Order Products</h4>
                    <table className="products-table">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPayment.order.products
                          .filter(item => item.product && item.product.store === adminStore)
                          .map((item, index) => (
                            <tr key={index}>
                              <td>{item.product?.name || 'Unknown Product'}</td>
                              <td>{item.quantity}</td>
                              <td>₹{item.price?.toFixed(2) || '0.00'}</td>
                              <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn secondary-btn" onClick={handleCloseModal}>Close</button>
              <button 
                className="btn primary-btn" 
                onClick={() => handleDownloadInvoice(selectedPayment)}
              >
                Download Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
