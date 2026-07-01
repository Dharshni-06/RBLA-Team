// Architect: SP
const express = require('express');
const router = express.Router();
const {
    getWorkers,
    addWorker,
    updateWorker,
    deleteWorker,
    getWorkerDetails
} = require('../../controllers/admin/workerController');
const adminMiddleware = require('../../middleware/admin/adminMiddleware');

// Apply middleware to all routes
router.use(adminMiddleware);

// Routes
router.get('/', getWorkers);
router.post('/', addWorker);
router.get('/:workerId', getWorkerDetails);
router.put('/:workerId', updateWorker);
router.delete('/:workerId', deleteWorker);

module.exports = router;
