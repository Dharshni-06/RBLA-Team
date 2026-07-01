// Architect: SP
const jwt = require('jsonwebtoken');
const SuperAdmin = require('../../models/superadmin');
require('dotenv').config();

const loginSuperadmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Please provide both username and password' 
      });
    }

    // Find superadmin by username
    const superadmin = await SuperAdmin.findOne({ username }).select('+password');
    if (!superadmin) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Check if account is active
    if (!superadmin.isActive) {
      return res.status(403).json({ 
        message: 'Your account has been deactivated' 
      });
    }

    // Verify password
    const isPasswordValid = await superadmin.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { superadminId: superadmin._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // Token expires in 1 day
    );

    // Send response
    res.status(200).json({
      message: 'Login successful',
      token,
      superadmin: {
        id: superadmin._id,
        username: superadmin.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'An error occurred during login' 
    });
  }
};

module.exports = {
  loginSuperadmin,
};
