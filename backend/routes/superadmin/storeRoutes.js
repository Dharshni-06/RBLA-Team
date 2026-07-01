// Architect: SP
const express = require('express');
const router = express.Router();
const storeController = require('../../controllers/superadmin/storeController');
const superadminMiddleware = require('../../middleware/superadminmiddleware');

// Apply authentication middleware
router.use(superadminMiddleware);

// Store routes
router.get('/', storeController.getAllStores);
router.post('/', storeController.createStore);
router.get('/:id', storeController.getStoreById);
router.put('/:id', storeController.updateStore);
router.delete('/:id', storeController.deleteStore);

module.exports = router;
