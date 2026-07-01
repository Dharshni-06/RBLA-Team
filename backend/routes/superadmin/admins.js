// Architect: SP
const express = require('express');
const router = express.Router();
const {
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdmins
} = require('../../controllers/superadmin/AdminController');
const protectSuperadmin = require('../../middleware/superadminmiddleware'); // Assuming this middleware exists

// Base route: /api/superadmin/admins

// Create a new admin
router.post('/', protectSuperadmin, createAdmin);

// Update an admin by ID
router.put('/:id', protectSuperadmin, updateAdmin);

// Delete an admin by ID
router.delete('/:id', protectSuperadmin, deleteAdmin);

// Get all admins
router.get('/', protectSuperadmin, getAdmins);

module.exports = router;
