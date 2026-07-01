// Architect: SP
const express = require('express');
const chalk = require('chalk');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const multer = require('multer');
const connectDB = require('./utils/database/mongoConfig');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Print welcome message
console.log(chalk.cyan('\n🚀 Initializing RBLA5 Backend Server...'));

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ======================= ROUTES IMPORT =======================
const productRoutes = require('./routes/productRoutes');
const superadminRoutes = require('./routes/superadmin');
const superadminAuthRoutes = require('./routes/superadminauthroutes');
const superadminProductRoutes = require('./routes/superadmin/productRoutes');
const superadminCategoryRoutes = require('./routes/superadmin/categoryRoutes');
const superadminUploadRoutes = require('./routes/superadmin/uploadRoutes');
const superadminOrderRoutes = require('./routes/superadmin/orderRoutes');
const superadminPaymentRoutes = require('./routes/superadmin/paymentRoutes');
const superadminReviewRoutes = require('./routes/superadmin/reviewRoutes');
const superadminSalesReportRoutes = require('./routes/superadmin/salesReportRoutes');
const superadminWorkerRoutes = require('./routes/superadmin/workerRoutes');
const superadminUserRoutes = require('./routes/superadmin/users');
const superadminStoreRoutes = require('./routes/superadmin/storeRoutes');
// const unitRoutes = require('./routes/unitRoutes');
const customerRoutes = require('./routes/superadmin/customerRoutes');
const adminRoutes = require('./routes/superadmin/admins');
const adminAuthRoutes = require('./routes/admin/adminAuthRoutes');
const adminProductRoutes = require('./routes/admin/productRoutes');
const adminCategoryRoutes = require('./routes/admin/categoryRoutes');
const adminUploadRoutes = require('./routes/admin/uploadRoutes');
const adminOrderRoutes = require('./routes/admin/orderRoutes');
const adminPaymentRoutes = require('./routes/admin/paymentRoutes');
const adminReviewRoutes = require('./routes/admin/reviewRoutes');
const adminUserRoutes = require('./routes/admin/userRoutes');
const adminSalesRoutes = require('./routes/admin/salesRoutes');
const adminWorkerRoutes = require('./routes/admin/workerRoutes');

const publicProductRoutes = require('./routes/public/productRoutes');
const publicGeneralRoutes = require('./routes/public/generalRoutes');
const publicRoutes = require('./routes/public/index');
const userAuthRoutes = require('./routes/user/auth');
const userProfileRoutes = require('./routes/user/profileRoutes');
const userCartRoutes = require('./routes/user/cartRoutes');
const userWishlistRoutes = require('./routes/user/wishlistRoutes');
const userOrderRoutes = require('./routes/user/orderRoutes');
const userBraintreeRoutes = require('./routes/user/braintreeRoutes');
const userReviewRoutes = require('./routes/user/reviewRoutes');

// AI Customizer routes
const aiRoutes = require('./routes/aiRoutes');
const proxyRoutes = require('./routes/proxyRoutes');
const designRoutes = require('./routes/designRoutes');
const pollinationsProxy = require('./routes/pollinationsProxy');

// ======================= ROUTE MOUNTS =======================
app.get('/', (req, res) => {
  res.send('Welcome to the NGO Products API!');
});

// API Routes
app.use('/api/products', productRoutes);

// superadmin api 
app.use('/api/superadmin', superadminRoutes);
app.use('/api/superadmin/auth', superadminAuthRoutes);
app.use('/api/superadmin/products', superadminProductRoutes);
app.use('/api/superadmin/categories', superadminCategoryRoutes);
app.use('/api/superadmin/upload', superadminUploadRoutes);
app.use('/api/superadmin/orders', superadminOrderRoutes);
app.use('/api/superadmin/payments', superadminPaymentRoutes);
app.use('/api/superadmin/reviews', superadminReviewRoutes);
app.use('/api/superadmin/sales', superadminSalesReportRoutes);
app.use('/api/superadmin/workers', superadminWorkerRoutes);
app.use('/api/superadmin/users', superadminUserRoutes);
app.use('/api/superadmin/stores', superadminStoreRoutes);
app.use('/api/superadmin/customers', customerRoutes);
app.use('/api/superadmin/admins', adminRoutes);

// admin api routes 
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/admin/upload', adminUploadRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/admin/payments', adminPaymentRoutes);
app.use('/api/admin/reviews', adminReviewRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/sales', adminSalesRoutes);
app.use('/api/admin/workers', adminWorkerRoutes);

// public api routes 
app.use('/api/public/products', publicProductRoutes);
app.use('/api/public/general', publicGeneralRoutes);
app.use('/api/public', publicRoutes);

// user api routes 
app.use('/api/user/auth', userAuthRoutes);
app.use('/api/user/profile', userProfileRoutes);
app.use('/api/user/cart', userCartRoutes);
app.use('/api/user/wishlist', userWishlistRoutes);
app.use('/api/user/orders', userOrderRoutes);
app.use('/api/user/braintree', userBraintreeRoutes);
app.use('/api/user/reviews', userReviewRoutes);

// AI Customizer routes
app.use('/ai', aiRoutes);
app.use('/api', proxyRoutes);
app.use('/', designRoutes);
app.use('/api/ai', pollinationsProxy);

// ======================= AI CHATBOT ENDPOINT =======================
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/chatbot", async (req, res) => {
  try {
    const { message } = req.body;
    const keywords = ["entrepreneur 1", "entrepreneur 2", "entrepreneur 3"];
    const isRelevant = keywords.some(k => message.toLowerCase().includes(k));

    if (!isRelevant) {
      return res.json({
        reply: "I can only answer questions about Entrepreneur 1, Entrepreneur 2, and Entrepreneur 3 products."
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant that only answers questions about Entrepreneur 1, Entrepreneur 2, and Entrepreneur 3 product units." },
        { role: "user", content: message }
      ]
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Chatbot failed to respond" });
  }
});

// ======================= GLOBAL ERROR HANDLER =======================
app.use((err, req, res, next) => {
  console.error(chalk.red('❌ Error:'), err);
  
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({ status: 'error', message: errors.join(', ') });
  }

  if (err.code === 11000) {
    return res.status(400).json({ status: 'error', message: 'Duplicate field value entered' });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ status: 'error', message: 'Invalid token. Please log in again.' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ status: 'error', message: 'Your token has expired. Please log in again.' });
  }

  res.status(err.status || 500).json({ status: 'error', message: err.message || 'Internal server error' });
});

// ======================= SERVER START =======================
async function startServer() {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      const serverArt = `
    🌟 ${chalk.green('✓')} RBLA5 Server Started Successfully ${chalk.green('✓')} 🌟
    ===============================================
    ${chalk.cyan('🌐 Environment:')} ${chalk.yellow(process.env.NODE_ENV || 'development')}
    ${chalk.cyan('🚪 Port:')} ${chalk.green(PORT)}
    ${chalk.cyan('🔗 URL:')} ${chalk.green(`http://localhost:${PORT}`)}
    ${chalk.cyan('📡 Status:')} ${chalk.green('Online ✓')}
    ===============================================
      `;
      console.log(serverArt);
      console.log(chalk.green('✨ Server initialization complete!'));
      console.log(chalk.yellow('💡 Ready to handle requests\n'));
    });
  } catch (error) {
    console.error(chalk.red('\n❌ Failed to start server:'), error);
    process.exit(1);
  }
}

startServer();
