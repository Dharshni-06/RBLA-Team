import React, { useState, useEffect } from 'react';
import './customermanager.css';
import { toast } from 'react-toastify';
import { getAllCustomers, createCustomer, updateCustomer, deleteCustomer } from '../../services/customersApi';

const CustomerManager = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    store: 'entrepreneur 1',
    customerType: 'buyer',
    orders: [],
    status: 'active'
  });

  // Fetch customers data
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await getAllCustomers();
      if (response.status === 'success') {
        setCustomers(response.data.customers || []);
      }
    } catch (error) {
      toast.error('Failed to fetch customers');
      setCustomers([]);
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

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      const response = await createCustomer(formData);
      if (response.status === 'success') {
        toast.success('Customer added successfully');
        setShowAddModal(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          store: 'entrepreneur 1',
          customerType: 'buyer',
          orders: [],
          status: 'active'
        });
        fetchCustomers();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to add customer');
    }
  };

  const handleEditCustomer = async (e) => {
    e.preventDefault();
    try {
      const response = await updateCustomer(selectedCustomer._id, formData);
      if (response.status === 'success') {
        toast.success('Customer updated successfully');
        setShowAddModal(false);
        setSelectedCustomer(null);
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          store: 'entrepreneur 1',
          customerType: 'buyer',
          orders: [],
          status: 'active'
        });
        fetchCustomers();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update customer');
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        const response = await deleteCustomer(id);
        if (response.status === 'success') {
          toast.success('Customer deleted successfully');
          fetchCustomers();
        }
      } catch (error) {
        toast.error(error.message || 'Failed to delete customer');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      store: 'entrepreneur 1',
      customerType: 'buyer',
      orders: [],
      status: 'active'
    });
  };

  const openEditModal = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      store: customer.store,
      customerType: customer.customerType,
      orders: customer.orders || [],
      status: customer.status
    });
    setShowAddModal(true);
  };

  return (
    <div className="customer-manager">
      <div className="header">
        <h1>All Customers</h1>
        <div className="actions">
          <button onClick={() => { setShowAddModal(true); resetForm(); }}>
            Add Customer
          </button>
          <input
            type="text"
            placeholder="Quick search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Store</th>
                <th>Type</th>
                <th>Orders</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers
                .filter(customer => 
                  customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  customer.store.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(customer => (
                  <tr key={customer._id}>
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone}</td>
                    <td>
                      <span className={`store ${customer.store.replace(/\s+/g, '-')}`}>
                        {customer.store}
                      </span>
                    </td>
                    <td>
                      <span className={`customer-type ${customer.customerType}`}>
                        {customer.customerType}
                      </span>
                    </td>
                    <td>{customer.orders?.length || 0} orders</td>
                    <td>
                      <span className={`status ${customer.status}`}>
                        {customer.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="edit-btn"
                        onClick={() => openEditModal(customer)}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteCustomer(customer._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{selectedCustomer ? 'Edit Customer' : 'Add New Customer'}</h2>
            <form onSubmit={selectedCustomer ? handleEditCustomer : handleAddCustomer}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
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
                />
              </div>
              <div className="form-group">
                <label>Phone:</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Store:</label>
                <select
                  name="store"
                  value={formData.store}
                  onChange={handleInputChange}
                  required
                >
                  <option value="entrepreneur 1">Entrepreneur 1</option>
                  <option value="entrepreneur 3">Entrepreneur 3</option>
                  <option value="entrepreneur 2">Entrepreneur 2</option>
                </select>
              </div>
              <div className="form-group">
                <label>Customer Type:</label>
                <select
                  name="customerType"
                  value={formData.customerType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="buyer">Buyer</option>
                  <option value="vendor">Vendor</option>
                </select>
              </div>
              <div className="form-group">
                <label>Address:</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status:</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit">
                  {selectedCustomer ? 'Update Customer' : 'Add Customer'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedCustomer(null);
                    resetForm();
                  }}
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

export default CustomerManager;
