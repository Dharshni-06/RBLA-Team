// Architect: SP
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaEye, FaShoppingBag } from 'react-icons/fa';
import { isAdminLoggedIn, getAdminStore } from '../../../services/adminAuthService';
import { getStoreUsers, getUserStats, getUserDetails, getUserOrders } from '../../../services/admin/userService';
import './Users.css';

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({
    totalCustomers: 0,
    newCustomers: 0,
    repeatCustomers: 0,
    recentOrdersCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminStore, setAdminStore] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);

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
          await fetchUsers();
          await fetchUserStats();
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setError('Authentication failed. Please log in again.');
        navigate('/admin/login');
      }
    };
    
    checkAuthAndFetchData();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getStoreUsers();
      setUsers(response.data);
      setError('');
    } catch (err) {
      setError(err.message || 'Error fetching users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await getUserStats();
      setUserStats(response.data);
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      setOrderLoading(true);
      const response = await getUserDetails(userId);
      setSelectedUser(response.data.user);
      setUserOrders(response.data.recentOrders);
    } catch (err) {
      setError(err.message || 'Error fetching user details');
    } finally {
      setOrderLoading(false);
    }
  };

  // Sort users based on sortConfig
  const sortedUsers = React.useMemo(() => {
    let sortableUsers = [...users];
    if (sortConfig.key) {
      sortableUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [users, sortConfig]);

  // Request sort
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filter users based on search term
  const filteredUsers = sortedUsers.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return user.name.toLowerCase().includes(searchLower) || 
           user.email.toLowerCase().includes(searchLower) ||
           (user.phone && user.phone.includes(searchTerm));
  });

  // Get current users for pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleViewUser = async (user) => {
    await fetchUserDetails(user._id);
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsViewModalOpen(false);
    setSelectedUser(null);
    setUserOrders([]);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="users-container">
      <div className="users-header">
        <h1>Customer Management</h1>
        <p>Manage customers for {adminStore.charAt(0).toUpperCase() + adminStore.slice(1)} store</p>
      </div>

      <div className="stats-dashboard">
        <div className="stat-card">
          <h3>Total Customers</h3>
          <div className="stat-value">{userStats.totalCustomers}</div>
          <div className="stat-subtitle">All time</div>
        </div>
        <div className="stat-card">
          <h3>New Customers</h3>
          <div className="stat-value">{userStats.newCustomers}</div>
          <div className="stat-subtitle">Last 30 days</div>
        </div>
        <div className="stat-card">
          <h3>Repeat Customers</h3>
          <div className="stat-value">{userStats.repeatCustomers}</div>
          <div className="stat-subtitle">Multiple orders</div>
        </div>
        <div className="stat-card">
          <h3>Recent Orders</h3>
          <div className="stat-value">{userStats.recentOrdersCount}</div>
          <div className="stat-subtitle">Last 30 days</div>
        </div>
      </div>

      <div className="search-filter-container">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email or phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {currentUsers.length === 0 ? (
        <div className="no-data">
          <p>No customers found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="reviews-table-container">
            <table className="reviews-table">
              <thead>
                <tr>
                  <th onClick={() => requestSort('name')}>
                    Name
                    {sortConfig.key === 'name' && (
                      <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                    )}
                  </th>
                  <th onClick={() => requestSort('email')}>
                    Email
                    {sortConfig.key === 'email' && (
                      <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                    )}
                  </th>
                  <th onClick={() => requestSort('phone')}>
                    Phone
                    {sortConfig.key === 'phone' && (
                      <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                    )}
                  </th>
                  <th onClick={() => requestSort('createdAt')}>
                    Joined
                    {sortConfig.key === 'createdAt' && (
                      <span>{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                    )}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone || 'N/A'}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td className="actions-cell">
                      <button 
                        className="action-btn view-btn"
                        onClick={() => handleViewUser(user)}
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {Math.ceil(filteredUsers.length / usersPerPage)}
            </span>
            <button
              className="pagination-btn"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage >= Math.ceil(filteredUsers.length / usersPerPage)}
            >
              Next
            </button>
          </div>
        </>
      )}

      {isViewModalOpen && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Customer Details</h3>
              <button className="close-btn" onClick={handleCloseModal}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="review-details">
                <div className="review-detail-row">
                  <div className="detail-label">Name:</div>
                  <div className="detail-value">{selectedUser.name}</div>
                </div>
                <div className="review-detail-row">
                  <div className="detail-label">Email:</div>
                  <div className="detail-value">{selectedUser.email}</div>
                </div>
                <div className="review-detail-row">
                  <div className="detail-label">Phone:</div>
                  <div className="detail-value">{selectedUser.phone || 'N/A'}</div>
                </div>
                <div className="review-detail-row">
                  <div className="detail-label">Joined:</div>
                  <div className="detail-value">{formatDate(selectedUser.createdAt)}</div>
                </div>
              </div>

              <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Recent Orders</h4>
              {orderLoading ? (
                <div className="loading-screen" style={{ height: '100px' }}>
                  <div className="spinner"></div>
                </div>
              ) : userOrders.length > 0 ? (
                <div className="reviews-table-container" style={{ marginTop: '10px' }}>
                  <table className="reviews-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userOrders.map((order) => (
                        <tr key={order._id}>
                          <td>{order.orderNumber}</td>
                          <td>{formatDate(order.createdAt)}</td>
                          <td>{order.orderStatus}</td>
                          <td>₹{order.totalAmount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="no-data">No orders found for this customer.</p>
              )}
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={handleCloseModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
