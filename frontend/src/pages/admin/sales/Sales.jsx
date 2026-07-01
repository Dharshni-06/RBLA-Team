// Architect: SP
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaDownload, FaCalendarAlt } from 'react-icons/fa';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { isAdminLoggedIn, getAdminStore } from '../../../services/adminAuthService';
import { getSalesOverview, getSalesReport } from '../../../services/admin/salesService';
import './Sales.css';

const Sales = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminStore, setAdminStore] = useState('');
  const [salesData, setSalesData] = useState({
    overview: {
      totalSales: 0,
      totalOrders: 0,
      totalProducts: 0,
      averageOrderValue: 0
    },
    categoryData: [],
    dailySales: []
  });
  const [detailedSales, setDetailedSales] = useState({
    sales: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    }
  });
  const [timeframe, setTimeframe] = useState('week');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        const isLoggedIn = await isAdminLoggedIn();
        if (!isLoggedIn) {
          navigate('/admin/login');
          return;
        }
        
        const store = getAdminStore();
        if (store) {
          setAdminStore(store);
          await fetchSalesData();
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setError('Authentication failed. Please log in again.');
        navigate('/admin/login');
      }
    };
    
    checkAuthAndFetchData();
  }, [navigate]);

  useEffect(() => {
    if (adminStore) {
      fetchSalesData();
    }
  }, [timeframe, adminStore]);

  useEffect(() => {
    if (adminStore) {
      fetchDetailedSales();
    }
  }, [currentPage, dateRange, adminStore]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const response = await getSalesOverview(timeframe);
      if (response.status === 'success' && response.data) {
        setSalesData(response.data);
      } else {
        setError('Error fetching sales data');
      }
    } catch (err) {
      setError('Error fetching sales data: ' + (err.message || 'Unknown error'));
      console.error('Sales data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailedSales = async () => {
    try {
      const response = await getSalesReport({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        page: currentPage,
        limit: 10
      });
      if (response.status === 'success' && response.data) {
        setDetailedSales(response.data);
      }
    } catch (err) {
      console.error('Error fetching detailed sales:', err);
    }
  };

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };

  const handleDateRangeChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Prepare data for sales trend chart
  const salesTrendData = {
    labels: salesData.dailySales.map(sale => new Date(sale.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Sales (₹)',
        data: salesData.dailySales.map(sale => sale.totalSales),
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        fill: true,
      },
      {
        label: 'Orders',
        data: salesData.dailySales.map(sale => sale.totalOrders),
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.2)',
        fill: true,
        yAxisID: 'y1',
      },
    ],
  };

  // Prepare data for category distribution chart
  const categoryChartData = {
    labels: salesData.categoryData.map(cat => cat._id),
    datasets: [
      {
        data: salesData.categoryData.map(cat => cat.totalSales),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
        ],
      },
    ],
  };

  // Chart options
  const salesTrendOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Sales (₹)',
        },
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        title: {
          display: true,
          text: 'Orders',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const categoryOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Sales by Category',
      },
    },
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading sales data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="sales-container">
      <div className="sales-header">
        <h1>Sales Analytics</h1>
        <p>Sales overview for {adminStore.charAt(0).toUpperCase() + adminStore.slice(1)} store</p>
      </div>

      <div className="stats-dashboard">
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <div className="stat-value">₹{salesData.overview.totalSales.toLocaleString()}</div>
          <div className="stat-subtitle">All time</div>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <div className="stat-value">{salesData.overview.totalOrders}</div>
          <div className="stat-subtitle">All time</div>
        </div>
        <div className="stat-card">
          <h3>Products Sold</h3>
          <div className="stat-value">{salesData.overview.totalProducts}</div>
          <div className="stat-subtitle">All time</div>
        </div>
        <div className="stat-card">
          <h3>Average Order Value</h3>
          <div className="stat-value">₹{salesData.overview.averageOrderValue.toLocaleString()}</div>
          <div className="stat-subtitle">Per order</div>
        </div>
      </div>

      <div className="filter-container">
        <div className="timeframe-filter">
          <button
            className={`filter-btn ${timeframe === 'today' ? 'active' : ''}`}
            onClick={() => handleTimeframeChange('today')}
          >
            Today
          </button>
          <button
            className={`filter-btn ${timeframe === 'week' ? 'active' : ''}`}
            onClick={() => handleTimeframeChange('week')}
          >
            This Week
          </button>
          <button
            className={`filter-btn ${timeframe === 'month' ? 'active' : ''}`}
            onClick={() => handleTimeframeChange('month')}
          >
            This Month
          </button>
          <button
            className={`filter-btn ${timeframe === 'year' ? 'active' : ''}`}
            onClick={() => handleTimeframeChange('year')}
          >
            This Year
          </button>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-card sales-trend">
          <h3>Sales Trend</h3>
          <Line data={salesTrendData} options={salesTrendOptions} />
        </div>
        <div className="chart-card category-distribution">
          <h3>Category Distribution</h3>
          <Doughnut data={categoryChartData} options={categoryOptions} />
        </div>
      </div>

      <div className="detailed-sales">
        <h3>Detailed Sales Report</h3>
        
        <div className="date-range-filter">
          <div className="date-input">
            <label>Start Date:</label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateRangeChange}
            />
          </div>
          <div className="date-input">
            <label>End Date:</label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateRangeChange}
            />
          </div>
        </div>

        {detailedSales.sales.length > 0 ? (
          <>
            <div className="sales-table-container">
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Products</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {detailedSales.sales.map((sale) => (
                    <tr key={sale.orderId}>
                      <td>{sale.orderId}</td>
                      <td>{new Date(sale.date).toLocaleDateString()}</td>
                      <td>{sale.customer}</td>
                      <td>
                        {sale.products.map((product, index) => (
                          <div key={index} className="product-item">
                            {product.name} x {product.quantity}
                          </div>
                        ))}
                      </td>
                      <td>₹{sale.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {detailedSales.pagination.pages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= detailedSales.pagination.pages}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="no-data">
            <p>No sales data found for the selected date range.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales;
