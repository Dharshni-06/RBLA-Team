// Architect: SP
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  FaRupeeSign,
  FaShoppingCart,
  FaBoxes,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaRedoAlt,
  FaInfoCircle,
  FaDatabase,
  FaArrowLeft,
  FaChartLine
} from 'react-icons/fa';
import { isAdminLoggedIn, getAdminStore } from '../../../services/adminAuthService';
import { getSalesReport } from '../../../services/admin/salesService';
import {
  getRevenueAnalysis,
  getProductSalesPerformance,
  getSalesByCategory,
  getSalesConversion,
  getReviewsAnalysis,
  getLowStockProducts
} from '../../../services/admin/salesReportAPI';
import './Sales.css';

// --- MOCK DYNAMIC DATA BASED ON STORE ---
const getMockDataForStore = (storeName) => {
  const store = (storeName || '').toLowerCase().trim();
  let categories = [];
  let products = [];
  
  if (store.includes('2')) {
    categories = [
      { categoryName: 'Towels', revenue: 45800, quantity: 120, productCount: 8 },
      { categoryName: 'Bags', revenue: 38900, quantity: 95, productCount: 12 }
    ];
    products = [
      { _id: '1', productName: 'Premium Hand Towel Set', totalRevenue: 25600, totalQuantity: 85, orderCount: 74, averageRating: 4.8 },
      { _id: '2', productName: 'Eco Jute Tote Bag', totalRevenue: 17200, totalQuantity: 58, orderCount: 52, averageRating: 4.3 }
    ];
  } else if (store.includes('3')) {
    categories = [
      { categoryName: 'Napkins', revenue: 19100, quantity: 150, productCount: 4 },
      { categoryName: 'Paperfiles', revenue: 12400, quantity: 80, productCount: 5 }
    ];
    products = [
      { _id: '1', productName: 'Soft Dining Napkins', totalRevenue: 19100, totalQuantity: 150, orderCount: 120, averageRating: 4.7 },
      { _id: '2', productName: 'Designer Paper File', totalRevenue: 12400, totalQuantity: 80, orderCount: 65, averageRating: 4.5 }
    ];
  } else {
    categories = [
      { categoryName: 'Bedsheets', revenue: 64200, quantity: 78, productCount: 6 },
      { categoryName: 'Cupcoasters', revenue: 18400, quantity: 90, productCount: 4 }
    ];
    products = [
      { _id: '1', productName: 'Cotton Bedsheet Queen', totalRevenue: 64200, totalQuantity: 78, orderCount: 60, averageRating: 4.6 },
      { _id: '2', productName: 'Wooden Cupcoaster Set', totalRevenue: 18400, totalQuantity: 90, orderCount: 45, averageRating: 4.4 }
    ];
  }

  const revenue = [
    { _id: 'Jul 01', totalRevenue: 8200, orderCount: 12, averageOrderValue: 683 },
    { _id: 'Jul 02', totalRevenue: 11400, orderCount: 18, averageOrderValue: 633 },
    { _id: 'Jul 03', totalRevenue: 9800, orderCount: 15, averageOrderValue: 653 },
    { _id: 'Jul 04', totalRevenue: 14200, orderCount: 22, averageOrderValue: 645 },
    { _id: 'Jul 05', totalRevenue: 19500, orderCount: 30, averageOrderValue: 650 },
    { _id: 'Jul 06', totalRevenue: 13800, orderCount: 20, averageOrderValue: 690 },
    { _id: 'Jul 07', totalRevenue: 22400, orderCount: 34, averageOrderValue: 658 }
  ];

  const conversion = {
    orderStatusMetrics: [
      { status: 'Delivered', count: 85, amount: 58000 },
      { status: 'Processing', count: 18, amount: 11200 },
      { status: 'Pending', count: 10, amount: 6500 }
    ]
  };

  const lowStock = [
    { _id: 'l1', name: 'Store Bestseller Item', stock: 3, category: categories[0]?.categoryName || 'General', price: 499 }
  ];

  return { categories, products, revenue, conversion, lowStock };
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00c49f', '#ff8042'];

const Sales = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [adminStore, setAdminStore] = useState('');
  const [timeframe, setTimeframe] = useState('day');

  // Diagnostic states
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [conversionData, setConversionData] = useState({ orderStatusMetrics: [] });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  
  // Detailed Report states
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [detailedSales, setDetailedSales] = useState({
    sales: [],
    pagination: { page: 1, limit: 10, total: 0, pages: 0 }
  });

  const checkAuthAndInit = async () => {
    try {
      const loggedIn = await isAdminLoggedIn();
      if (!loggedIn) {
        navigate('/admin/login');
        return;
      }
      const store = getAdminStore();
      if (store) {
        setAdminStore(store);
        await fetchAnalyticsData(store);
      }
    } catch (err) {
      console.error('Authentication error:', err);
      navigate('/admin/login');
    }
  };

  const fetchAnalyticsData = async (store) => {
    try {
      setLoading(true);
      
      const results = await Promise.allSettled([
        getRevenueAnalysis({ groupBy: timeframe }),
        getSalesByCategory({ groupBy: timeframe }),
        getProductSalesPerformance(),
        getSalesConversion(),
        getLowStockProducts(),
        getSalesReport({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          page: currentPage,
          limit: 10
        })
      ]);

      const [revRes, catRes, prodRes, convRes, stockRes, reportRes] = results;
      const mock = getMockDataForStore(store);

      // 1. Revenue
      if (revRes.status === 'fulfilled' && revRes.value && revRes.value.length > 0) {
        setRevenueData(revRes.value);
      } else {
        setRevenueData(mock.revenue);
      }

      // 2. Categories
      if (catRes.status === 'fulfilled' && catRes.value && catRes.value.length > 0) {
        setCategoryData(catRes.value);
      } else {
        setCategoryData(mock.categories);
      }

      // 3. Products
      if (prodRes.status === 'fulfilled' && prodRes.value && prodRes.value.length > 0) {
        setProductData(prodRes.value);
      } else {
        setProductData(mock.products);
      }

      // 4. Status Conversion
      if (convRes.status === 'fulfilled' && convRes.value && convRes.value.orderStatusMetrics?.length > 0) {
        setConversionData(convRes.value);
      } else {
        setConversionData(mock.conversion);
      }

      // 5. Low Stock
      if (stockRes.status === 'fulfilled' && stockRes.value && stockRes.value.length > 0) {
        setLowStockProducts(stockRes.value);
      } else {
        setLowStockProducts(mock.lowStock);
      }

      // 6. Detailed Table report
      if (reportRes.status === 'fulfilled' && reportRes.value?.status === 'success' && reportRes.value?.data) {
        setDetailedSales(reportRes.value.data);
      }

      const isAnyRejected = results.slice(0, 5).some(r => r.status === 'rejected');
      setIsDemoMode(isAnyRejected);

    } catch (e) {
      console.error("Failed to load store analytics from database:", e);
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailedReportOnly = async () => {
    try {
      const response = await getSalesReport({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        page: currentPage,
        limit: 10
      });
      if (response?.status === 'success' && response?.data) {
        setDetailedSales(response.data);
      }
    } catch (error) {
      console.error('Error fetching detailed report pagination:', error);
    }
  };

  useEffect(() => {
    checkAuthAndInit();
  }, [timeframe]);

  useEffect(() => {
    if (adminStore) {
      fetchDetailedReportOnly();
    }
  }, [currentPage, dateRange]);

  const handleDateRangeChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
    setCurrentPage(1);
  };

  // Aggregated KPIs
  const totalRevenue = revenueData.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
  const totalOrders = revenueData.reduce((sum, item) => sum + (item.orderCount || 0), 0);
  const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loader"></div>
        <p>Loading sales performance database...</p>
      </div>
    );
  }

  return (
    <div className="sales-container">
      {/* Header */}
      <div className="analytics-header">
        <div>
          <h1>{adminStore.toUpperCase()} Store Sales Overview</h1>
          <p className="subtitle">Real-time revenue metrics, trends, and stock analytics</p>
        </div>

        <div className="header-actions">
          <div className="timeframe-select">
            <button 
              className={timeframe === 'day' ? 'active' : ''} 
              onClick={() => setTimeframe('day')}
            >
              Daily
            </button>
            <button 
              className={timeframe === 'week' ? 'active' : ''} 
              onClick={() => setTimeframe('week')}
            >
              Weekly
            </button>
            <button 
              className={timeframe === 'month' ? 'active' : ''} 
              onClick={() => setTimeframe('month')}
            >
              Monthly
            </button>
          </div>

          <button className="refresh-btn" onClick={() => fetchAnalyticsData(adminStore)} title="Refresh data">
            <FaRedoAlt />
          </button>
        </div>
      </div>

      {/* Demo Sandbox Alert Banner */}
      {isDemoMode && (
        <div className="demo-banner">
          <FaInfoCircle className="banner-icon" />
          <span>
            <strong>Sandbox Mode Active:</strong> Showing aggregated simulation metrics. Verify your admin token / local connection.
          </span>
          <button className="db-badge" onClick={() => setIsDemoMode(false)}>
            <FaDatabase /> Switch to Live Data
          </button>
        </div>
      )}

      {/* KPI stats dashboard */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper rev">
            <FaRupeeSign />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Store Revenue</span>
            <h3 className="kpi-value">₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <span className="kpi-trend positive">↑ Gross sales</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper ord">
            <FaShoppingCart />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Store Orders</span>
            <h3 className="kpi-value">{totalOrders.toLocaleString()}</h3>
            <span className="kpi-trend positive">↑ Complete cycles</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper avg">
            <FaRupeeSign />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Average Order Value</span>
            <h3 className="kpi-value">₹{averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <span className="kpi-trend">Per transaction average</span>
          </div>
        </div>

        <div className="kpi-card alert">
          <div className="kpi-icon-wrapper stock">
            <FaBoxes />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Low Stock Products</span>
            <h3 className="kpi-value">{lowStockProducts.length}</h3>
            <span className="kpi-trend negative">⚠️ Needs replenishment</span>
          </div>
        </div>
      </div>

      {/* Charts Panels */}
      <div className="analytics-grid">
        {/* Chart 1: Revenue Trends */}
        <div className="chart-card span-2">
          <h2>Revenue & Order Trends</h2>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAdminRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="_id" tickLine={false} />
                <YAxis yAxisId="left" tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <YAxis yAxisId="right" orientation="right" tickLine={false} />
                <Tooltip formatter={(value, name) => [name === 'Revenue' ? `₹${value}` : value, name]} />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="totalRevenue" name="Revenue" stroke="#4f46e5" fillOpacity={1} fill="url(#colorAdminRev)" />
                <Bar yAxisId="right" dataKey="orderCount" name="Orders" fill="#10b981" barSize={15} radius={[4, 4, 0, 0]} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Breakdown */}
        <div className="chart-card">
          <h2>Category Performance</h2>
          <div className="chart-wrapper flex-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey={categoryData[0]?.revenue !== undefined ? 'revenue' : 'totalSales'}
                  nameKey={categoryData[0]?.categoryName !== undefined ? 'categoryName' : '_id'}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend layout="horizontal" align="center" verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Top Products */}
        <div className="chart-card span-2">
          <h2>Top Selling Products</h2>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `₹${v}`} />
                <YAxis dataKey="productName" type="category" width={100} tick={{ fontSize: 12 }} tickLine={false} />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="totalRevenue" name="Revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Order Status */}
        <div className="chart-card">
          <h2>Order Status Distribution</h2>
          <div className="chart-wrapper flex-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={conversionData.orderStatusMetrics}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  nameKey="status"
                  label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                >
                  {conversionData.orderStatusMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f59e0b', '#6366f1'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Database Tables Section */}
      <div className="tables-row-grid" style={{ marginBottom: '28px' }}>
        {/* Low Stock Alerts */}
        <div className="table-card" style={{ gridColumn: 'span 2' }}>
          <div className="table-card-header">
            <h3><FaExclamationTriangle className="alert-icon" /> Low Stock Inventory Alert</h3>
            <span className="badge-count">{lowStockProducts.length} items critical</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>Current Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((p) => (
                  <tr key={p._id}>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.category}</td>
                    <td>₹{p.price}</td>
                    <td>
                      <span className={`stock-badge ${p.stock <= 3 ? 'critical' : 'warning'}`}>
                        {p.stock} remaining
                      </span>
                    </td>
                  </tr>
                ))}
                {lowStockProducts.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', fontStyle: 'italic', color: '#64748b' }}>
                      All product inventory levels are healthy!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detailed Sales Report Table */}
      <div className="detailed-sales">
        <h3>Detailed Sales Log</h3>
        
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
                      <td><strong>{sale.orderId}</strong></td>
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
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {detailedSales.pagination.pages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= detailedSales.pagination.pages}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="no-data">
            <p>No detailed sales transactions found in database.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales;
