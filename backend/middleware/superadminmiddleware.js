// Architect: SP
const jwt = require('jsonwebtoken');
const Superadmin = require('../models/superadmin');
const AppError = require('../utils/appError');

const protectSuperadmin = async (req, res, next) => {
  try {
    // 1) Get token from header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('No token provided. Please log in.', 401));
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if superadmin exists
    const superadmin = await Superadmin.findById(decoded.superadminId); 
    if (!superadmin) {
      return next(new AppError('The superadmin associated with this token no longer exists.', 401));
    }

    // 4) Check if user is a superadmin
    if (!superadmin.isActive) { 
      return next(new AppError('Your account has been deactivated.', 403));
    }

    // 5) Attach superadmin to request object
    req.superadmin = superadmin;

    // 6) Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token has expired. Please log in again.', 401));
    }
    next(new AppError('Authentication failed.', 500));
  }
};

module.exports = protectSuperadmin;
