// Architect: SP
const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats
} = require('../../controllers/superadmin/UserController');
const protectSuperadmin = require('../../middleware/superadminmiddleware');

// Base route: /api/superadmin/users

// Get all users with optional filtering and pagination
router.get('/', protectSuperadmin, getAllUsers);

// Get user statistics
router.get('/stats', protectSuperadmin, getUserStats);

// Get user by ID
router.get('/:id', protectSuperadmin, getUserById);

// Update user
router.put('/:id', protectSuperadmin, updateUser);

// Delete user
router.delete('/:id', protectSuperadmin, deleteUser);

module.exports = router;
