// Architect: SP
const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/admin/categoryController');
const adminMiddleware = require('../../middleware/admin/adminMiddleware');

// All routes are protected by adminMiddleware
router.use(adminMiddleware);

// GET all categories
router.get('/', categoryController.getAllCategories);

// POST create new category
router.post('/', categoryController.createCategory);

// DELETE category
router.delete('/:id', categoryController.deleteCategory);

// PUT update category
router.put('/:id', categoryController.updateCategory);

module.exports = router;
