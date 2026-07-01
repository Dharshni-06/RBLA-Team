// Architect: SP
const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/superadmin/categoryController');
const protectSuperadmin = require('../../middleware/superadminmiddleware');

// All routes are protected with superadmin middleware
router.use(protectSuperadmin);

// Get all categories
router.get('/', categoryController.getAllCategories);

// Create new category
router.post('/', categoryController.createCategory);

// Update category
router.put('/:id', categoryController.updateCategory);

// Delete category
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
