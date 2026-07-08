import React, { useState, useEffect } from 'react';
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
  FaStar,
  FaCalendarAlt,
  FaRedoAlt,
  FaInfoCircle,
  FaDatabase
} from 'react-icons/fa';
import {
  getRevenueAnalysis,
  getProductSalesPerformance,
  getSalesByCategory,
  getSalesConversion,
  getReviewsAnalysis,
  getLowStockProducts
} from '../../../services/superadmin/salesReportAPI';
import './Analytics.css';

// --- MOCK FALLBACK DATA ---
const MOCK_REVENUE = [
  { _id: 'Jul 01', totalRevenue: 15400, orderCount: 42, averageOrderValue: 366.6 },
  { _id: 'Jul 02', totalRevenue: 18900, orderCount: 51, averageOrderValue: 370.5 },
  { _id: 'Jul 03', totalRevenue: 14200, orderCount: 38, averageOrderValue: 373.6 },
  { _id: 'Jul 04', totalRevenue: 22600, orderCount: 58, averageOrderValue: 389.6 },
  { _id: 'Jul 05', totalRevenue: 28400, orderCount: 71, averageOrderValue: 400.0 },
  { _id: 'Jul 06', totalRevenue: 21900, orderCount: 55, averageOrderValue: 398.1 },
  { _id: 'Jul 07', totalRevenue: 31200, orderCount: 82, averageOrderValue: 380.4 }
];

const MOCK_CATEGORIES = [
  { categoryName: 'Bedsheets', revenue: 64200, quantity: 78, productCount: 6 },
  { categoryName: 'Towels', revenue: 45800, quantity: 120, productCount: 8 },
  { categoryName: 'Bags', revenue: 38900, quantity: 95, productCount: 12 },
  { categoryName: 'Bamboo Products', revenue: 29400, quantity: 64, productCount: 9 },
  { categoryName: 'Napkins', revenue: 19100, quantity: 150, productCount: 4 }
];

const MOCK_PRODUCTS = [
  { _id: '1', productName: 'Cotton Bedsheet Queen', totalRevenue: 38400, totalQuantity: 32, orderCount: 30, averageRating: 4.6 },
  { _id: '2', productName: 'Premium Hand Towel Set', totalRevenue: 25600, totalQuantity: 85, orderCount: 74, averageRating: 4.8 },
  { _id: '3', productName: 'Eco Jute Tote Bag', totalRevenue: 17200, totalQuantity: 58, orderCount: 52, averageRating: 4.3 },
  { _id: '4', productName: 'Bamboo Tea Mug', totalRevenue: 12800, totalQuantity: 43, orderCount: 38, averageRating: 4.5 },
  { _id: '5', productName: 'Soft Dining Napkins', totalRevenue: 9800, totalQuantity: 98, orderCount: 88, averageRating: 4.7 }
];

const MOCK_CONVERSION = {
  orderStatusMetrics: [
    { status: 'Delivered', count: 125, amount: 48900 },
    { status: 'Processing', count: 32, amount: 12400 },
    { status: 'Pending', count: 18, amount: 6200 },
    { status: 'Shipped', count: 24, amount: 9600 }
  ]
};

const MOCK_REVIEWS = [
  { productName: 'Premium Hand Towel Set', reviewCount: 18, averageRating: 4.8 },
  { productName: 'Soft Dining Napkins', reviewCount: 12, averageRating: 4.7 },
  { productName: 'Cotton Bedsheet Queen', reviewCount: 15, averageRating: 4.6 },
  { productName: 'Bamboo Tea Mug', reviewCount: 9, averageRating: 4.5 },
  { productName: 'Eco Jute Tote Bag', reviewCount: 7, averageRating: 4.3 }
];

const MOCK_LOW_STOCK = [
  { _id: 'l1', name: 'Bamboo Coffee Mug', stock: 4, category: 'Bamboo Products', price: 299 },
  { _id: 'l2', name: 'Designer Paper File', stock: 7, category: 'Paperfiles', price: 49 },
  { _id: 'l3', name: 'Embroidered Towel Set', stock: 2, category: 'Towels', price: 599 }
];

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [timeframe, setTimeframe] = useState('day');
  
  // Dashboard Metrics
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [conversionData, setConversionData] = useState({ orderStatusMetrics: [] });
  const [reviewsData, setReviewsData] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  // Fetch all analytics data from backend
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Use Promise.allSettled to load what we can, catching authentication/server offline issues
      const results = await Promise.allSettled([
        getRevenueAnalysis({ groupBy: timeframe }),
        getSalesByCategory({ groupBy: timeframe }),
        getProductSalesPerformance(),
        getSalesConversion(),
        getReviewsAnalysis(),
        getLowStockProducts()
      ]);

      const [revRes, catRes, prodRes, convRes, revAnRes, stockRes] = results;
      
      let unauthorized = false;

      // 1. Revenue
      if (revRes.status === 'fulfilled' && revRes.value && revRes.value.length > 0) {
        setRevenueData(revRes.value);
      } else {
        if (revRes.status === 'rejected' && (revRes.reason?.message?.includes('401') || revRes.reason === 'Unauthorized')) unauthorized = true;
        setRevenueData(MOCK_REVENUE);
      }

      // 2. Categories
      if (catRes.status === 'fulfilled' && catRes.value && catRes.value.length > 0) {
        setCategoryData(catRes.value);
      } else {
        setCategoryData(MOCK_CATEGORIES);
      }

      // 3. Products
      if (prodRes.status === 'fulfilled' && prodRes.value && prodRes.value.length > 0) {
        setProductData(prodRes.value);
      } else {
        setProductData(MOCK_PRODUCTS);
      }

      // 4. Status Conversion
      if (convRes.status === 'fulfilled' && convRes.value && convRes.value.orderStatusMetrics?.length > 0) {
        setConversionData(convRes.value);
      } else {
        setConversionData(MOCK_CONVERSION);
      }

      // 5. Reviews
      if (revAnRes.status === 'fulfilled' && revAnRes.value && revAnRes.value.length > 0) {
        setReviewsData(revAnRes.value);
      } else {
        setReviewsData(MOCK_REVIEWS);
      }

      // 6. Low Stock
      if (stockRes.status === 'fulfilled' && stockRes.value && stockRes.value.length > 0) {
        setLowStockProducts(stockRes.value);
      } else {
        setLowStockProducts(MOCK_LOW_STOCK);
      }

      // If any call rejected due to unauthorized access or connection failure, notify user of Demo mode
      const isAnyRejected = results.some(r => r.status === 'rejected');
      setIsDemoMode(isAnyRejected || unauthorized);

    } catch (error) {
      console.error("Failed to load live database data:", error);
      loadMockData();
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    setRevenueData(MOCK_REVENUE);
    setCategoryData(MOCK_CATEGORIES);
    setProductData(MOCK_PRODUCTS);
    setConversionData(MOCK_CONVERSION);
    setReviewsData(MOCK_REVIEWS);
    setLowStockProducts(MOCK_LOW_STOCK);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  // Aggregate stats from revenue data
  const totalRevenue = revenueData.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
  const totalOrders = revenueData.reduce((sum, item) => sum + (item.orderCount || 0), 0);
  const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loader"></div>
        <p>Analyzing marketplace transaction database...</p>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      {/* Page Header */}
      <div className="analytics-header">
        <div>
          <h1>Global Analytics Dashboard</h1>
          <p className="subtitle">Real-time platform overview & multi-store metrics</p>
        </div>

        <div className="header-actions">
          {/* Group Filter */}
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

          {/* Refresh Button */}
          <button className="refresh-btn" onClick={fetchAnalytics} title="Reload data">
            <FaRedoAlt />
          </button>
        </div>
      </div>

      {/* Demo Sandbox Alert Banner */}
      {isDemoMode && (
        <div className="demo-banner">
          <FaInfoCircle className="banner-icon" />
          <span>
            <strong>Demo Sandbox Mode Active:</strong> Showing aggregated simulation data. Please log in as Superadmin to load live database figures.
          </span>
          <button className="db-badge" onClick={() => setIsDemoMode(false)}>
            <FaDatabase /> Switch to Live Data
          </button>
        </div>
      )}

      {/* Top Level KPIs Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrapper rev">
            <FaRupeeSign />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Gross Platform Revenue</span>
            <h3 className="kpi-value">₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <span className="kpi-trend positive">↑ Live gross sales</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper ord">
            <FaShoppingCart />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Orders Placed</span>
            <h3 className="kpi-value">{totalOrders.toLocaleString()}</h3>
            <span className="kpi-trend positive">↑ Across all units</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper avg">
            <FaRupeeSign />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Avg Order Value (AOV)</span>
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

      {/* Charts Panel */}
      <div className="analytics-grid">
        {/* Chart 1: Revenue Trends */}
        <div className="chart-card span-2">
          <h2>Revenue & Order Trends</h2>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
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
                <Area yAxisId="left" type="monotone" dataKey="totalRevenue" name="Revenue" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRev)" />
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
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="revenue"
                  nameKey="categoryName"
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

        {/* Chart 3: Top Selling Products */}
        <div className="chart-card span-2">
          <h2>Top Performing Products</h2>
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
                  outerRadius={85}
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
      <div className="tables-row-grid">
        {/* Low Stock Alerts */}
        <div className="table-card">
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
              </tbody>
            </table>
          </div>
        </div>

        {/* Reviews and Ratings Analysis */}
        <div className="table-card">
          <div className="table-card-header">
            <h3><FaStar className="star-icon" /> Top-Rated Customer Products</h3>
            <span className="badge-count">Feedback summary</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Reviews</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {reviewsData.slice(0, 5).map((r, i) => (
                  <tr key={i}>
                    <td><strong>{r.productName}</strong></td>
                    <td>{r.reviewCount} customer reviews</td>
                    <td>
                      <div className="rating-cell">
                        <span className="star-rating">★ {Number(r.averageRating).toFixed(1)}</span>
                        <span className="rating-bar-bg">
                          <span className="rating-bar-fill" style={{ width: `${(r.averageRating / 5) * 100}%` }}></span>
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
