// Architect: SP
const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../../controllers/user/profileController');
const authMiddleware = require('../../middleware/user/auth');

// All routes in this file are protected with auth middleware
router.use(authMiddleware);

// Get user profile
router.get('/', getProfile);

// Update user profile
router.put('/', updateProfile);

module.exports = router;
