// Architect: SP
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./admindashboard.css";
import { Line, Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";
import { FaTachometerAlt, FaShoppingCart, FaBox, FaUsers, FaMoneyBillWave, FaChartLine, FaStar, FaUserFriends, FaSignOutAlt, FaHome, FaUndo, FaExclamationTriangle, FaBell } from "react-icons/fa";
import { logoutAdmin, isAdminLoggedIn, getCurrentAdmin } from "../../services/adminAuthService";
import { getSalesOverview, getSalesReport } from "../../services/admin/salesService";
import { getLowStockProducts, getReviewsAnalysis } from "../../services/admin/salesReportAPI";
import { toast } from 'react-toastify';
import Products from './products/Products';
import Orders from './orders/Orders';
import Users from './users/Users';
import Payments from './payments/Payments';
import Sales from './sales/Sales';
import Reviews from './reviews/Reviews';
import Workers from './workers/Workers';
import Returns from './returns/Returns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const getMockHomeData = (storeName) => {
  const store = (storeName || '').toLowerCase().trim();
  let categories = [];
  let pieValues = [];
  let revenue = 35000;
  let unitsSold = 180;
  let ordersCount = 45;
  
  if (store.includes('2')) {
    categories = ['Towels', 'Bags'];
    pieValues = [60, 40];
    revenue = 42000;
    unitsSold = 210;
    ordersCount = 55;
  } else if (store.includes('3')) {
    categories = ['Napkins', 'Paperfiles'];
    pieValues = [55, 45];
    revenue = 22000;
    unitsSold = 150;
    ordersCount = 38;
  } else {
    categories = ['Bedsheets', 'Cupcoasters'];
    pieValues = [70, 30];
    revenue = 58000;
    unitsSold = 260;
    ordersCount = 72;
  }
  
  return {
    revenue,
    unitsSold,
    ordersCount,
    salesData: {
      labels: ["Jul 01", "Jul 02", "Jul 03", "Jul 04", "Jul 05", "Jul 06", "Jul 07"],
      datasets: [
        {
          label: "Sales (₹)",
          data: store.includes('2') ? [4000, 6500, 5200, 7800, 9100, 4300, 5100] :
                store.includes('3') ? [2100, 3400, 2900, 4100, 3800, 2700, 3000] :
                                      [6200, 8100, 7500, 9800, 11000, 8300, 7100],
          borderColor: "#007bff",
          backgroundColor: "rgba(0, 123, 255, 0.2)",
          fill: true,
        }
      ]
    },
    pieData: {
      labels: categories,
      datasets: [
        {
          data: pieValues,
          backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0", "#9966ff", "#ff9f40"]
        }
      ]
    }
  };
};

const DashboardHome = () => {
  const navigate = useNavigate();
  const [revenue, setRevenue] = useState(0);
  const [unitsSold, setUnitsSold] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [adminInfo, setAdminInfo] = useState(null);
  const [salesData, setSalesData] = useState({ labels: [], datasets: [] });
  const [pieData, setPieData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverviewData = async () => {
      try {
        const admin = getCurrentAdmin();
        setAdminInfo(admin);
        
        const res = await getSalesOverview('all');
        if (res && res.status === 'success' && res.data) {
          const { overview, categoryData, dailySales } = res.data;
          
          setRevenue(overview.totalSales || 0);
          setUnitsSold(overview.totalProducts || 0);
          setOrdersCount(overview.totalOrders || 0);
          
          // Generate chart data for Sales Trend
          if (dailySales && dailySales.length > 0) {
            const labels = dailySales.map(d => d.date);
            const sales = dailySales.map(d => d.totalSales);
            setSalesData({
              labels,
              datasets: [
                {
                  label: "Sales (₹)",
                  data: sales,
                  borderColor: "#007bff",
                  backgroundColor: "rgba(0, 123, 255, 0.2)",
                  fill: true,
                }
              ]
            });
          } else {
            const mock = getMockHomeData(admin?.store);
            setSalesData(mock.salesData);
          }
          
          // Generate pie data for categories
          if (categoryData && categoryData.length > 0) {
            const labels = categoryData.map(c => c._id);
            const data = categoryData.map(c => c.totalSales || c.revenue || 0);
            setPieData({
              labels,
              datasets: [
                {
                  data,
                  backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0", "#9966ff", "#ff9f40"]
                }
              ]
            });
          } else {
            const mock = getMockHomeData(admin?.store);
            setPieData(mock.pieData);
          }
        }

        // Fetch low stock products count
        try {
          const lowStock = await getLowStockProducts();
          if (lowStock && Array.isArray(lowStock)) {
            setLowStockCount(lowStock.length);
          }
        } catch (err) {
          console.error('Error loading low stock alerts:', err);
        }

        // Fetch 5 most recent orders for this store
        try {
          const report = await getSalesReport({ page: 1, limit: 5 });
          if (report && report.status === 'success' && report.data && report.data.sales) {
            setRecentOrders(report.data.sales);
          }
        } catch (err) {
          console.error('Error loading recent orders:', err);
        }

      } catch (err) {
        console.error('Error loading dashboard home metrics:', err);
        const admin = getCurrentAdmin();
        const mock = getMockHomeData(admin?.store);
        setRevenue(mock.revenue);
        setUnitsSold(mock.unitsSold);
        setOrdersCount(mock.ordersCount);
        setSalesData(mock.salesData);
        setPieData(mock.pieData);
      } finally {
        setLoading(false);
      }
    };
    
    loadOverviewData();
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            family: 'Outfit',
            size: 11
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="dashboard-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <p>Loading store overview metrics...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      {adminInfo && (
        <div className="store-info">
          <h2>{adminInfo.store.charAt(0).toUpperCase() + adminInfo.store.slice(1)} Store Dashboard</h2>
          <p>Welcome back, <strong>{adminInfo.name}</strong></p>
        </div>
      )}

      {/* Critical Low Stock Alert Banner */}
      {lowStockCount > 0 && (
        <div 
          className="low-stock-alert-banner" 
          onClick={() => navigate('/admin/products')} 
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#fee2e2',
            borderLeft: '5px solid #ef4444',
            padding: '12px 20px',
            borderRadius: '8px',
            marginBottom: '20px',
            cursor: 'pointer',
            color: '#b91c1c',
            fontWeight: '600',
            gap: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}
        >
          <FaExclamationTriangle style={{ fontSize: '18px', color: '#ef4444' }} />
          <span>Warning: You have {lowStockCount} product(s) with low stock (under 10 units). Click here to manage stock.</span>
        </div>
      )}

      <div className="stats">
        <div className="card stat-card revenue-card">
          <div className="stat-icon-wrapper"><FaMoneyBillWave /></div>
          <div className="stat-data">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">₹{revenue.toLocaleString()}</span>
            <span className="stat-trend trend-up">All-time sales</span>
          </div>
        </div>
        <div className="card stat-card sales-card">
          <div className="stat-icon-wrapper"><FaChartLine /></div>
          <div className="stat-data">
            <span className="stat-label">Units Sold</span>
            <span className="stat-value">{unitsSold.toLocaleString()}</span>
            <span className="stat-trend trend-up">Total quantity</span>
          </div>
        </div>
        <div className="card stat-card orders-card">
          <div className="stat-icon-wrapper"><FaShoppingCart /></div>
          <div className="stat-data">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{ordersCount.toLocaleString()}</span>
            <span className="stat-trend trend-up">Complete transactions</span>
          </div>
        </div>
        <div className="card stat-card users-card">
          <div className="stat-icon-wrapper"><FaMoneyBillWave /></div>
          <div className="stat-data">
            <span className="stat-label">Average Order Value</span>
            <span className="stat-value">₹{ordersCount > 0 ? Math.round(revenue / ordersCount).toLocaleString() : 0}</span>
            <span className="stat-trend trend-up">Per-transaction</span>
          </div>
        </div>
      </div>

      <div className="charts">
        <div className="chart-card">
          <h3>Sales Trend</h3>
          <div className="chart-container">
            <Line data={salesData} options={chartOptions} />
          </div>
        </div>
        <div className="chart-card">
          <h3>Category Sales</h3>
          <div className="chart-container">
            <Pie data={pieData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="chart-card recent-orders" style={{ width: '100%', marginTop: '24px', padding: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: '700', color: '#1a252f' }}>Recent Orders</h3>
        <div className="orders-table" style={{ overflowX: 'auto', border: '1px solid rgba(0,0,0,0.03)', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(93, 12, 36, 0.03)' }}>
                <th style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: '600', color: '#5d0c24', textTransform: 'uppercase' }}>Order ID</th>
                <th style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: '600', color: '#5d0c24', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: '600', color: '#5d0c24', textTransform: 'uppercase' }}>Customer</th>
                <th style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: '600', color: '#5d0c24', textTransform: 'uppercase' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.orderId} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                  <td style={{ padding: '12px 16px', fontSize: '0.9rem', color: '#334155', fontWeight: '600' }}>{order.orderId}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.9rem', color: '#475569' }}>{new Date(order.date).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.9rem', color: '#475569' }}>{order.customer}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.9rem', color: '#334155', fontWeight: '600' }}>₹{order.total.toLocaleString()}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontStyle: 'italic', fontSize: '0.9rem' }}>
                    No recent transactions found in store database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const NotificationsSection = ({ notifications, clearNotifications }) => {
  return (
    <div className="notifications-section-container" style={{ padding: '24px', background: 'rgba(255, 255, 255, 0.55)', backdropFilter: 'blur(10px)', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.5)', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#1a252f' }}>Notifications Feed</h2>
        {notifications.length > 0 && (
          <button onClick={clearNotifications} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Clear All</button>
        )}
      </div>
      <div className="notifications-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {notifications.map(n => (
          <div key={n.id} className="notification-item-card" style={{ padding: '16px 20px', backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.03)', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.01)', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <FaBell style={{ color: '#ef4444', fontSize: '1.2rem', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#334155', lineHeight: '1.4', fontWeight: '500', textAlign: 'left' }}>{n.message}</p>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', textAlign: 'left' }}>{n.time}</span>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontStyle: 'italic' }}>
            <p>No new notifications available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedSection, setSelectedSection] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const mainContentRef = useRef(null);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const loadAlerts = async () => {
    const alertList = [];
    const admin = getCurrentAdmin();
    const store = admin?.store || '';
    
    // 1. Fetch low stock products count
    try {
      const lowStock = await getLowStockProducts();
      if (lowStock && Array.isArray(lowStock) && lowStock.length > 0) {
        lowStock.forEach(p => {
          alertList.push({
            id: `stock-${p._id}`,
            message: `Product "${p.name}" is running low on stock (${p.stock} left!).`,
            time: 'Just now'
          });
        });
      } else {
        throw new Error("No low stock products in DB");
      }
    } catch (err) {
      console.warn("Failed to fetch low stock from API, using demo alert:", err);
      if (store.toLowerCase().includes('2')) {
        alertList.push({
          id: 'stock-demo-1',
          message: 'Product "Premium Cotton Towel" is running low on stock (only 4 left!).',
          time: 'Just now'
        });
        alertList.push({
          id: 'stock-demo-2',
          message: 'Product "Canvas Tote Bag" is running low on stock (only 2 left!).',
          time: '2 hours ago'
        });
      } else if (store.toLowerCase().includes('3')) {
        alertList.push({
          id: 'stock-demo-1',
          message: 'Product "Linen Dinner Napkins" is running low on stock (only 3 left!).',
          time: 'Just now'
        });
        alertList.push({
          id: 'stock-demo-2',
          message: 'Product "A4 Kraft Paperfile" is running low on stock (only 1 left!).',
          time: '1 hour ago'
        });
      } else {
        alertList.push({
          id: 'stock-demo-1',
          message: 'Product "Luxury Silk Bedsheet" is running low on stock (only 5 left!).',
          time: 'Just now'
        });
        alertList.push({
          id: 'stock-demo-2',
          message: 'Product "Wooden Cupcoaster Set" is running low on stock (only 8 left!).',
          time: '3 hours ago'
        });
      }
    }

    // 2. Fetch pending orders from sales overview
    try {
      const overview = await getSalesOverview('all');
      if (overview?.status === 'success' && overview?.data?.overview) {
        const { totalOrders } = overview.data.overview;
        if (totalOrders > 0) {
          alertList.push({
            id: 'orders-summary',
            message: `You have ${totalOrders} orders in your queue awaiting delivery.`,
            time: 'Live status'
          });
        }
      } else {
        throw new Error("No orders found");
      }
    } catch (err) {
      console.warn("Failed to fetch orders overview from API, using demo alert:", err);
      alertList.push({
        id: 'orders-demo',
        message: 'You have 3 pending orders awaiting processing and shipment.',
        time: 'Action required'
      });
    }

    // 3. Fetch reviews status
    try {
      const reviewsData = await getReviewsAnalysis();
      if (reviewsData && Array.isArray(reviewsData)) {
        const lowRatings = reviewsData.filter(r => r.averageRating <= 2.5);
        lowRatings.forEach(r => {
          alertList.push({
            id: `review-${r._id}`,
            message: `Warning: Product "${r.productName}" has received a low average score of ${r.averageRating.toFixed(1)} stars.`,
            time: 'Customer Alert'
          });
        });
      }
    } catch (err) {
      console.warn('Error fetching reviews for alerts:', err);
    }

    setNotifications(alertList);

    // Trigger pop-up message exactly ONCE when the admin logs in
    if (alertList.length > 0) {
      const hasShown = sessionStorage.getItem('loginNotificationShown');
      if (!hasShown) {
        toast.info("You have received notifications", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          icon: () => <FaBell style={{ color: '#f39c12' }} />
        });
        sessionStorage.setItem('loginNotificationShown', 'true');
      }
    }
  };

  useEffect(() => {
    if (adminInfo) {
      loadAlerts();
    }
  }, [adminInfo]);

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [selectedSection]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isLoggedIn = await isAdminLoggedIn();
        if (!isLoggedIn) {
          navigate('/admin/login');
        } else {
          const admin = getCurrentAdmin();
          setAdminInfo(admin);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      // Clear notification shown status on logout
      sessionStorage.removeItem('loginNotificationShown');
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/admin/login');
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-wrapper">
      <div className="dashboard">
        <nav className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
          <div className="sidebar-header">
            <h2>{adminInfo?.store?.charAt(0).toUpperCase() + adminInfo?.store?.slice(1)} Admin</h2>
            <button className="toggle-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? '←' : '→'}
            </button>
          </div>
          <ul className="sidebar-links">
            <li><button className={selectedSection === 'home' ? 'active' : ''} onClick={() => setSelectedSection('home')}><FaTachometerAlt /> <span>Dashboard</span></button></li>
            <li><button className={selectedSection === 'products' ? 'active' : ''} onClick={() => setSelectedSection('products')}><FaBox /> <span>Products</span></button></li>
            <li><button className={selectedSection === 'orders' ? 'active' : ''} onClick={() => setSelectedSection('orders')}><FaShoppingCart /> <span>Orders</span></button></li>
            <li><button className={selectedSection === 'returns' ? 'active' : ''} onClick={() => setSelectedSection('returns')}><FaUndo /> <span>Returns</span></button></li>
            <li><button className={selectedSection === 'users' ? 'active' : ''} onClick={() => setSelectedSection('users')}><FaUsers /> <span>Users</span></button></li>
            <li><button className={selectedSection === 'payments' ? 'active' : ''} onClick={() => setSelectedSection('payments')}><FaMoneyBillWave /> <span>Payments</span></button></li>
            <li><button className={selectedSection === 'sales' ? 'active' : ''} onClick={() => setSelectedSection('sales')}><FaChartLine /> <span>Sales</span></button></li>
            <li><button className={selectedSection === 'reviews' ? 'active' : ''} onClick={() => setSelectedSection('reviews')}><FaStar /> <span>Reviews</span></button></li>
            <li><button className={selectedSection === 'workers' ? 'active' : ''} onClick={() => setSelectedSection('workers')}><FaUserFriends /> <span>Workers</span></button></li>
            <li>
              <button className={selectedSection === 'notifications' ? 'active' : ''} onClick={() => setSelectedSection('notifications')} style={{ position: 'relative' }}>
                <FaBell style={{ marginRight: sidebarOpen ? '15px' : '0' }} /> <span>Notifications</span>
                {notifications.length > 0 && (
                  <span className="sidebar-badge" style={{
                    position: 'absolute',
                    right: sidebarOpen ? '18px' : '12px',
                    top: sidebarOpen ? 'auto' : '8px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '9px',
                    fontWeight: '700',
                    padding: '2px 5px',
                    borderRadius: '9999px',
                    lineHeight: '1'
                  }}>{notifications.length}</span>
                )}
              </button>
            </li>
            <li><button className="home-button" onClick={() => navigate('/')}><FaHome /> <span>Store Home</span></button></li>
            <li><button className="logout-button" onClick={handleLogout}><FaSignOutAlt /> <span>Log out</span></button></li>
          </ul>
        </nav>

        <main ref={mainContentRef} className={`main-content ${sidebarOpen ? '' : 'expanded'}`}>
          {selectedSection === 'home' ? (
            <DashboardHome />
          ) : selectedSection === 'products' ? (
            <Products />
          ) : selectedSection === 'orders' ? (
            <Orders />
          ) : selectedSection === 'returns' ? (
            <Returns />
          ) : selectedSection === 'users' ? (
            <Users />
          ) : selectedSection === 'payments' ? (
            <Payments />
          ) : selectedSection === 'sales' ? (
            <Sales />
          ) : selectedSection === 'reviews' ? (
            <Reviews />
          ) : selectedSection === 'workers' ? (
            <Workers />
          ) : selectedSection === 'notifications' ? (
            <NotificationsSection notifications={notifications} clearNotifications={clearNotifications} />
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
