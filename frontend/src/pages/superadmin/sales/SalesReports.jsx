import React, { useState, useEffect } from 'react';
import {
  getRevenueAnalysis,
  getProductSalesPerformance,
  getSalesByCategory,
  getSalesConversion,
  getReviewsAnalysis,
  getLowStockProducts
} from '../../../services/superadmin/salesReportAPI';
import './SalesReports.css';

const SalesReports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    groupBy: 'day'
  });
  const [revenueData, setRevenueData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [reviewsData, setReviewsData] = useState([]);
  const [conversionData, setConversionData] = useState({
    orderStatusMetrics: [],
    salesByHour: []
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => {
    fetchAllReports();
  }, [filters]);

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      const [revenue, products, categories, conversion, reviews, lowStock] = await Promise.all([
        getRevenueAnalysis(filters),
        getProductSalesPerformance(filters),
        getSalesByCategory(filters),
        getSalesConversion(filters),
        getReviewsAnalysis(),
        getLowStockProducts()
      ]);

      setRevenueData(revenue);
      setProductData(products);
      setCategoryData(categories);
      setConversionData(conversion);
      setReviewsData(reviews);
      setLowStockProducts(lowStock);
      setError(null);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to fetch reports data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatHour = (hour) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:00 ${ampm}`;
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="sales-reports">
      <h2>Sales Reports</h2>
      
      {/* Filters */}
      <div className="filters">
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
        />
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
        />
        <select name="groupBy" value={filters.groupBy} onChange={handleFilterChange}>
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
          <option value="year">Yearly</option>
        </select>
      </div>

      <div className="reports-grid">
        {/* Inventory Alert - Low Stock Products */}
        <div className="report-card inventory-alert">
          <h3>Inventory Alert - Low Stock Products</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Current Stock</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.map((product) => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.stock}</td>
                  <td>{product.category}</td>
                  <td>{formatCurrency(product.price)}</td>
                  <td>
                    <span className={`status-badge ${product.stock === 0 ? 'out' : 'low'}`}>
                      {product.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                    </span>
                  </td>
                </tr>
              ))}
              {lowStockProducts.length === 0 && (
                <tr>
                  <td colSpan="5" className="no-data">No low stock products</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Orders Analysis */}
        <div className="report-card orders-analysis">
          <h3>Orders Analysis</h3>
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Orders</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {conversionData.orderStatusMetrics.map((status) => (
                <tr key={status.status}>
                  <td>
                    <span className={`status-${status.status}`}>
                      {status.status}
                    </span>
                  </td>
                  <td>{status.count}</td>
                  <td>{formatCurrency(status.amount)}</td>
                </tr>
              ))}
              {conversionData.orderStatusMetrics.length === 0 && (
                <tr>
                  <td colSpan="3" className="no-data">No order data available</td>
                </tr>
              )}
              <tr className="total-row">
                <td>Total</td>
                <td>{conversionData.orderStatusMetrics.reduce((sum, status) => sum + status.count, 0)}</td>
                <td>{formatCurrency(conversionData.orderStatusMetrics.reduce((sum, status) => sum + status.amount, 0))}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Reviews Analysis */}
        <div className="report-card reviews-analysis">
          <h3>Reviews Analysis</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Reviews</th>
                <th>Average Rating</th>
              </tr>
            </thead>
            <tbody>
              {reviewsData.length > 0 ? (
                reviewsData.map(item => (
                  <tr key={item._id}>
                    <td>{item.productName}</td>
                    <td>{item.reviewCount}</td>
                    <td>{item.averageRating.toFixed(1)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-data">No review data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Revenue Analysis */}
        <div className="report-card revenue-analysis">
          <h3>Revenue Analysis</h3>
          <table>
            <thead>
              <tr>
                <th>Period</th>
                <th>Revenue</th>
                <th>Orders</th>
                <th>Avg. Order Value</th>
              </tr>
            </thead>
            <tbody>
              {revenueData.map((period) => (
                <tr key={period._id}>
                  <td>{period._id}</td>
                  <td>{formatCurrency(period.totalRevenue)}</td>
                  <td>{period.orderCount}</td>
                  <td>{formatCurrency(period.averageOrderValue)}</td>
                </tr>
              ))}
              {revenueData.length === 0 && (
                <tr>
                  <td colSpan="4" className="no-data">No revenue data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Top Products */}
        <div className="report-card top-products">
          <h3>Top Products</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Revenue</th>
                <th>Quantity</th>
                <th>Orders</th>
              </tr>
            </thead>
            <tbody>
              {productData.length > 0 ? (
                productData.map(item => (
                  <tr key={item._id}>
                    <td>{item.productName}</td>
                    <td>{formatCurrency(item.totalRevenue)}</td>
                    <td>{item.totalQuantity}</td>
                    <td>{item.orderCount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-data">No product data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Category Performance */}
        <div className="report-card category-performance">
          <h3>Category Performance</h3>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Revenue</th>
                <th>Quantity</th>
                <th>Products</th>
              </tr>
            </thead>
            <tbody>
              {categoryData.length > 0 ? (
                categoryData.map(item => (
                  <tr key={item._id}>
                    <td>{item.categoryName}</td>
                    <td>{formatCurrency(item.revenue)}</td>
                    <td>{item.quantity}</td>
                    <td>{item.productCount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-data">No category data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Sales by Hour */}
        <div className="report-card sales-by-hour">
          <h3>Sales by Hour</h3>
          <table>
            <thead>
              <tr>
                <th>Hour</th>
                <th>Orders</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {conversionData.salesByHour.length > 0 ? (
                conversionData.salesByHour.map(item => (
                  <tr key={item._id}>
                    <td>{formatHour(item._id)}</td>
                    <td>{item.orderCount}</td>
                    <td>{formatCurrency(item.totalRevenue)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-data">No hourly sales data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesReports;
