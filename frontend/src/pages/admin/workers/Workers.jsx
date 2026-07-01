// Architect: SP
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaPlus, FaUserCog } from 'react-icons/fa';
import { isAdminLoggedIn, getAdminStore } from '../../../services/adminAuthService';
import { getWorkers, addWorker, updateWorker, deleteWorker } from '../../../services/admin/workerService';
import { toast } from 'react-toastify';
import './Workers.css';

const Workers = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminStore, setAdminStore] = useState('');
  const [workers, setWorkers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newWorker, setNewWorker] = useState({
    name: '',
    age: '',
    phoneNo: '',
    address: '',
    role: 'Sales Associate',
    aadharNo: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [workersPerPage] = useState(5);

  // Fetch workers data
  const fetchWorkers = async () => {
    try {
      console.log('Fetching workers...');
      const response = await getWorkers();
      console.log('Workers response:', response);
      setWorkers(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching workers:', err);
      console.log('Full error object:', JSON.stringify(err, null, 2));
      setError('Failed to fetch workers data');
      toast.error('Failed to fetch workers data');
    }
  };

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        console.log('Checking auth...');
        const isLoggedIn = await isAdminLoggedIn();
        console.log('Is admin logged in:', isLoggedIn);
        if (!isLoggedIn) {
          navigate('/admin/login');
          return;
        }
        
        // Get admin's store
        const store = getAdminStore();
        console.log('Admin store:', store);
        if (store) {
          setAdminStore(store);
          await fetchWorkers();
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

  // Filter workers based on search term and role filter
  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          worker.phoneNo.includes(searchTerm);
    const matchesRole = roleFilter === '' || worker.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Get current workers for pagination
  const indexOfLastWorker = currentPage * workersPerPage;
  const indexOfFirstWorker = indexOfLastWorker - workersPerPage;
  const currentWorkers = filteredWorkers.slice(indexOfFirstWorker, indexOfLastWorker);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle view worker details
  const handleViewWorker = (worker) => {
    setSelectedWorker(worker);
    setIsViewModalOpen(true);
  };

  // Handle edit worker
  const handleEditWorker = (worker) => {
    setSelectedWorker(worker);
    setNewWorker({
      name: worker.name,
      age: worker.age,
      phoneNo: worker.phoneNo,
      address: worker.address,
      role: worker.role,
      aadharNo: worker.aadharNo
    });
    setIsEditModalOpen(true);
  };

  // Handle delete worker
  const handleDeleteWorker = async (workerId) => {
    if (window.confirm('Are you sure you want to delete this worker?')) {
      try {
        await deleteWorker(workerId);
        toast.success('Worker deleted successfully');
        fetchWorkers(); // Refresh the list
      } catch (error) {
        toast.error('Failed to delete worker');
      }
    }
  };

  // Handle add new worker
  const handleAddWorker = () => {
    setNewWorker({
      name: '',
      age: '',
      phoneNo: '',
      address: '',
      role: 'Sales Associate',
      aadharNo: ''
    });
    setIsAddModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewWorker(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitWorker = async () => {
    try {
      await addWorker(newWorker);
      toast.success('Worker added successfully');
      setIsAddModalOpen(false);
      fetchWorkers(); // Refresh the list
      setNewWorker({
        name: '',
        age: '',
        phoneNo: '',
        address: '',
        role: 'Sales Associate',
        aadharNo: ''
      });
    } catch (error) {
      toast.error('Failed to add worker');
    }
  };

  const handleUpdateWorker = async () => {
    try {
      await updateWorker(selectedWorker._id, newWorker);
      toast.success('Worker updated successfully');
      setIsEditModalOpen(false);
      fetchWorkers(); // Refresh the list
    } catch (error) {
      toast.error('Failed to update worker');
    }
  };

  const handleCloseModal = () => {
    setIsViewModalOpen(false);
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedWorker(null);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading workers data...</p>
      </div>
    );
  }

  return (
    <div className="workers-container">
      <div className="workers-header">
        <h1>Workers Management</h1>
        <p>Manage store staff for {adminStore.charAt(0).toUpperCase() + adminStore.slice(1)} store</p>
      </div>

      <div className="workers-stats">
        <div className="stat-card">
          <h3>Total Workers</h3>
          <p>{workers.length}</p>
        </div>
        <div className="stat-card">
          <h3>Managers</h3>
          <p>{workers.filter(worker => worker.role === 'Manager').length}</p>
        </div>
        <div className="stat-card">
          <h3>Sales Associates</h3>
          <p>{workers.filter(worker => worker.role === 'Sales Associate').length}</p>
        </div>
        <div className="stat-card">
          <h3>Other Staff</h3>
          <p>{workers.filter(worker => !['Manager', 'Sales Associate'].includes(worker.role)).length}</p>
        </div>
      </div>

      <div className="workers-actions">
        <div className="search-bar">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by name or phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-options">
          <div className="filter-dropdown">
            <FaUserCog />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="Manager">Manager</option>
              <option value="Sales Associate">Sales Associate</option>
              <option value="Cashier">Cashier</option>
              <option value="Inventory Clerk">Inventory Clerk</option>
            </select>
          </div>
        </div>
        <button className="add-worker-btn" onClick={handleAddWorker}>
          <FaPlus /> Add Worker
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {currentWorkers.length === 0 ? (
        <div className="no-workers">
          <p>No workers found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="workers-table-container">
            <table className="workers-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Age</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentWorkers.map((worker) => (
                  <tr key={worker._id}>
                    <td>{worker.name}</td>
                    <td>{worker.role}</td>
                    <td>{worker.age}</td>
                    <td>{worker.phoneNo}</td>
                    <td>{worker.address}</td>
                    <td className="actions">
                      <button 
                        className="action-btn view-btn" 
                        onClick={() => handleViewWorker(worker)}
                        title="View Worker"
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="action-btn edit-btn" 
                        onClick={() => handleEditWorker(worker)}
                        title="Edit Worker"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => handleDeleteWorker(worker._id)}
                        title="Delete Worker"
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
            {Array.from({ length: Math.ceil(filteredWorkers.length / workersPerPage) }, (_, i) => (
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

      {/* View Worker Modal */}
      {isViewModalOpen && selectedWorker && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Worker Details</h2>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="worker-detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{selectedWorker.name}</span>
              </div>
              <div className="worker-detail-row">
                <span className="detail-label">Age:</span>
                <span className="detail-value">{selectedWorker.age}</span>
              </div>
              <div className="worker-detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{selectedWorker.phoneNo}</span>
              </div>
              <div className="worker-detail-row">
                <span className="detail-label">Role:</span>
                <span className="detail-value">{selectedWorker.role}</span>
              </div>
              <div className="worker-detail-row">
                <span className="detail-label">Address:</span>
                <span className="detail-value">{selectedWorker.address}</span>
              </div>
              <div className="worker-detail-row">
                <span className="detail-label">Aadhar No:</span>
                <span className="detail-value">{selectedWorker.aadharNo}</span>
              </div>
              <div className="worker-detail-row">
                <span className="detail-label">Store:</span>
                <span className="detail-value">{selectedWorker.store.charAt(0).toUpperCase() + selectedWorker.store.slice(1)}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn secondary-btn" onClick={handleCloseModal}>Close</button>
              <button className="btn primary-btn" onClick={() => handleEditWorker(selectedWorker)}>Edit Worker</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Worker Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isEditModalOpen ? 'Edit Worker' : 'Add New Worker'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newWorker.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="age">Age</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={newWorker.age}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phoneNo">Phone</label>
                <input
                  type="text"
                  id="phoneNo"
                  name="phoneNo"
                  value={newWorker.phoneNo}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={newWorker.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={newWorker.role}
                  onChange={handleInputChange}
                >
                  <option value="Manager">Manager</option>
                  <option value="Sales Associate">Sales Associate</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Inventory Clerk">Inventory Clerk</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="aadharNo">Aadhar Number</label>
                <input
                  type="text"
                  id="aadharNo"
                  name="aadharNo"
                  value={newWorker.aadharNo}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn secondary-btn" onClick={handleCloseModal}>Cancel</button>
              <button 
                className="btn primary-btn" 
                onClick={isEditModalOpen ? handleUpdateWorker : handleSubmitWorker}
              >
                {isEditModalOpen ? 'Update Worker' : 'Add Worker'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workers;
