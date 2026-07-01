// Architect: SP
const express = require('express');
const router = express.Router();
const productUnitController = require('../../controllers/admin/productUnitController');
const adminMiddleware = require('../../middleware/admin/adminMiddleware');

// All routes are protected by adminMiddleware
router.use(adminMiddleware);

// GET all product units
router.get('/', productUnitController.getAllUnits);

// POST create new product unit
router.post('/', productUnitController.createUnit);

module.exports = router;
