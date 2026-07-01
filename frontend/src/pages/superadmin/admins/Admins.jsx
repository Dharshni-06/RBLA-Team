import React, { useState, useEffect } from 'react';
import { FaUserShield, FaPlus, FaEye, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getAllAdmins, createAdmin, updateAdmin, deleteAdmin } from '../../../services/superadmin/adminService';
import AdminRegistration from '../adminregistration';
import './admins.css';

const Admins = () => {
  // State for admins data
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalAdmins: 0
  });

  // State for modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAdmins, setFilteredAdmins] = useState([]);

  // Fetch admins and update count
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await getAllAdmins();
      setAdmins(response.admins || []);
      // Update total count from admins array
      setStats(prev => ({
        ...prev,
        totalAdmins: response.admins?.length || 0
      }));
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      toast.error('Failed to fetch admins');
    }
  };

  // Fetch admins on component mount
  useEffect(() => {
    fetchAdmins();
  }, []);

  // Update filtered admins when admins or search query changes
  useEffect(() => {
    if (admins) {
      const filtered = admins.filter(admin => 
        admin.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.storeName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAdmins(filtered);
    } else {
      setFilteredAdmins([]);
    }
  }, [admins, searchQuery]);

  // Handle admin creation
  const handleCreateClick = () => {
    setShowCreateModal(true);
  };

  // Handle admin view
  const handleViewClick = (admin) => {
    setSelectedAdmin(admin);
    setShowViewModal(true);
  };

  // Handle admin edit
  const handleEditClick = (admin) => {
    setSelectedAdmin(admin);
    setShowEditModal(true);
  };

  // Handle admin deletion
  const handleDeleteClick = (admin) => {
    setSelectedAdmin(admin);
    setShowDeleteModal(true);
  };

  // Confirm admin deletion
  const handleConfirmDelete = async () => {
    try {
      await deleteAdmin(selectedAdmin._id);
      toast.success('Admin deleted successfully');
      setShowDeleteModal(false);
      fetchAdmins();
    } catch (err) {
      toast.error('Failed to delete admin');
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="admins-container">
        <h1>Admin Management</h1>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admins-container">
        <h1>Admin Management</h1>
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="admins-container">
      {/* Header */}
      <div className="admins-header">
        <h1>Admin Management</h1>
        <div className="header-actions">
          <button className="create-button" onClick={handleCreateClick}>
            <FaPlus /> Create New Admin
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="admin-stats">
        <div className="stat-card">
          <FaUserShield className="stat-icon" />
          <div className="stat-info">
            <h3>Total Admins</h3>
            <p>{stats.totalAdmins}</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="admins-search">
        <div className="search-input">
          <FaSearch />
          <input
            type="text"
            placeholder="Search admins by name, email, or store..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Admins Table */}
      <div className="admins-table-container">
        <table className="admins-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Store</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  No admins found
                </td>
              </tr>
            ) : (
              filteredAdmins.map((admin) => (
                <tr key={admin._id}>
                  <td>{admin.name}</td>
                  <td>{admin.email}</td>
                  <td>{admin.storeName}</td>
                  <td>
                    <span className={`status-badge ${admin.isActive ? 'active' : 'inactive'}`}>
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{formatDate(admin.createdAt)}</td>
                  <td className="actions">
                    <button
                      className="action-button view"
                      onClick={() => handleViewClick(admin)}
                      title="View Admin"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="action-button edit"
                      onClick={() => handleEditClick(admin)}
                      title="Edit Admin"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="action-button delete"
                      onClick={() => handleDeleteClick(admin)}
                      title="Delete Admin"
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

      {/* Modals */}
      {showCreateModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Create New Admin</h2>
            <AdminRegistration onSuccess={() => {
              setShowCreateModal(false);
              fetchAdmins();
            }} />
            <button className="close-button" onClick={() => setShowCreateModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {showViewModal && selectedAdmin && (
        <div className="modal">
          <div className="modal-content">
            <h2>Admin Details</h2>
            <div className="admin-details">
              <p><strong>Name:</strong> {selectedAdmin.name}</p>
              <p><strong>Email:</strong> {selectedAdmin.email}</p>
              <p><strong>Store:</strong> {selectedAdmin.storeName}</p>
              <p><strong>Status:</strong> {selectedAdmin.isActive ? 'Active' : 'Inactive'}</p>
              <p><strong>Created:</strong> {formatDate(selectedAdmin.createdAt)}</p>
            </div>
            <button className="close-button" onClick={() => setShowViewModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {showEditModal && selectedAdmin && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Admin</h2>
            <AdminRegistration
              admin={selectedAdmin}
              isEdit={true}
              onSuccess={() => {
                setShowEditModal(false);
                fetchAdmins();
              }}
            />
            <button className="close-button" onClick={() => setShowEditModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {showDeleteModal && selectedAdmin && (
        <div className="modal">
          <div className="modal-content">
            <h2>Delete Admin</h2>
            <p>Are you sure you want to delete admin {selectedAdmin.name}?</p>
            <div className="modal-actions">
              <button className="delete-button" onClick={handleConfirmDelete}>
                Delete
              </button>
              <button className="cancel-button" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admins;
