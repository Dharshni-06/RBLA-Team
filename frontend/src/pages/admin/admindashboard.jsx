// Architect: SP
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./admindashboard.css";
import { Line, Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";
import { FaTachometerAlt, FaShoppingCart, FaBox, FaUsers, FaMoneyBillWave, FaChartLine, FaStar, FaUserFriends, FaSignOutAlt, FaHome, FaUndo } from "react-icons/fa";
import { logoutAdmin, isAdminLoggedIn, getCurrentAdmin } from "../../services/adminAuthService";
import Products from './products/Products';
import Orders from './orders/Orders';
import Users from './users/Users';
import Payments from './payments/Payments';
import Sales from './sales/Sales';
import Reviews from './reviews/Reviews';
import Workers from './workers/Workers';
import Returns from './returns/Returns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const DashboardHome = () => {
  const [revenue, setRevenue] = useState(50000);
  const [monthlySales, setMonthlySales] = useState(1200);
  const [orders, setOrders] = useState(340);
  const [users, setUsers] = useState(1500);
  const [adminInfo, setAdminInfo] = useState(null);

  useEffect(() => {
    const admin = getCurrentAdmin();
    setAdminInfo(admin);
  }, []);

  const salesData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Sales",
        data: [50, 70, 80, 90, 100, 120, 150, 200, 180, 170, 190, 210],
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.2)",
        fill: true,
      },
    ],
  };

  const pieData = {
    labels: ["Bedsheets", "Cupcoasters", "Towels", "Bags", "Napkins", "Paperfiles", "Bamboo"],
    datasets: [
      {
        data: [25, 15, 20, 15, 10, 10, 5],
        backgroundColor: [
          "#ff6384",
          "#36a2eb",
          "#ffce56",
          "#4bc0c0",
          "#9966ff",
          "#ff9f40",
          "#c9cbcf"
        ],
      },
    ],
  };

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

  return (
    <div className="dashboard-content">
      {adminInfo && (
        <div className="store-info">
          <h2>{adminInfo.store.charAt(0).toUpperCase() + adminInfo.store.slice(1)} Store Dashboard</h2>
          <p>Welcome back, <strong>{adminInfo.name}</strong></p>
        </div>
      )}
      <div className="stats">
        <div className="card stat-card revenue-card">
          <div className="stat-icon-wrapper"><FaMoneyBillWave /></div>
          <div className="stat-data">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value">₹{revenue.toLocaleString()}</span>
            <span className="stat-trend trend-up">+12.5% vs last month</span>
          </div>
        </div>
        <div className="card stat-card sales-card">
          <div className="stat-icon-wrapper"><FaChartLine /></div>
          <div className="stat-data">
            <span className="stat-label">Monthly Sales</span>
            <span className="stat-value">{monthlySales}</span>
            <span className="stat-trend trend-up">+8.2% vs last month</span>
          </div>
        </div>
        <div className="card stat-card orders-card">
          <div className="stat-icon-wrapper"><FaShoppingCart /></div>
          <div className="stat-data">
            <span className="stat-label">Total Orders</span>
            <span className="stat-value">{orders}</span>
            <span className="stat-trend trend-down">-1.5% this week</span>
          </div>
        </div>
        <div className="card stat-card users-card">
          <div className="stat-icon-wrapper"><FaUsers /></div>
          <div className="stat-data">
            <span className="stat-label">Active Users</span>
            <span className="stat-value">{users}</span>
            <span className="stat-trend trend-up">+4.3% new signups</span>
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
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedSection, setSelectedSection] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState(null);
  const mainContentRef = useRef(null);

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
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
