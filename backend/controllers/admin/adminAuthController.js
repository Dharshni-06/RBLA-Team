// Architect: SP
const jwt = require('jsonwebtoken');
const Admin = require('../../models/admin');
require('dotenv').config();

exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Please provide both username and password' 
      });
    }

    // Find admin by username and include password field
    const admin = await Admin.findOne({ username }).select('+password');
    if (!admin) {
      return res.status(401).json({ 
        message: 'Invalid username or password' 
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(403).json({
        message: 'Your account has been deactivated. Please contact the superadmin.'
      });
    }

    // Verify password using the matchPassword method from admin model
    const isPasswordValid = await admin.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid username or password' 
      });
    }

    // Validate username format matches store
    const usernamePattern = new RegExp(`^[a-zA-Z0-9_]+@${admin.storeName}$`);
    if (!usernamePattern.test(username)) {
      return res.status(401).json({
        message: 'Invalid username format'
      });
    }

    // Generate JWT token with store information
    const token = jwt.sign(
      { 
        id: admin._id, 
        username: admin.username,
        store: admin.storeName,  // Include store in token
        name: admin.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Set token as httpOnly cookie (Session-only, expires on browser close)
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    // Send response with store information
    res.status(200).json({
      message: 'Login successful',
      admin: {
        id: admin._id,
        name: admin.name,
        username: admin.username,
        email: admin.email,
        store: admin.storeName,
        phoneNumber: admin.phoneNumber
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'An error occurred during login' 
    });
  }
};

exports.logoutAdmin = async (req, res) => {
  try {
    // Clear the admin token cookie
    res.clearCookie('adminToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Failed to logout. Please try again later.' });
  }
};

exports.verifySession = async (req, res) => {
  try {
    const token = req.cookies.adminToken;

    if (!token) {
      return res.status(401).json({ 
        message: 'No token found. Please login.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find admin and check if still active
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ 
        message: 'Admin not found' 
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        message: 'Your account has been deactivated. Please contact the superadmin.'
      });
    }

    // Validate store matches
    if (decoded.store !== admin.storeName) {
      return res.status(403).json({
        message: 'Store validation failed'
      });
    }

    // Send response with store information
    res.status(200).json({
      isValid: true,
      admin: {
        id: admin._id,
        name: admin.name,
        username: admin.username,
        email: admin.email,
        store: admin.storeName,
        phoneNumber: admin.phoneNumber
      }
    });

  } catch (error) {
    console.error('Session verification error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token. Please login again.' 
      });
    }
    res.status(500).json({ 
      message: 'An error occurred while verifying session' 
    });
  }
};
