// Architect: SP
const express = require('express');
const { loginAdmin, logoutAdmin, verifySession } = require('../../controllers/admin/adminAuthController');
const adminMiddleware = require('../../middleware/admin/adminMiddleware');
const router = express.Router();

// Admin login route
router.post('/login', loginAdmin);

// Admin logout route (protected)
router.post('/logout', adminMiddleware, logoutAdmin);

// Verify admin session (protected)
router.get('/verify', adminMiddleware, verifySession);

module.exports = router;
