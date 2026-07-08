import React, { useState, lazy, Suspense, useEffect, useRef } from 'react';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell } from 'recharts';
import { FaTachometerAlt, FaUndo, FaUsers, FaBox, FaUserShield, FaShoppingCart, FaCreditCard, FaComments, FaChartLine, FaSignOutAlt, FaUserFriends, FaHome, FaUserTie, FaBoxes, FaStar, FaChartBar, FaStore, FaBell } from "react-icons/fa";
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './superadmindashboard.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getUserStats } from '../../services/superadmin/userService';

const Workers = lazy(() => import('../../pages/superadmin/workers'));
const Admins = lazy(() => import('../../pages/superadmin/admins'));
const ProductList = lazy(() => import('../../pages/superadmin/products'));
const Orders = lazy(() => import('../../pages/superadmin/orders/Orders'));
const Payments = lazy(() => import('./payments/payments'));
const Reviews = lazy(() => import('./reviews/reviews'));
const SalesReport = lazy(() => import('./sales/SalesReports'));
const Users = lazy(() => import('./users'));
const Analytics = lazy(() => import('./analytics/Analytics'));
const Stores = lazy(() => import('./stores/Stores'));
const Returns = lazy(() => import('./returns/Returns'));

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const DashboardHome = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Last 7 days');
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([
    {
      date: '2025-03-22',
      title: 'Retake Stock Count',
      description: 'Complete inventory check and update stock records',
      type: 'inventory'
    },
    {
      date: '2025-03-25',
      title: 'Monthly Sales Review',
      description: 'Review sales performance and set targets',
      type: 'meeting'
    },
    {
      date: '2025-03-28',
      title: 'New Product Launch',
      description: 'Launch spring collection items',
      type: 'product'
    }
  ]);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    topProducts: [],
    salesByCategory: [],
    orderStatusStats: [],
    revenueByMonth: [],
    userStats: {
      verifiedUsers: 0,
      unverifiedUsers: 0,
      completedProfiles: 0,
      incompleteProfiles: 0,
      newUsers: 0,
      userGrowthByMonth: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('superadminToken');
        const headers = { Authorization: `Bearer ${token}` };
        
        console.log("Fetching dashboard data...");
        
        try {
          const userStatsRes = await getUserStats();
          console.log("User stats response:", userStatsRes);
        } catch (userStatsErr) {
          console.error("Error fetching user stats:", userStatsErr);
        }
        
        let ordersRes, usersRes, revenueRes, productsRes, userStatsRes;
        
        try {
          ordersRes = await axios.get(`${API_URL}/api/superadmin/orders?limit=5`, { headers });
          console.log("Orders response:", ordersRes.data);
        } catch (err) {
          console.error("Orders fetch error:", err);
          ordersRes = { data: { total: 0, orders: [], statusStats: [] } };
        }
        
        try {
          usersRes = await axios.get(`${API_URL}/api/superadmin/customers`, { headers });
          console.log("Users response:", usersRes.data);
        } catch (err) {
          console.error("Users fetch error:", err);
          usersRes = { data: { total: 0 } };
        }
        
        try {
          revenueRes = await axios.get(`${API_URL}/api/superadmin/sales/revenue`, { headers });
          console.log("Revenue response:", revenueRes.data);
        } catch (err) {
          console.error("Revenue fetch error:", err);
          revenueRes = { data: [] };
        }
        
        try {
          productsRes = await axios.get(`${API_URL}/api/superadmin/sales/products`, { headers });
          console.log("Products response:", productsRes.data);
        } catch (err) {
          console.error("Products fetch error:", err);
          productsRes = { data: [] };
        }
        
        try {
          userStatsRes = await getUserStats();
          console.log("User stats response:", userStatsRes);
        } catch (err) {
          console.error("User stats fetch error:", err);
          userStatsRes = { 
            totalUsers: 0, 
            verifiedUsers: 0, 
            unverifiedUsers: 0, 
            completedProfiles: 0, 
            incompleteProfiles: 0, 
            newUsers: 0, 
            userGrowthByMonth: [] 
          };
        }

        const sampleUserData = {
          totalUsers: 1250,
          verifiedUsers: 980,
          unverifiedUsers: 270,
          completedProfiles: 850,
          incompleteProfiles: 400,
          newUsers: 75,
          userGrowthByMonth: [
            { month: 'Jan', count: 45 },
            { month: 'Feb', count: 52 },
            { month: 'Mar', count: 75 },
            { month: 'Apr', count: 110 },
            { month: 'May', count: 120 },
            { month: 'Jun', count: 105 }
          ]
        };

        const userData = userStatsRes.totalUsers ? userStatsRes : sampleUserData;
        
        setDashboardData({
          totalUsers: userData.totalUsers || usersRes.data.total || 0,
          totalOrders: ordersRes.data.total || 0,
          totalRevenue: revenueRes.data.reduce ? revenueRes.data.reduce((sum, item) => sum + (item.totalRevenue || 0), 0) : 263649.23,
          recentOrders: ordersRes.data.orders || [],
          topProducts: productsRes.data || [],
          salesByCategory: Array.isArray(productsRes.data) ? productsRes.data.reduce((acc, product) => {
            const category = acc.find(c => c.name === product.category);
            if (category) {
              category.value += product.totalRevenue;
            } else {
              acc.push({ name: product.category || 'Uncategorized', value: product.totalRevenue || 0 });
            }
            return acc;
          }, []) : [],
          orderStatusStats: ordersRes.data.statusStats || [
            { status: 'Pending', count: 45 },
            { status: 'Processing', count: 32 },
            { status: 'Shipped', count: 18 },
            { status: 'Delivered', count: 65 }
          ],
          revenueByMonth: revenueRes.data || [],
          userStats: {
            verifiedUsers: userData.verifiedUsers || 0,
            unverifiedUsers: userData.unverifiedUsers || 0,
            completedProfiles: userData.completedProfiles || 0,
            incompleteProfiles: userData.incompleteProfiles || 0,
            newUsers: userData.newUsers || 0,
            userGrowthByMonth: userData.userGrowthByMonth || []
          }
        });
        setLoading(false);
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
        setError(err.message);
        setLoading(false);
        
        setDashboardData({
          totalUsers: 1250,
          totalOrders: 3568,
          totalRevenue: 263649.23,
          recentOrders: [],
          topProducts: [],
          salesByCategory: [],
          orderStatusStats: [
            { status: 'Pending', count: 45 },
            { status: 'Processing', count: 32 },
            { status: 'Shipped', count: 18 },
            { status: 'Delivered', count: 65 }
          ],
          revenueByMonth: [],
          userStats: {
            verifiedUsers: 980,
            unverifiedUsers: 270,
            completedProfiles: 850,
            incompleteProfiles: 400,
            newUsers: 75,
            userGrowthByMonth: [
              { month: 'Jan', count: 45 },
              { month: 'Feb', count: 52 },
              { month: 'Mar', count: 75 },
              { month: 'Apr', count: 110 },
              { month: 'May', count: 120 },
              { month: 'Jun', count: 105 }
            ]
          }
        });
      }
    };

    fetchDashboardData();
  }, [selectedPeriod]);

  if (loading) return <div className="loading">Loading dashboard data...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const getTileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      const eventForDate = events.find(event => event.date === dateStr);
      
      if (eventForDate) {
        return (
          <div className="calendar-event-indicator">
            <div className={`event-dot ${eventForDate.type}`} />
          </div>
        );
      }
    }
    return null;
  };

  const handleTileHover = (event, date) => {
    const dateStr = date.toISOString().split('T')[0];
    const eventForDate = events.find(e => e.date === dateStr);
    
    if (eventForDate) {
      const tileRect = event.currentTarget.getBoundingClientRect();
      const calendarRect = event.currentTarget.closest('.calendar-wrapper').getBoundingClientRect();
      
      setTooltipPosition({
        left: tileRect.right - calendarRect.left,
        top: tileRect.top - calendarRect.top + (tileRect.height / 2)
      });
      setHoveredDate(dateStr);
    } else {
      setHoveredDate(null);
    }
  };

  return (
    <div className="dashboard-home">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <div className="period-selector">
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
            <option>Last year</option>
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="stat-value">
            {dashboardData.totalUsers.toLocaleString()}
            <span className="trend positive">
              ↑ {dashboardData.userStats.newUsers} new users this month
            </span>
          </div>
          <div className="stat-chart">
            <ResponsiveContainer width="100%" height={60}>
              <AreaChart data={dashboardData.userStats.userGrowthByMonth || []}>
                <Area type="monotone" dataKey="count" stroke="#2196f3" fill="#2196f3" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="stat-card">
          <h3>Total Orders</h3>
          <div className="stat-value">
            {dashboardData.totalOrders.toLocaleString()}
            <span className="trend positive">↑ {((dashboardData.totalOrders / 10000) * 100).toFixed(1)}% increase</span>
          </div>
          <div className="stat-chart">
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={dashboardData.revenueByMonth.slice(-7)}>
                <Line type="monotone" dataKey="orderCount" stroke="#4caf50" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="stat-card">
          <h3>Total Revenue</h3>
          <div className="stat-value">
            ₹{dashboardData.totalRevenue.toLocaleString()}
            <span className={`trend ${dashboardData.totalRevenue > 1000000 ? 'positive' : 'negative'}`}>
              {dashboardData.totalRevenue > 1000000 ? '↑' : '↓'} {((dashboardData.totalRevenue / 1000000) * 100).toFixed(1)}% of target
            </span>
          </div>
          <div className="stat-chart">
            <ResponsiveContainer width="100%" height={60}>
              <AreaChart data={dashboardData.revenueByMonth.slice(-7)}>
                <Area type="monotone" dataKey="totalRevenue" stroke="#f44336" fill="#f44336" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="chart-card revenue-chart">
          <h3>Revenue Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dashboardData.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="totalRevenue" name="Revenue" stroke="#2196f3" fill="#2196f3" fillOpacity={0.2} />
              <Area type="monotone" dataKey="averageOrderValue" name="Avg Order Value" stroke="#4caf50" fill="#4caf50" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card user-stats-chart">
          <h3>User Statistics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: 'Verified', value: dashboardData.userStats.verifiedUsers },
              { name: 'Unverified', value: dashboardData.userStats.unverifiedUsers },
              { name: 'Complete Profile', value: dashboardData.userStats.completedProfiles },
              { name: 'Incomplete Profile', value: dashboardData.userStats.incompleteProfiles }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Users" fill="#9333ea">
                {[
                  <Cell key="verified" fill="#4caf50" />,
                  <Cell key="unverified" fill="#f44336" />,
                  <Cell key="complete" fill="#2196f3" />,
                  <Cell key="incomplete" fill="#ff9800" />
                ]}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card order-status-chart">
          <h3>Order Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dashboardData.orderStatusStats}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {dashboardData.orderStatusStats.map((entry, index) => (
                  <Cell key={index} fill={['#2196f3', '#4caf50', '#ff9800', '#f44336'][index % 4]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card top-products-chart">
          <h3>Top Products</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.topProducts.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="productName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalRevenue" name="Revenue" fill="#2196f3" />
              <Bar dataKey="quantity" name="Quantity" fill="#4caf50" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card user-growth-chart">
          <h3>User Growth Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.userStats.userGrowthByMonth || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" name="New Users" stroke="#9333ea" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card calendar-card">
          <h3>Calendar</h3>
          <div className="calendar-wrapper">
            <Calendar
              onChange={setDate}
              value={date}
              tileContent={getTileContent}
              onClickDay={(value, event) => handleTileHover(event, value)}
              onMouseOver={(value, event) => handleTileHover(event, value)}
              onMouseOut={() => setHoveredDate(null)}
              className="react-calendar"
            />
          </div>
          {hoveredDate && (
            <div 
              className="event-tooltip" 
              style={{ 
                left: `${tooltipPosition.left}px`,
                top: `${tooltipPosition.top}px`
              }}
            >
              {events
                .filter(event => event.date === hoveredDate)
                .map((event, index) => (
                  <div key={index} className="event-tooltip-content">
                    <div className={`event-type-indicator ${event.type}`} />
                    <div>
                      <h4>{event.title}</h4>
                      <p>{event.description}</p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="chart-card recent-orders">
          <h3>Recent Orders</h3>
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentOrders.map(order => (
                  <tr key={order._id}>
                    <td>{order.orderNumber}</td>
                    <td>{order.user.name}</td>
                    <td>₹{order.totalAmount.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${order.orderStatus.toLowerCase()}`}>
                        {order.orderStatus}
                      </span>
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

const NotificationsSection = ({ notifications, clearNotifications }) => {
  return (
    <div className="notifications-section-container" style={{ padding: '24px', background: '#ffffff', borderRadius: '12px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-color)', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>Notifications Feed</h2>
        {notifications.length > 0 && (
          <button onClick={clearNotifications} style={{ background: 'none', border: 'none', color: '#ff1744', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>Clear All</button>
        )}
      </div>
      <div className="notifications-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {notifications.map(n => (
          <div key={n.id} className="notification-item-card" style={{ padding: '16px 20px', backgroundColor: '#f8f9fa', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <FaBell style={{ color: '#ff1744', fontSize: '1.2rem', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.4', fontWeight: '500', textAlign: 'left' }}>{n.message}</p>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', textAlign: 'left' }}>{n.time}</span>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            <p>No new notifications available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const SuperAdminDashboard = () => {
  const [activeComponent, setActiveComponent] = useState('dashboard');
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const mainContentRef = useRef(null);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const loadAlerts = async () => {
    try {
      const alertList = [];
      const token = localStorage.getItem('superadminToken');
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch low stock products for all stores
      try {
        const response = await axios.get(`${API_URL}/api/superadmin/sales/low-stock-products`, { headers });
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          response.data.forEach(p => {
            alertList.push({
              id: `stock-${p._id}`,
              message: `[${p.category?.name || 'Low Stock'}] Product "${p.name}" in store "${p.store}" has only ${p.stock} units left.`,
              time: 'Just now'
            });
          });
        } else {
          // Fallback demo notifications for Superadmin if empty
          alertList.push({
            id: 'super-stock-demo-1',
            message: '[Towels] Product "Premium Cotton Towel" in store "e2" has only 4 units left.',
            time: 'Just now'
          });
          alertList.push({
            id: 'super-stock-demo-2',
            message: '[Bedsheets] Product "Luxury Silk Bedsheet" in store "e1" has only 5 units left.',
            time: '2 hours ago'
          });
          alertList.push({
            id: 'super-stock-demo-3',
            message: '[Paperfiles] Product "A4 Kraft Paperfile" in store "e3" has only 1 unit left.',
            time: '3 hours ago'
          });
        }
      } catch (err) {
        console.error('Error loading superadmin low stock alerts:', err);
        // Fallback demo notifications for Superadmin on error
        alertList.push({
          id: 'super-stock-demo-1',
          message: '[Towels] Product "Premium Cotton Towel" in store "e2" has only 4 units left.',
          time: 'Just now'
        });
      }

      // 2. Fetch pending orders count
      try {
        const ordersRes = await axios.get(`${API_URL}/api/superadmin/orders?limit=10`, { headers });
        if (ordersRes.data && ordersRes.data.orders) {
          const pendingOrdersCount = ordersRes.data.orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Processing').length;
          if (pendingOrdersCount > 0) {
            alertList.push({
              id: 'super-orders',
              message: `There are ${pendingOrdersCount} pending/processing orders across all stores.`,
              time: 'Action required'
            });
          } else {
            alertList.push({
              id: 'super-orders-demo',
              message: 'There are 5 pending customer orders awaiting store assignment and delivery.',
              time: 'Live status'
            });
          }
        } else {
          alertList.push({
            id: 'super-orders-demo',
            message: 'There are 5 pending customer orders awaiting store assignment and delivery.',
            time: 'Live status'
          });
        }
      } catch (err) {
        console.error('Error loading superadmin orders alerts:', err);
      }

      setNotifications(alertList);

      // Trigger pop-up message exactly ONCE when the superadmin logs in
      if (alertList.length > 0) {
        const hasShown = sessionStorage.getItem('superadminLoginNotificationShown');
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
          sessionStorage.setItem('superadminLoginNotificationShown', 'true');
        }
      }
    } catch (error) {
      console.error('Error loading superadmin notifications:', error);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [activeComponent]);

  const handleComponentChange = (component) => {
    setActiveComponent(component);
    
    const notificationMessages = {
      dashboard: 'Dashboard opened',
      admins: 'Admins Management opened',
      products: 'Products Management opened',
      orders: 'Orders Management opened',
      payments: 'Payments Management opened',
      reviews: 'Reviews Management opened',
      users: 'Users Management opened',
      workers: 'Workers Management opened',
      notifications: 'Notifications Feed opened',
      salesReport: 'Sales Report opened',
      analytics: 'Analytics opened',
      stores: 'Stores Management opened',
      returns: 'Returns Management opened'
    };
    
    if (notificationMessages[component]) {
      toast.info(notificationMessages[component], {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: getComponentIcon(component)
      });
    }
  };
  
  const getComponentIcon = (component) => {
    switch (component) {
      case 'dashboard':
        return () => <FaHome className="toast-custom-icon" />;
      case 'admins':
        return () => <FaUserTie className="toast-custom-icon" />;
      case 'products':
        return () => <FaBoxes className="toast-custom-icon" />;
      case 'orders':
        return () => <FaShoppingCart className="toast-custom-icon" />;
      case 'payments':
        return () => <FaCreditCard className="toast-custom-icon" />;
      case 'reviews':
        return () => <FaStar className="toast-custom-icon" />;
      case 'users':
        return () => <FaUsers className="toast-custom-icon" />;
      case 'workers':
        return () => <FaUserTie className="toast-custom-icon" />;
      case 'notifications':
        return () => <FaBell className="toast-custom-icon" />;
      case 'salesReport':
        return () => <FaChartLine className="toast-custom-icon" />;
      case 'analytics':
        return () => <FaChartBar className="toast-custom-icon" />;
      case 'stores':
        return () => <FaStore className="toast-custom-icon" />;
      case 'returns':
        return () => <FaUndo className="toast-custom-icon" />;
      default:
        return () => <FaHome className="toast-custom-icon" />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('superadminToken');
    sessionStorage.removeItem('superadminLoginNotificationShown');
    toast.info('Superadmin logged out successfully', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
    navigate('/superadmin/login');
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case 'dashboard':
        return <DashboardHome />;
      case 'workers':
        return <Workers />;
      case 'notifications':
        return <NotificationsSection notifications={notifications} clearNotifications={clearNotifications} />;
      case 'admins':
        return <Admins />;
      case 'products':
        return <ProductList />;
      case 'orders':
        return <Orders />;
      case 'payments':
        return <Payments />;
      case 'reviews':
        return <Reviews />;
      case 'salesReport':
        return <SalesReport />;
      case 'users':
        return <Users />;
      case 'analytics':
        return <Analytics />;
      case 'stores':
        return <Stores />;
      case 'returns':
        return <Returns />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="superadmin-dashboard-wrapper">
      <div className="dashboard">
        <div className="sidebar">
          <div className="sidebar-header">
            <h2>Super Admin</h2>
          </div>
          <nav className="sidebar-links">
            <button 
              className={activeComponent === 'dashboard' ? 'active' : ''} 
              onClick={() => handleComponentChange('dashboard')}
            >
              <FaHome /> Dashboard
            </button>
            <button 
              className={activeComponent === 'admins' ? 'active' : ''} 
              onClick={() => handleComponentChange('admins')}
            >
              <FaUserTie /> Admins
            </button>
            <button 
              className={activeComponent === 'products' ? 'active' : ''} 
              onClick={() => handleComponentChange('products')}
            >
              <FaBoxes /> Products
            </button>
            <button 
              className={activeComponent === 'orders' ? 'active' : ''} 
              onClick={() => handleComponentChange('orders')}
            >
              <FaShoppingCart /> Orders
            </button>
            <button 
              className={activeComponent === 'payments' ? 'active' : ''} 
              onClick={() => handleComponentChange('payments')}
            >
              <FaCreditCard /> Payments
            </button>
            <button 
              className={activeComponent === 'reviews' ? 'active' : ''} 
              onClick={() => handleComponentChange('reviews')}
            >
              <FaStar /> Reviews
            </button>
            <button 
              className={activeComponent === 'users' ? 'active' : ''} 
              onClick={() => handleComponentChange('users')}
            >
              <FaUsers /> Users
            </button>
            <button 
              className={activeComponent === 'workers' ? 'active' : ''} 
              onClick={() => handleComponentChange('workers')}
            >
              <FaUserTie /> Workers
            </button>
            <button 
              className={activeComponent === 'notifications' ? 'active' : ''} 
              onClick={() => handleComponentChange('notifications')}
              style={{ position: 'relative' }}
            >
              <FaBell /> Notifications
              {notifications.length > 0 && (
                <span className="sidebar-badge" style={{
                  position: 'absolute',
                  right: '24px',
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
            <button 
              className={activeComponent === 'salesReport' ? 'active' : ''} 
              onClick={() => handleComponentChange('salesReport')}
            >
              <FaChartLine /> Sales Report
            </button>
            <button 
              className={activeComponent === 'analytics' ? 'active' : ''} 
              onClick={() => handleComponentChange('analytics')}
            >
              <FaChartBar /> Analytics
            </button>
            <button 
              className={activeComponent === 'stores' ? 'active' : ''} 
              onClick={() => handleComponentChange('stores')}
            >
              <FaStore /> Stores
            </button>
            <button 
              className={activeComponent === 'returns' ? 'active' : ''} 
              onClick={() => handleComponentChange('returns')}
            >
              <FaUndo /> Returns
            </button>
            <button className="home-button" onClick={() => navigate('/')}>
              <FaStore /> Store Home
            </button>
            <button className="logout-button" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </nav>
        </div>
        <div ref={mainContentRef} className="main-content">
          <Suspense fallback={<div className="loading">Loading...</div>}>
            {renderComponent()}
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;