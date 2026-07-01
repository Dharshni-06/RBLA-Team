// Architect: SP
const jwt = require('jsonwebtoken');
const User = require('../../models/user/User');
require('dotenv').config();

// JWT secret key - should be in environment variables in production
const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            console.log('Auth Middleware: No token provided');
            return res.status(401).json({
                success: false,
                message: 'No authentication token, access denied'
            });
        }

        try {
            // Verify token using JWT_SECRET from env
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Auth Middleware: Token decoded:', { email: decoded.email });

            // Find user by email to get their ID
            const user = await User.findOne({ email: decoded.email });
            console.log('Auth Middleware: User found:', { userId: user?._id });

            if (!user) {
                console.log('Auth Middleware: User not found for email:', decoded.email);
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Add user data to request
            req.user = {
                _id: user._id,
                email: decoded.email
            };
            console.log('Auth Middleware: User set on request:', req.user);

            next();
        } catch (error) {
            console.error('Auth Middleware: Token verification error:', error);

            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired. Please login again.',
                    expired: true   // ✅ frontend can check this flag
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Token is not valid'
            });
        }
    } catch (error) {
        console.error('Auth Middleware: Server error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

module.exports = authMiddleware;
