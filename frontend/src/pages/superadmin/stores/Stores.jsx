import React, { useState, useEffect } from 'react';
import { FaStore, FaEdit, FaTrash, FaSearch, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Stores.css';
import {
  getAllStores,
  createStore,
  updateStore,
  deleteStore,
} from '../../../services/superadmin/storeService';

const Stores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    owner: '',
    location: '',
    status: 'active',
    products: 0,
    revenue: 0
  });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const data = await getAllStores();
      setStores(data);
      setLoading(false);
    } catch (error) {
      toast.error(error.message || 'Error fetching stores');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        products: Number(formData.products),
        revenue: Number(formData.revenue)
      };

      if (selectedStore) {
        await updateStore(selectedStore._id, submitData);
        toast.success('Store updated successfully');
      } else {
        await createStore(submitData);
        toast.success('Store created successfully');
      }
      setShowAddModal(false);
      setSelectedStore(null);
      setFormData({
        name: '',
        owner: '',
        location: '',
        status: 'active',
        products: 0,
        revenue: 0
      });
      fetchStores();
    } catch (error) {
      toast.error(error.message || 'Error saving store');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this store?')) {
      try {
        await deleteStore(id);
        toast.success('Store deleted successfully');
        fetchStores();
      } catch (error) {
        toast.error(error.message || 'Error deleting store');
      }
    }
  };

  const handleEdit = (store) => {
    setSelectedStore(store);
    setFormData({
      name: store.name,
      owner: store.owner,
      location: store.location,
      status: store.status,
      products: store.products,
      revenue: store.revenue
    });
    setShowAddModal(true);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="stores-container">
      <div className="stores-header">
        <h1><FaStore /> Stores Management</h1>
        <div className="stores-actions">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search stores..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <button className="add-store-btn" onClick={() => {
            setSelectedStore(null);
            setFormData({
              name: '',
              owner: '',
              location: '',
              status: 'active',
              products: 0,
              revenue: 0
            });
            setShowAddModal(true);
          }}>
            <FaPlus /> Add New Store
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading stores...</div>
      ) : (
        <div className="stores-grid">
          {filteredStores.map(store => (
            <div key={store._id} className="store-card">
              <div className="store-header">
                <h3>{store.name}</h3>
                <span className={`status-badge ${store.status}`}>
                  {store.status}
                </span>
              </div>
              <div className="store-info">
                <p><strong>Owner:</strong> {store.owner}</p>
                <p><strong>Location:</strong> {store.location}</p>
                <p><strong>Products:</strong> {store.products}</p>
                <p><strong>Revenue:</strong> ${store.revenue.toLocaleString()}</p>
                <p><strong>Created:</strong> {new Date(store.createdAt).toLocaleDateString()}</p>
                <p><strong>Last Updated:</strong> {new Date(store.updatedAt).toLocaleDateString()}</p>
              </div>
              <div className="store-actions">
                <button className="edit-btn" onClick={() => handleEdit(store)}>
                  <FaEdit /> Edit
                </button>
                <button className="delete-btn" onClick={() => handleDelete(store._id)}>
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{selectedStore ? 'Edit Store' : 'Add New Store'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Store Name*</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="Enter store name"
                />
              </div>
              <div className="form-group">
                <label>Owner*</label>
                <input
                  type="text"
                  value={formData.owner}
                  onChange={(e) => setFormData({...formData, owner: e.target.value})}
                  required
                  placeholder="Enter owner name"
                />
              </div>
              <div className="form-group">
                <label>Location*</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                  placeholder="Enter store location"
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="form-group">
                <label>Number of Products</label>
                <input
                  type="number"
                  value={formData.products}
                  onChange={(e) => setFormData({...formData, products: e.target.value})}
                  min="0"
                  placeholder="Enter number of products"
                />
              </div>
              <div className="form-group">
                <label>Revenue ($)</label>
                <input
                  type="number"
                  value={formData.revenue}
                  onChange={(e) => setFormData({...formData, revenue: e.target.value})}
                  min="0"
                  step="0.01"
                  placeholder="Enter revenue"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  {selectedStore ? 'Update Store' : 'Create Store'}
                </button>
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
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

export default Stores;
