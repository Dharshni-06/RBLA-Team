import React, { lazy, Suspense, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { isLoggedIn } from './services/userapi/authservice';
import Chatbot from "./components/Chatbot/Chatbot";

import { UserProvider } from "./Context/UserContext";
import { CartProvider } from "./Context/CartContext";
import { WishlistProvider } from "./Context/WishlistContext";
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home';
import MyOrders from './pages/User/Orders/MyOrders/MyOrders';
import OrderDetails from './pages/User/Orders/OrderDetails/OrderDetails';
import OrderTracking from './pages/User/Orders/OrderTracking/OrderTracking';
import './App.css';


// Axios base URL
axios.defaults.baseURL = 'http://localhost:5000';

// Lazy-loaded pages
const UserLogin = lazy(() => import('./pages/UserLogin'));
const AdminLogin = lazy(() => import('./pages/admin/adminlogin'));
const AdminDashboard = lazy(() => import('./pages/admin/admindashboard'));
const EditProduct = lazy(() => import('./pages/admin/products/EditProduct'));
const ProductDetails = lazy(() => import('./pages/Product/ProductDetails/ProductDetails'));
const WishlistPage = lazy(() => import('./pages/User/Wishlist/WishlistPage'));
const ReviewPage = lazy(() => import('./pages/User/Reviews/ReviewPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const Careers = lazy(() => import('./pages/Careers'));
const Press = lazy(() => import('./pages/Press'));
const ReturnOrder = lazy(() => import('./pages/ReturnOrder'));
const ReportFraud = lazy(() => import('./pages/ReportFraud'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));

const ProductPages = {
  Towels: lazy(() => import('./pages/Towels')),
  Bags: lazy(() => import('./pages/Bags')),
  Napkins: lazy(() => import('./pages/Napkins')),
  Bedsheets: lazy(() => import('./pages/Bedsheets')),
  Cupcoaster: lazy(() => import('./pages/Cupcoaster')),
  Bamboo: lazy(() => import('./pages/Bamboo')),
  Paperfiles: lazy(() => import('./pages/Paperfiles')),
  CustProduct: lazy(() => import('./pages/custproduct')),
};

const workpage = {
  Block: lazy(() => import('./pages/block')),
  Tailoring: lazy(() => import('./pages/tailoring')),
  Handmade: lazy(() => import('./pages/handmade')),
  Whyvarnam: lazy(() => import('./pages/Whyentrepreneur1')),
  Bulkorders: lazy(() => import('./pages/bulkorders')),
};

const UserPages = {
  Wishlist: lazy(() => import('./pages/Wishlist')),
  LoginSignup: lazy(() => import('./pages/User/Auth/LoginSignup')),
  Profile: lazy(() => import('./pages/User/Profile/Profile')),
  Cart: lazy(() => import('./pages/User/Cart/Cart')),
  Checkout: lazy(() => import('./pages/User/Checkout/Checkout')),
  Payment: lazy(() => import('./pages/User/Checkout/PaymentPage')),
  PlaceOrder: lazy(() => import('./pages/User/Checkout/PlaceOrder'))
};

const SuperAdminPages = {
  Login: lazy(() => import('./pages/superadmin/superadminlogin')),
  Dashboard: lazy(() => import('./pages/superadmin/superadmindashboard')),
  Workers: lazy(() => import('./pages/superadmin/workers')),
  CustomerManager: lazy(() => import('./pages/superadmin/customermanager')),
  AdminRegistration: lazy(() => import('./pages/superadmin/adminregistration')),
};

const BrowseDesign = lazy(() => import('./pages/BrowseDesign'));

const CheckoutPages = {
  CustomDesignPage: lazy(() => import('./pages/CustomDesignPage')),
  UploadDesignAndCheckout: lazy(() => import('./pages/UploadDesignAndCheckout')),
};

const CustomizerPages = {
  TowelCustomizer: lazy(() => import('./pages/TowelCustomizer')),
  BagCustomizer: lazy(() => import('./pages/BagCustomizer')),
  PaperFileCustomizer: lazy(() => import('./pages/PaperFileCustomizer')),
  BedsheetCustomizer: lazy(() => import('./components/BedSheets/BedSheets')),
  CupCoasterCustomizer: lazy(() => import('./components/CupCoaster/CupCoaster')),
  NapkinCustomizer: lazy(() => import('./components/NapkinCustomize/NapkinCustomize')),
  BambooCustomizer: lazy(() => import('./pages/BambooCustomizer')),
};

const PaintApp = lazy(() => import('./PaintApp'));

const InfoPages = {
  AboutPage: lazy(() => import('./pages/AboutPage')),
  ContactUs: lazy(() => import('./pages/ContactUs')),
  Gallery: lazy(() => import('./pages/Gallery')),
  Entrepreneur2: lazy(() => import('./pages/entrepreneur2')),
  Entrepreneur1: lazy(() => import('./pages/entrepreneur1')),
  Entrepreneur3: lazy(() => import('./pages/entrepreneur3')),
};

const LoadingFallback = () => <div className="loading">Loading...</div>;

const MainLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const showBackButton = location.pathname !== '/';
  const hasBanner = [
    '/entrepreneur1',
    '/entrepreneur2',
    '/entrepreneur3',
    '/whyvarnam',
    '/block',
    '/tailoring',
    '/handmade'
  ].includes(location.pathname.toLowerCase());

  // Determine route-specific backgrounds to align back button container area background
  const getPageBgClass = () => {
    const path = location.pathname.toLowerCase();
    if (path === '/aboutpage') return 'bg-about-cream';
    if (path === '/contactus') return 'bg-contact-cream';
    if (path === '/wishlist') return 'bg-wishlist-gray';
    return '';
  };

  return (
    <div className="app-container">
      <Header />
      {showBackButton && (
        <div className="universal-back-btn-container animate-fade-in">
          <button className="universal-back-btn" onClick={() => navigate(-1)}>
            ← Go Back
          </button>
        </div>
      )}
      <main className={`main-content ${hasBanner ? 'with-banner' : 'without-banner'} ${getPageBgClass()}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

const StandalonePage = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const shouldHideBackButton = 
    location.pathname.includes('/login') || 
    location.pathname.includes('loginsignup') || 
    location.pathname === '/UserLogin' ||
    location.pathname.includes('/dashboard');

  return (
    <div className="standalone-page">
      {!shouldHideBackButton && (
        <div className="universal-back-btn-container admin-back-btn">
          <button className="universal-back-btn" onClick={() => navigate(-1)}>
            ← Go Back
          </button>
        </div>
      )}
      {children}
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/loginsignup" />;
  }
  return children;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  
const createRoutes = (components, pathPrefix = '') => {
  return Object.entries(components).map(([name, Component]) => (
    <Route
      key={`${pathPrefix}/${name.toLowerCase()}`}
      path={`${pathPrefix}/${name.toLowerCase()}`}
      element={<MainLayout><Component /></MainLayout>}
    />
  ));
};

  return (
    <UserProvider>
      <Router>
        <ScrollToTop />
        <CartProvider>
          <WishlistProvider>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Standalone Routes */}
                <Route path="/login" element={<Navigate to="/loginsignup" replace />} />
                <Route path="/loginsignup" element={<StandalonePage><UserPages.LoginSignup /></StandalonePage>} />
                <Route path="/UserLogin" element={<StandalonePage><UserLogin /></StandalonePage>} />
                <Route path="/admin/login" element={<StandalonePage><AdminLogin /></StandalonePage>} />
                <Route path="/superadmin/login" element={<StandalonePage><SuperAdminPages.Login /></StandalonePage>} />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<StandalonePage><AdminDashboard /></StandalonePage>} />
                <Route path="/admin/products/edit/:id" element={<StandalonePage><EditProduct /></StandalonePage>} />

                {/* Superadmin Routes */}
                <Route path="/superadmin/dashboard" element={<StandalonePage><SuperAdminPages.Dashboard /></StandalonePage>} />

                {/* Home */}
                <Route path="/" element={<MainLayout><Home /></MainLayout>} />

                {/* Protected Cart/Checkout */}
                <Route path="/cart" element={<ProtectedRoute><MainLayout><UserPages.Cart /></MainLayout></ProtectedRoute>} />
                <Route path="/checkout" element={<Navigate to="/cart" replace state={{ openCheckout: true }} />} />
                <Route path="/checkout/payment" element={<ProtectedRoute><MainLayout><UserPages.Payment /></MainLayout></ProtectedRoute>} />
                <Route path="/checkout/placeorder" element={<ProtectedRoute><MainLayout><UserPages.PlaceOrder /></MainLayout></ProtectedRoute>} />

                {/* Wishlist */}
                <Route path="/wishlist" element={<ProtectedRoute><MainLayout><WishlistPage /></MainLayout></ProtectedRoute>} />

                {/* Product Details */}
                <Route path="/product/:id" element={<MainLayout><ProductDetails /></MainLayout>} />

                {/* Orders */}
                <Route path="/orders" element={<ProtectedRoute><MainLayout><MyOrders /></MainLayout></ProtectedRoute>} />
                <Route path="/orders/:orderId" element={<ProtectedRoute><MainLayout><OrderDetails /></MainLayout></ProtectedRoute>} />
                <Route path="/order/:orderId" element={<ProtectedRoute><MainLayout><OrderDetails /></MainLayout></ProtectedRoute>} />
                <Route path="/orders/:orderId/track" element={<ProtectedRoute><MainLayout><OrderTracking /></MainLayout></ProtectedRoute>} />

                {/* Reviews */}
                <Route path="/review/:productId" element={<ProtectedRoute><MainLayout><ReviewPage /></MainLayout></ProtectedRoute>} />

                {/* AI Customizers */}
                <Route path="/towel-customizer" element={<ProtectedRoute><MainLayout><CustomizerPages.TowelCustomizer /></MainLayout></ProtectedRoute>} />
                <Route path="/bags-customizer" element={<ProtectedRoute><MainLayout><CustomizerPages.BagCustomizer /></MainLayout></ProtectedRoute>} />
                <Route path="/paperfiles-customizer" element={<ProtectedRoute><MainLayout><CustomizerPages.PaperFileCustomizer /></MainLayout></ProtectedRoute>} />
                <Route path="/bedsheet-customizer" element={<ProtectedRoute><MainLayout><CustomizerPages.BedsheetCustomizer /></MainLayout></ProtectedRoute>} />
                <Route path="/cupcoaster-customizer" element={<ProtectedRoute><MainLayout><CustomizerPages.CupCoasterCustomizer /></MainLayout></ProtectedRoute>} />
                <Route path="/napkin-customizer" element={<ProtectedRoute><MainLayout><CustomizerPages.NapkinCustomizer /></MainLayout></ProtectedRoute>} />
                <Route path="/bamboo-customizer" element={<ProtectedRoute><MainLayout><CustomizerPages.BambooCustomizer /></MainLayout></ProtectedRoute>} />
                <Route path="/paintapp" element={<MainLayout><PaintApp /></MainLayout>} />

                {/* Design & Upload Custom Routes */}
                <Route path="/browse-design" element={<MainLayout><BrowseDesign /></MainLayout>} />
                <Route path="/upload-design" element={<MainLayout><CheckoutPages.UploadDesignAndCheckout /></MainLayout>} />
                <Route path="/customdesignpage" element={<MainLayout><CheckoutPages.CustomDesignPage /></MainLayout>} />
                <Route path="/CustomDesignPage" element={<MainLayout><CheckoutPages.CustomDesignPage /></MainLayout>} />
                <Route path="/ProductPage" element={<MainLayout><ProductPage /></MainLayout>} />
                <Route path="/productpage" element={<MainLayout><ProductPage /></MainLayout>} />
                <Route path="/careers" element={<MainLayout><Careers /></MainLayout>} />
                <Route path="/Careers" element={<MainLayout><Careers /></MainLayout>} />
                <Route path="/press" element={<MainLayout><Press /></MainLayout>} />
                <Route path="/Press" element={<MainLayout><Press /></MainLayout>} />
                <Route path="/ReturnOrder" element={<MainLayout><ReturnOrder /></MainLayout>} />
                <Route path="/returnorder" element={<MainLayout><ReturnOrder /></MainLayout>} />
                <Route path="/Report Fraud" element={<MainLayout><ReportFraud /></MainLayout>} />
                <Route path="/reportfraud" element={<MainLayout><ReportFraud /></MainLayout>} />
                <Route path="/HelpCenter" element={<MainLayout><HelpCenter /></MainLayout>} />
                <Route path="/helpcenter" element={<MainLayout><HelpCenter /></MainLayout>} />

                {/* Generated Routes */}
                {createRoutes(UserPages, '')}
                {createRoutes(ProductPages, '')}
                {createRoutes(workpage, '')}
                {createRoutes(CheckoutPages, '')}
                {createRoutes(InfoPages, '')}

                {/* Superadmin extras */}
                <Route path="/superadmin/workers" element={<StandalonePage><SuperAdminPages.Workers /></StandalonePage>} />
                <Route path="/superadmin/customers" element={<StandalonePage><SuperAdminPages.CustomerManager /></StandalonePage>} />
                <Route path="/superadmin/admins" element={<StandalonePage><div>Admins Page</div></StandalonePage>} />
                <Route path="/superadmin/products" element={<StandalonePage><div>Products Page</div></StandalonePage>} />
                <Route path="/superadmin/units" element={<StandalonePage><div>Units Page</div></StandalonePage>} />
                <Route path="/superadmin/adminregistration" element={<StandalonePage><SuperAdminPages.AdminRegistration /></StandalonePage>} />
              </Routes>
            </Suspense>

            {/* Chatbot stays fixed on every page */}
            <Chatbot />
          </WishlistProvider>
        </CartProvider>
      </Router>
      <ToastContainer />
    </UserProvider>
  );
};

export default App;
