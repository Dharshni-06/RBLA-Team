// Architect: SP
const express = require('express');
const router = express.Router();
const workerController = require('../../controllers/superadmin/workercontroller');
const auth = require('../../middleware/superadminmiddleware');

// Apply superadmin auth middleware to all routes
router.use(auth);

// Get all workers with filters and stats
router.get('/', workerController.getWorkers);

// Get worker statistics
router.get('/stats', workerController.getWorkerStats);

// Get worker by ID
router.get('/:id', workerController.getWorkerById);

// Create new worker
router.post('/', workerController.createWorker);

// Update worker
router.put('/:id', workerController.updateWorker);

// Delete worker
router.delete('/:id', workerController.deleteWorker);

module.exports = router;
