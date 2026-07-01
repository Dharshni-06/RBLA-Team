// Architect: SP
const jwt = require('jsonwebtoken');
const User = require('../../models/user/User');

const orderAuth = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                message: 'No authentication token found' 
            });
        }

        const token = authHeader.replace('Bearer ', '');

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database using email
        const user = await User.findOne({ 
            email: decoded.email,
            isVerified: true
        }).select('-password -otp -otpExpires'); // Exclude sensitive fields

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found or not verified'
            });
        }

        // Add user and token to request
        req.token = token;
        req.user = user;  // This will include user._id which is needed for order creation
        next();
    } catch (error) {
        console.log('Auth Error:', error.message);
        
        // Handle specific JWT errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid token' 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token expired' 
            });
        }

        res.status(401).json({ 
            success: false, 
            message: 'Please authenticate' 
        });
    }
};

module.exports = orderAuth;
