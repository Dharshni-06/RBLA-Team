// Architect: SP
const jwt = require('jsonwebtoken');
const Admin = require('../../models/admin');

const adminMiddleware = async (req, res, next) => {
    try {
        // Get token from cookie
        const token = req.cookies.adminToken;
        
        if (!token) {
            return res.status(401).json({ 
                status: 'error',
                message: 'Please log in to access this resource' 
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Check if admin exists and is active
            const admin = await Admin.findById(decoded.id).select('-password');
            if (!admin) {
                return res.status(401).json({ 
                    status: 'error',
                    message: 'The admin associated with this token no longer exists' 
                });
            }

            // Check if admin is active
            if (!admin.isActive) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Your account has been deactivated. Please contact the superadmin.'
                });
            }

            // Validate store information
            if (decoded.store !== admin.storeName) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Store validation failed. Please login again.'
                });
            }

            // Validate username format
            const usernamePattern = new RegExp(`^[a-zA-Z0-9_]+@${admin.storeName}$`);
            if (!usernamePattern.test(admin.username)) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Invalid username format detected. Please contact the superadmin.'
                });
            }

            // Add admin, token, and store info to request object
            req.admin = admin;
            req.token = token;
            req.store = admin.storeName; // Keep for backward compatibility
            req.adminStore = admin.storeName; // Add standardized property for consistency
            next();
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    status: 'error',
                    message: 'Your session has expired. Please log in again'
                });
            }
            if (err.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid token. Please log in again'
                });
            }
            throw err;
        }
    } catch (error) {
        console.error('Admin middleware error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Authentication failed. Please try again.'
        });
    }
};

module.exports = adminMiddleware;
