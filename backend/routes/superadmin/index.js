// Architect: SP
const express = require('express');
const router = express.Router();
const { createAdmin, updateAdmin, deleteAdmin, getAdmins } = require('../../controllers/superadmin/AdminController');
const orderRoutes = require('./orderRoutes');
const paymentRoutes = require('./paymentRoutes');
const reviewRoutes = require('./reviewRoutes');
const salesReportRoutes = require('./salesReportRoutes');

// Create a new admin
router.post('/create', createAdmin);

// Update an admin by id
router.put('/update/:id', updateAdmin);

// Delete an admin by id (soft delete)
router.delete('/delete/:id', deleteAdmin);

// Order routes
router.use('/orders', orderRoutes);

// Payment routes
router.use('/payments', paymentRoutes);

// Review routes
router.use('/reviews', reviewRoutes);

// Sales report routes
router.use('/sales', salesReportRoutes);

//router.get('/', getAdmins); 

module.exports = router;
