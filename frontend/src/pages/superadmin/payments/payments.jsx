import React, { useState, useEffect } from 'react';
import { getAllPayments, updatePaymentStatus } from '../../../services/superadmin/paymentAPI';
import './Payments.css';

const Payments = ({ onNavigate }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    fromDate: '',
    toDate: ''
  });

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await getAllPayments(filters);
      setPayments(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (paymentId, newStatus) => {
    try {
      await updatePaymentStatus(paymentId, newStatus);
      fetchPayments(); // Refresh payments after update
    } catch (err) {
      setError(err.message || 'Failed to update payment status');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <div className="loading">Loading payments...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="payments-container">
      <div className="payments-header">
        <h2>Payment Management</h2>
        <div className="filters">
          <select 
            name="status" 
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All Status</option>
            <option value="authorized">Authorized</option>
            <option value="settled">Settled</option>
            <option value="failed">Failed</option>
            <option value="voided">Voided</option>
          </select>
          <input
            type="date"
            name="fromDate"
            value={filters.fromDate}
            onChange={handleFilterChange}
            placeholder="From Date"
          />
          <input
            type="date"
            name="toDate"
            value={filters.toDate}
            onChange={handleFilterChange}
            placeholder="To Date"
          />
        </div>
      </div>

      <div className="payments-table">
        <table>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Order Number</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment Method</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment._id}>
                <td>{payment.transactionId}</td>
                <td>
                  <a 
                    href={`/superadmin/orders/${payment.order?._id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      if (onNavigate && payment.orderNumber) {
                        onNavigate('orders', { initialSearch: payment.orderNumber });
                      }
                    }}
                  >
                    {payment.orderNumber}
                  </a>
                </td>
                <td>{payment.user?.name || 'N/A'}</td>
                <td>₹{payment.amount?.toFixed(2)}</td>
                <td>
                  <select
                    value={payment.status}
                    onChange={(e) => handleStatusChange(payment._id, e.target.value)}
                    className={`status-${payment.status}`}
                  >
                    <option value="authorized">Authorized</option>
                    <option value="settled">Settled</option>
                    <option value="failed">Failed</option>
                    <option value="voided">Voided</option>
                  </select>
                </td>
                <td>{payment.paymentMethod}</td>
                <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => setSelectedPayment(payment)}>
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPayment && (
        <div className="payment-modal-overlay" onClick={() => setSelectedPayment(null)}>
          <div className="payment-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="payment-modal-header">
              <h3>Payment Details</h3>
              <button className="close-btn" onClick={() => setSelectedPayment(null)}>&times;</button>
            </div>
            <div className="payment-modal-body">
              <div className="detail-row">
                <strong>Transaction ID:</strong>
                <span>{selectedPayment.transactionId || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <strong>Order Number:</strong>
                <span>{selectedPayment.orderNumber}</span>
              </div>
              <div className="detail-row">
                <strong>Customer:</strong>
                <span>{selectedPayment.user?.name || 'N/A'} ({selectedPayment.user?.email || 'N/A'})</span>
              </div>
              <div className="detail-row">
                <strong>Amount:</strong>
                <span className="payment-modal-amount">₹{selectedPayment.amount?.toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <strong>Payment Method:</strong>
                <span>{selectedPayment.paymentMethod}</span>
              </div>
              <div className="detail-row">
                <strong>Date:</strong>
                <span>{new Date(selectedPayment.createdAt).toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <strong>Status:</strong>
                <span className={`status-badge status-${selectedPayment.status}`} style={{ textTransform: 'capitalize', display: 'inline-block', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>{selectedPayment.status}</span>
              </div>
              
              {selectedPayment.billingAddress && (
                <div className="billing-address-section">
                  <h4>Billing Address</h4>
                  <p><strong>{selectedPayment.billingAddress.name}</strong></p>
                  <p>{selectedPayment.billingAddress.address}</p>
                  <p>{selectedPayment.billingAddress.city}, {selectedPayment.billingAddress.postalCode}</p>
                  <p>{selectedPayment.billingAddress.country}</p>
                  {selectedPayment.billingAddress.phone && <p>Phone: {selectedPayment.billingAddress.phone}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
