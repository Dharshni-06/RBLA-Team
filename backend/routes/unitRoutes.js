// Architect: SP
const express = require('express');
const router = express.Router();
const unitController = require('../controllers/superadmin/unitController');

// Routes
router
    .route('/')
    .get(unitController.getAllUnits)
    .post(unitController.createUnit);

router
    .route('/:id')
    .get(unitController.getUnit)
    .patch(unitController.updateUnit)
    .delete(unitController.deleteUnit);

// Get unit statistics
router.get('/stats/overview', unitController.getUnitStats);

module.exports = router;
