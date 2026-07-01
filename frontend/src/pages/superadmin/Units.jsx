import React, { useState, useEffect } from 'react';
import './Units.css';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { getAllUnits, createUnit, updateUnit, deleteUnit } from '../../services/unitsApi';
import { toast } from 'react-toastify';

const Units = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState([]);
  
  const [formData, setFormData] = useState({
    unitName: '',
    adminName: '',
    location: '',
    address: '',
    workerCapacity: '',
    email: '',
    phoneNo: ''
  });

  // Fetch units on component mount
  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const response = await getAllUnits();
      setUnits(response.data || []); // Extract units from the data property
    } catch (error) {
      toast.error(error.message || 'Failed to fetch units');
      setUnits([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (modalMode === 'add') {
        await createUnit(formData);
        toast.success('Unit created successfully');
      } else {
        await updateUnit(formData.id, formData);
        toast.success('Unit updated successfully');
      }
      setShowModal(false);
      setFormData({
        unitName: '',
        adminName: '',
        location: '',
        address: '',
        workerCapacity: '',
        email: '',
        phoneNo: ''
      });
      fetchUnits(); // Refresh the units list
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      try {
        setLoading(true);
        await deleteUnit(id);
        toast.success('Unit deleted successfully');
        fetchUnits(); // Refresh the units list
      } catch (error) {
        toast.error(error.message || 'Failed to delete unit');
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredUnits = units.filter(unit =>
    unit.unitName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.adminName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="units-container">
      <h1>Manage Units</h1>
      
      <div className="units-header">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search units..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button 
          className="add-unit-btn"
          onClick={() => {
            setModalMode('add');
            setShowModal(true);
          }}
          disabled={loading}
        >
          <FaPlus /> Add New Unit
        </button>
      </div>

      {loading && <div className="loading">Loading...</div>}

      <div className="units-grid">
        {filteredUnits.map(unit => (
          <div key={unit.id} className="unit-card">
            <div className="unit-card-header">
              <h3>{unit.unitName}</h3>
              <div className="unit-actions">
                <button 
                  onClick={() => {
                    setModalMode('edit');
                    setFormData(unit);
                    setShowModal(true);
                  }}
                  disabled={loading}
                >
                  <FaEdit />
                </button>
                <button 
                  onClick={() => handleDelete(unit.id)}
                  disabled={loading}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            <div className="unit-info">
              <p><strong>Admin:</strong> {unit.adminName}</p>
              <p><strong>Location:</strong> {unit.location}</p>
              <p><strong>Address:</strong> {unit.address}</p>
              <p><strong>Capacity:</strong> {unit.workerCapacity} workers</p>
              <p><strong>Email:</strong> {unit.email}</p>
              <p><strong>Phone:</strong> {unit.phoneNo}</p>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{modalMode === 'add' ? 'Add New Unit' : 'Edit Unit'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Unit Name:</label>
                <input
                  type="text"
                  name="unitName"
                  value={formData.unitName}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Admin Name:</label>
                <input
                  type="text"
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Location:</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Address:</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Worker Capacity:</label>
                <input
                  type="number"
                  name="workerCapacity"
                  value={formData.workerCapacity}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Phone Number:</label>
                <input
                  type="tel"
                  name="phoneNo"
                  value={formData.phoneNo}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {modalMode === 'add' ? 'Add Unit' : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Units;
