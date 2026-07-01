import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import { getAllReturns, updateReturnStatus } from '../../../services/superadmin/orderAPI';
import './Returns.css';

const Returns = () => {
  const navigate = useNavigate();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [returnsPerPage] = useState(5);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchAllReturnRequests = async () => {
      try {
        const token = localStorage.getItem('superadminToken');
        if (!token) {
          navigate('/superadmin/login');
          return;
        }

        const response = await getAllReturns();
        if (response.success) {
          setReturns(response.data);
        } else {
          setError('Failed to fetch return requests.');
        }
      } catch (err) {
        console.error('Error fetching global returns:', err);
        setError('Error loading returns. Please make sure you are logged in.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllReturnRequests();
  }, [navigate]);

  const handleUpdateStatus = async (returnId, newStatus) => {
    try {
      setIsUpdating(true);
      const response = await updateReturnStatus(returnId, newStatus);
      if (response.success) {
        setReturns(prev =>
          prev.map(item => (item._id === returnId ? { ...item, status: newStatus } : item))
        );
        if (selectedReturn && selectedReturn._id === returnId) {
          setSelectedReturn(prev => ({ ...prev, status: newStatus }));
        }
        alert(`Return status updated successfully to ${newStatus}`);
      } else {
        alert('Failed to update return status.');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error updating return request status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleViewDetails = (item) => {
    setSelectedReturn(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReturn(null);
  };

  // Filter returns
  const filteredReturns = returns.filter(item => {
    const matchesSearch =
      (item.orderNumber ? item.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
      (item.email ? item.email.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
      (item.product?.name ? item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) : false);
    const matchesStatus = statusFilter === '' || item.status === statusFilter;
    const matchesStore = storeFilter === '' || item.store === storeFilter;
    return matchesSearch && matchesStatus && matchesStore;
  });

  // Unique stores for filters
  const uniqueStores = [...new Set(returns.map(item => item.store))];

  // Pagination
  const indexOfLastReturn = currentPage * returnsPerPage;
  const indexOfFirstReturn = indexOfLastReturn - returnsPerPage;
  const currentReturns = filteredReturns.slice(indexOfFirstReturn, indexOfLastReturn);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading return requests...</p>
      </div>
    );
  }

  return (
    <div className="returns-container">
      <div className="returns-header">
        <h1>Global Return Requests</h1>
        <p>Overview of all product return requests across all registered stores</p>
      </div>

      <div className="returns-filters">
        <div className="search-bar">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by Order #, email, or product"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-dropdown">
          <FaFilter />
          <select
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
          >
            <option value="">All Stores</option>
            {uniqueStores.map(store => (
              <option key={store} value={store}>
                {store.charAt(0).toUpperCase() + store.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-dropdown">
          <FaFilter />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {currentReturns.length === 0 ? (
        <div className="no-returns">
          <p>No return requests found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="returns-table-container">
            <table className="returns-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Store</th>
                  <th>Customer Email</th>
                  <th>Product</th>
                  <th>Reason</th>
                  <th>Date Requested</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentReturns.map((item) => (
                  <tr key={item._id}>
                    <td>{item.orderNumber}</td>
                    <td className="store-name-cell">{item.store.charAt(0).toUpperCase() + item.store.slice(1)}</td>
                    <td className="customer-email">{item.email}</td>
                    <td className="product-name">{item.product ? item.product.name : 'Unknown Product'}</td>
                    <td className="reason-cell">{item.reason}</td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="action-btn view-btn"
                        onClick={() => handleViewDetails(item)}
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      {item.status === 'Pending' && (
                        <>
                          <button
                            className="action-btn approve-btn"
                            onClick={() => handleUpdateStatus(item._id, 'Approved')}
                            disabled={isUpdating}
                            title="Approve Return"
                          >
                            <FaCheck />
                          </button>
                          <button
                            className="action-btn reject-btn"
                            onClick={() => handleUpdateStatus(item._id, 'Rejected')}
                            disabled={isUpdating}
                            title="Reject Return"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            {Array.from({ length: Math.ceil(filteredReturns.length / returnsPerPage) }, (_, i) => (
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

      {isModalOpen && selectedReturn && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Return Request Details</h2>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Order Number:</span>
                <span className="detail-value">{selectedReturn.orderNumber}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Store:</span>
                <span className="detail-value" style={{ textTransform: 'capitalize' }}>
                  {selectedReturn.store}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Customer Email:</span>
                <span className="detail-value">{selectedReturn.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Product Name:</span>
                <span className="detail-value">{selectedReturn.product ? selectedReturn.product.name : 'Unknown Product'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Reason for Return:</span>
                <span className="detail-value" style={{ textTransform: 'capitalize' }}>
                  {selectedReturn.reason.replace('-', ' ')}
                </span>
              </div>
              
              {selectedReturn.details && (
                <div className="detail-row details-textarea-row">
                  <span className="detail-label">Additional Comments:</span>
                  <div className="comments-box">{selectedReturn.details}</div>
                </div>
              )}

              <div className="detail-row">
                <span className="detail-label">Date Requested:</span>
                <span className="detail-value">{new Date(selectedReturn.createdAt).toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Current Status:</span>
                <span className={`status-badge ${selectedReturn.status.toLowerCase()}`}>
                  {selectedReturn.status}
                </span>
              </div>

              {selectedReturn.status === 'Pending' && (
                <div className="status-update-section">
                  <h3>Approve or Reject Return Request</h3>
                  <div className="status-buttons">
                    <button
                      className="status-btn approve-btn-large"
                      onClick={() => handleUpdateStatus(selectedReturn._id, 'Approved')}
                      disabled={isUpdating}
                    >
                      <FaCheck /> Approve Return
                    </button>
                    <button
                      className="status-btn reject-btn-large"
                      onClick={() => handleUpdateStatus(selectedReturn._id, 'Rejected')}
                      disabled={isUpdating}
                    >
                      <FaTimes /> Reject Return
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Returns;
