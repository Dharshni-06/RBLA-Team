import React, { useEffect, useState } from 'react';
import { getWorkers, addWorker, deleteWorker, updateWorker } from '../../services/workersapi';
import './workers.css';

const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for Add Worker functionality (as before)
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWorker, setNewWorker] = useState({
    name: '',
    age: '',
    phoneNo: '',
    email: '', // if needed
    address: '',
    salary: '',
    role: '',
    unit: '',
    aadharNo: ''
  });

  // State for Delete functionality (as before)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);

  // New state for Modify functionality
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [modifyWorker, setModifyWorker] = useState(null);

  const [notification, setNotification] = useState({ message: '', type: '' });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  const fetchWorkersData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWorkers();
      setWorkers(data);
    } catch (err) {
      setError('Failed to fetch workers data');
      console.error('Error fetching workers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkersData();
  }, []);

  // Add Worker Handler
  const handleAddWorker = async (e) => {
    e.preventDefault();
    try {
      const worker = await addWorker(newWorker);
      setWorkers([...workers, worker]);
      setShowAddForm(false);
      showNotification('Worker added successfully!');
      setNewWorker({
        name: '',
        age: '',
        phoneNo: '',
        email: '',
        address: '',
        salary: '',
        role: '',
        unit: '',
        aadharNo: ''
      });
    } catch (err) {
      setError('Failed to add worker');
      showNotification('Failed to add worker', 'error');
      console.error('Error adding worker:', err);
    }
  };

  // Delete Worker Handlers
  const handleDeleteClick = (worker) => {
    setSelectedWorker(worker);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedWorker) return;
    
    if (deleteConfirmation.toLowerCase() !== 'delete') {
      showNotification('Please type "delete" to confirm', 'error');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await deleteWorker(selectedWorker._id);
      setWorkers(workers.filter(w => w._id !== selectedWorker._id));
      setShowDeleteModal(false);
      setDeleteConfirmation('');
      setSelectedWorker(null);
      showNotification('Worker deleted successfully!');
    } catch (err) {
      showNotification('Failed to delete worker', 'error');
      console.error('Error deleting worker:', err);
    } finally {
      setLoading(false);
    }
  };

  // Modify Worker Handlers
  const handleModifyClick = (worker) => {
    setModifyWorker(worker);
    setShowModifyModal(true);
  };

  const handleModifyInputChange = (e) => {
    const { name, value } = e.target;
    setModifyWorker({
      ...modifyWorker,
      [name]: value
    });
  };

  const handleModifySubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateWorker(modifyWorker._id, modifyWorker);
      // Update the worker list with the modified worker
      setWorkers(workers.map((w) => (w._id === updated._id ? updated : w)));
      setShowModifyModal(false);
      setModifyWorker(null);
      showNotification('Worker updated successfully!');
    } catch (err) {
      console.error('Error updating worker:', err);
      showNotification('Failed to update worker', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewWorker({
      ...newWorker,
      [name]: value
    });
  };

  return (
    <div className="workers-container">
      <h2 className="workers-title">Workers Management</h2>
      
      {notification.message && (
        <div className={`notification ${notification.type}`}>
          {notification.type === 'error' ? '❌' : '✅'} {notification.message}
        </div>
      )}

      <div className="workers-buttons">
        <button onClick={fetchWorkersData} className="btn display-btn">
          Refresh Workers
        </button>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn add-btn">
          ➕ Add Worker
        </button>
      </div>

      {loading && <div className="loading">⏳ Loading workers data...</div>}
      {error && <div className="error">❌ {error}</div>}

      {/* Add Worker Form Modal */}
      {showAddForm && (
        <div className="add-worker-modal">
          <form className="add-worker-form" onSubmit={handleAddWorker}>
            <h3 className="form-title">➕ Add New Worker</h3>
            <div className="form-grid">
              {/* Form groups for each field */}
              <div className="form-group">
                <label>Full Name:</label>
                <input type="text" name="name" value={newWorker.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Age:</label>
                <input type="number" name="age" value={newWorker.age} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Phone Number:</label>
                <input type="tel" name="phoneNo" value={newWorker.phoneNo} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input type="email" name="email" value={newWorker.email} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Aadhar Number:</label>
                <input type="text" name="aadharNo" value={newWorker.aadharNo} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Address:</label>
                <textarea name="address" value={newWorker.address} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Salary (₹):</label>
                <input type="number" name="salary" value={newWorker.salary} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Role/Position:</label>
                <select name="role" value={newWorker.role} onChange={handleInputChange} required>
                  <option value="">Select Role</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Technician">Technician</option>
                  <option value="Operator">Operator</option>
                  <option value="Helper">Helper</option>
                </select>
              </div>
              <div className="form-group">
                <label>Work Unit:</label>
                <input type="text" name="unit" value={newWorker.unit} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="form-buttons">
              <button type="button" className="btn cancel-btn" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button type="submit" className="btn submit-btn">Add Worker</button>
            </div>
          </form>
        </div>
      )}

      {/* Modify Worker Modal */}
      {showModifyModal && modifyWorker && (
        <div className="add-worker-modal">
          <form className="add-worker-form" onSubmit={handleModifySubmit}>
            <h3 className="form-title">✏️ Modify Worker</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name:</label>
                <input type="text" name="name" value={modifyWorker.name} onChange={handleModifyInputChange} required />
              </div>
              <div className="form-group">
                <label>Age:</label>
                <input type="number" name="age" value={modifyWorker.age} onChange={handleModifyInputChange} required />
              </div>
              <div className="form-group">
                <label>Phone Number:</label>
                <input type="tel" name="phoneNo" value={modifyWorker.phoneNo} onChange={handleModifyInputChange} required />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input type="email" name="email" value={modifyWorker.email} onChange={handleModifyInputChange} required />
              </div>
              <div className="form-group">
                <label>Aadhar Number:</label>
                <input type="text" name="aadharNo" value={modifyWorker.aadharNo} onChange={handleModifyInputChange} required />
              </div>
              <div className="form-group">
                <label>Address:</label>
                <textarea name="address" value={modifyWorker.address} onChange={handleModifyInputChange} required />
              </div>
              <div className="form-group">
                <label>Salary (₹):</label>
                <input type="number" name="salary" value={modifyWorker.salary} onChange={handleModifyInputChange} required />
              </div>
              <div className="form-group">
                <label>Role/Position:</label>
                <select name="role" value={modifyWorker.role} onChange={handleModifyInputChange} required>
                  <option value="">Select Role</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Technician">Technician</option>
                  <option value="Operator">Operator</option>
                  <option value="Helper">Helper</option>
                </select>
              </div>
              <div className="form-group">
                <label>Work Unit:</label>
                <input type="text" name="unit" value={modifyWorker.unit} onChange={handleModifyInputChange} required />
              </div>
            </div>
            <div className="form-buttons">
              <button type="button" className="btn cancel-btn" onClick={() => { setShowModifyModal(false); setModifyWorker(null); }}>Cancel</button>
              <button type="submit" className="btn submit-btn">Update Worker</button>
            </div>
          </form>
        </div>
      )}

      {/* Workers Table */}
      <div className="table-responsive">
        <table className="workers-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Photo</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Role</th>
              <th>Salary</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {workers.map(worker => (
              <tr key={worker._id}>
                <td>{worker._id}</td>
                <td>
                  <img src={''} alt={worker.name} className="worker-avatar" />
                </td>
                <td>{worker.name}</td>
                <td>{worker.email}</td>
                <td>{worker.phoneNo}</td>
                <td>{worker.address}</td>
                <td>
                  <span className={`role-badge ${worker.role.toLowerCase().replace(/\s/g, '-')}`}>
                    {worker.role}
                  </span>
                </td>
                <td>₹{worker.salary?.toLocaleString()}</td>
                <td>{new Date(worker.createdAt).toLocaleDateString()}</td>
                <td className="action-buttons">
                  <button className="btn modify-btn" onClick={() => handleModifyClick(worker)}>✏️</button>
                  <button className="btn delete-btn" onClick={() => handleDeleteClick(worker)}>❌</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Workers;
