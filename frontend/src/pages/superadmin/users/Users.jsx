import React, { useState, useEffect } from 'react';
import { FaUser, FaUserCheck, FaUserTimes, FaUserEdit, FaEye, FaTrash, FaSort, FaSortUp, FaSortDown, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getAllUsers, getUserStats, getUserById, updateUser, deleteUser } from '../../../services/superadmin/userService';
import './users.css';

const Users = () => {
  // State for users data
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    unverifiedUsers: 0,
    completedProfiles: 0,
    incompleteProfiles: 0,
    newUsers: 0,
    verificationRate: 0,
    profileCompletionRate: 0
  });

  // State for pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  });

  // State for filtering and sorting
  const [filters, setFilters] = useState({
    search: '',
    isVerified: '',
    sort: 'createdAt',
    order: 'desc'
  });

  // State for selected user and modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phoneNumber: '',
    isVerified: false,
    profileCompleted: false
  });

  // Fetch users on component mount and when filters or pagination change
  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [filters, pagination.currentPage, pagination.limit]);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        sort: filters.sort,
        order: filters.order,
        search: filters.search,
        isVerified: filters.isVerified === '' ? undefined : filters.isVerified
      };

      const response = await getAllUsers(params);
      
      setUsers(response.users);
      setPagination({
        ...pagination,
        totalPages: response.totalPages,
        total: response.total
      });
      
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
      setLoading(false);
      toast.error('Failed to fetch users');
    }
  };

  // Fetch user statistics
  const fetchStats = async () => {
    try {
      const response = await getUserStats();
      setStats(response.stats);
    } catch (err) {
      console.error('Failed to fetch user statistics:', err);
      toast.error('Failed to fetch user statistics');
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setFilters({
      ...filters,
      search: e.target.value
    });
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
    setPagination({
      ...pagination,
      currentPage: 1 // Reset to first page when filter changes
    });
  };

  // Handle sort change
  const handleSortChange = (field) => {
    setFilters({
      ...filters,
      sort: field,
      order: field === filters.sort && filters.order === 'asc' ? 'desc' : 'asc'
    });
  };

  // Get sort icon based on current sort field and order
  const getSortIcon = (field) => {
    if (filters.sort !== field) return <FaSort />;
    return filters.order === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination({
      ...pagination,
      currentPage: page
    });
  };

  // Open view modal with user details
  const handleViewUser = async (userId) => {
    try {
      const response = await getUserById(userId);
      setSelectedUser(response.user);
      setShowViewModal(true);
    } catch (err) {
      toast.error('Failed to fetch user details');
    }
  };

  // Open edit modal with user details
  const handleEditUser = async (userId) => {
    try {
      const response = await getUserById(userId);
      const user = response.user;
      setSelectedUser(user);
      setEditFormData({
        name: user.name || '',
        phoneNumber: user.phoneNumber || '',
        isVerified: user.isVerified || false,
        profileCompleted: user.profileCompleted || false
      });
      setShowEditModal(true);
    } catch (err) {
      toast.error('Failed to fetch user details for editing');
    }
  };

  // Handle edit form input change
  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Submit edit form
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(selectedUser._id, editFormData);
      setShowEditModal(false);
      toast.success('User updated successfully');
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  // Open delete confirmation modal
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Confirm user deletion
  const handleConfirmDelete = async () => {
    try {
      await deleteUser(selectedUser._id);
      setShowDeleteModal(false);
      toast.success('User deleted successfully');
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Render loading state
  if (loading && users.length === 0) {
    return (
      <div className="users-container">
        <h1 className="users-title">Users Management</h1>
        <div className="users-loading">
          <p>Loading users data...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && users.length === 0) {
    return (
      <div className="users-container">
        <h1 className="users-title">Users Management</h1>
        <div className="users-error">
          <p>Error: {error}</p>
          <button onClick={fetchUsers}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="users-container">
      {/* Header */}
      <div className="users-header">
        <h1 className="users-title">Users Management</h1>
      </div>

      {/* Statistics */}
      <div className="users-stats">
        <div className="stat-card">
          <div className="stat-title">Total Users</div>
          <div className="stat-value">{stats.totalUsers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Verified Users</div>
          <div className="stat-value">{stats.verifiedUsers}</div>
          <div className="stat-description">{stats.verificationRate}% of total</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Unverified Users</div>
          <div className="stat-value">{stats.unverifiedUsers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Completed Profiles</div>
          <div className="stat-value">{stats.completedProfiles}</div>
          <div className="stat-description">{stats.profileCompletionRate}% of total</div>
        </div>
      </div>

      {/* Filters */}
      <div className="users-filters">
        <div className="filter-group search-input">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={filters.search}
            onChange={handleSearchChange}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">Verification:</label>
          <select
            name="isVerified"
            value={filters.isVerified}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th onClick={() => handleSortChange('name')}>
                Name {getSortIcon('name')}
              </th>
              <th onClick={() => handleSortChange('email')}>
                Email {getSortIcon('email')}
              </th>
              <th onClick={() => handleSortChange('phoneNumber')}>
                Phone {getSortIcon('phoneNumber')}
              </th>
              <th onClick={() => handleSortChange('isVerified')}>
                Verification {getSortIcon('isVerified')}
              </th>
              <th onClick={() => handleSortChange('profileCompleted')}>
                Profile {getSortIcon('profileCompleted')}
              </th>
              <th onClick={() => handleSortChange('createdAt')}>
                Joined {getSortIcon('createdAt')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <div className="users-empty">
                    <FaUser className="users-empty-icon" />
                    <p className="users-empty-text">No users found</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name || 'N/A'}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${user.isVerified ? 'status-verified' : 'status-unverified'}`}>
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.profileCompleted ? 'status-complete' : 'status-incomplete'}`}>
                      {user.profileCompleted ? 'Complete' : 'Incomplete'}
                    </span>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td className="action-cell">
                    <button
                      className="action-button view-button"
                      onClick={() => handleViewUser(user._id)}
                      title="View User"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="action-button edit-button"
                      onClick={() => handleEditUser(user._id)}
                      title="Edit User"
                    >
                      <FaUserEdit />
                    </button>
                    <button
                      className="action-button delete-button"
                      onClick={() => handleDeleteClick(user)}
                      title="Delete User"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {users.length > 0 && (
        <div className="pagination">
          <div className="pagination-info">
            Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of{' '}
            {pagination.total} users
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-button"
              onClick={() => handlePageChange(1)}
              disabled={pagination.currentPage === 1}
            >
              First
            </button>
            <button
              className="pagination-button"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              // Calculate page numbers to show (centered around current page)
              const totalPageButtons = Math.min(5, pagination.totalPages);
              let startPage = Math.max(
                1,
                pagination.currentPage - Math.floor(totalPageButtons / 2)
              );
              const endPage = Math.min(
                pagination.totalPages,
                startPage + totalPageButtons - 1
              );
              
              // Adjust start page if we're near the end
              if (endPage - startPage + 1 < totalPageButtons) {
                startPage = Math.max(1, endPage - totalPageButtons + 1);
              }
              
              const pageNumber = startPage + i;
              if (pageNumber <= pagination.totalPages) {
                return (
                  <button
                    key={pageNumber}
                    className={`pagination-button ${
                      pageNumber === pagination.currentPage ? 'active' : ''
                    }`}
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                );
              }
              return null;
            })}
            <button
              className="pagination-button"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Next
            </button>
            <button
              className="pagination-button"
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Last
            </button>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="user-modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="user-modal-header">
              <h2 className="user-modal-title">User Details</h2>
              <button className="user-modal-close" onClick={() => setShowViewModal(false)}>
                &times;
              </button>
            </div>
            <div className="user-modal-body">
              <div className="user-form-group">
                <label className="user-form-label">Name:</label>
                <p>{selectedUser.name || 'N/A'}</p>
              </div>
              <div className="user-form-group">
                <label className="user-form-label">Email:</label>
                <p>{selectedUser.email}</p>
              </div>
              <div className="user-form-group">
                <label className="user-form-label">Phone Number:</label>
                <p>{selectedUser.phoneNumber || 'N/A'}</p>
              </div>
              <div className="user-form-group">
                <label className="user-form-label">Verification Status:</label>
                <p>
                  <span className={`status-badge ${selectedUser.isVerified ? 'status-verified' : 'status-unverified'}`}>
                    {selectedUser.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                </p>
              </div>
              <div className="user-form-group">
                <label className="user-form-label">Profile Status:</label>
                <p>
                  <span className={`status-badge ${selectedUser.profileCompleted ? 'status-complete' : 'status-incomplete'}`}>
                    {selectedUser.profileCompleted ? 'Complete' : 'Incomplete'}
                  </span>
                </p>
              </div>
              <div className="user-form-group">
                <label className="user-form-label">Joined Date:</label>
                <p>{formatDate(selectedUser.createdAt)}</p>
              </div>
              <div className="user-form-group">
                <label className="user-form-label">Last Updated:</label>
                <p>{formatDate(selectedUser.updatedAt)}</p>
              </div>
            </div>
            <div className="user-modal-footer">
              <button
                className="user-modal-button user-modal-cancel"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
              <button
                className="user-modal-button user-modal-save"
                onClick={() => {
                  setShowViewModal(false);
                  handleEditUser(selectedUser._id);
                }}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="user-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="user-modal-header">
              <h2 className="user-modal-title">Edit User</h2>
              <button className="user-modal-close" onClick={() => setShowEditModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmitEdit}>
              <div className="user-modal-body">
                <div className="user-form-group">
                  <label className="user-form-label" htmlFor="name">
                    Name:
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditFormChange}
                    className="user-form-input"
                  />
                </div>
                <div className="user-form-group">
                  <label className="user-form-label">Email:</label>
                  <p>{selectedUser.email}</p>
                  <small>(Email cannot be changed)</small>
                </div>
                <div className="user-form-group">
                  <label className="user-form-label" htmlFor="phoneNumber">
                    Phone Number:
                  </label>
                  <input
                    type="text"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={editFormData.phoneNumber}
                    onChange={handleEditFormChange}
                    className="user-form-input"
                  />
                </div>
                <div className="user-form-group user-form-checkbox">
                  <input
                    type="checkbox"
                    id="isVerified"
                    name="isVerified"
                    checked={editFormData.isVerified}
                    onChange={handleEditFormChange}
                  />
                  <label className="user-form-label" htmlFor="isVerified">
                    User is verified
                  </label>
                </div>
                <div className="user-form-group user-form-checkbox">
                  <input
                    type="checkbox"
                    id="profileCompleted"
                    name="profileCompleted"
                    checked={editFormData.profileCompleted}
                    onChange={handleEditFormChange}
                  />
                  <label className="user-form-label" htmlFor="profileCompleted">
                    Profile is completed
                  </label>
                </div>
              </div>
              <div className="user-modal-footer">
                <button
                  type="button"
                  className="user-modal-button user-modal-cancel"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="user-modal-button user-modal-save">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="user-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="user-modal-header">
              <h2 className="user-modal-title">Delete User</h2>
              <button className="user-modal-close" onClick={() => setShowDeleteModal(false)}>
                &times;
              </button>
            </div>
            <div className="user-modal-body">
              <p>
                Are you sure you want to delete the user <strong>{selectedUser.name || selectedUser.email}</strong>?
              </p>
              <p>This action cannot be undone.</p>
            </div>
            <div className="user-modal-footer">
              <button
                className="user-modal-button user-modal-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="user-modal-button user-modal-delete"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
