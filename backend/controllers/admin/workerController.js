// Architect: SP
const Worker = require('../../models/Worker');

// Get all workers for the admin's store
const getWorkers = async (req, res) => {
    try {
        console.log('getWorkers called');
        console.log('Admin object:', req.admin);
        const store = req.admin.storeName;
        console.log('Store name:', store);
        
        // Use case-insensitive matching for store name
        const workers = await Worker.find({ 
            store: new RegExp('^' + store + '$', 'i') 
        });
        console.log('Found workers:', workers);

        res.status(200).json({
            status: 'success',
            data: workers
        });
    } catch (error) {
        console.error('Error in getWorkers:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching workers'
        });
    }
};

// Add a new worker to the store
const addWorker = async (req, res) => {
    try {
        console.log('addWorker called');
        console.log('Request body:', req.body);
        const store = req.admin.storeName;
        console.log('Store name:', store);
        
        // Find existing worker to get correct store name capitalization
        const existingWorker = await Worker.findOne({ 
            store: new RegExp('^' + store + '$', 'i') 
        });
        
        const storeWithCorrectCase = existingWorker ? existingWorker.store : store.charAt(0).toUpperCase() + store.slice(1);
        
        const workerData = {
            ...req.body,
            store: storeWithCorrectCase
        };
        console.log('Worker data:', workerData);

        // Validate required fields
        const requiredFields = ['name', 'age', 'phoneNo', 'address', 'role', 'aadharNo'];
        const missingFields = requiredFields.filter(field => !workerData[field]);
        
        if (missingFields.length > 0) {
            console.log('Missing fields:', missingFields);
            return res.status(400).json({
                status: 'error',
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        const worker = new Worker(workerData);
        await worker.save();
        console.log('Worker saved:', worker);

        res.status(201).json({
            status: 'success',
            data: worker
        });
    } catch (error) {
        console.error('Error in addWorker:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error adding worker'
        });
    }
};

// Update worker details
const updateWorker = async (req, res) => {
    try {
        console.log('updateWorker called');
        console.log('Worker ID:', req.params.workerId);
        console.log('Update data:', req.body);
        
        const store = req.admin.storeName;
        const { workerId } = req.params;

        // Ensure worker belongs to admin's store (case-insensitive)
        const worker = await Worker.findOne({ 
            _id: workerId, 
            store: new RegExp('^' + store + '$', 'i') 
        });
        console.log('Found worker:', worker);
        
        if (!worker) {
            console.log('Worker not found');
            return res.status(404).json({
                status: 'error',
                message: 'Worker not found'
            });
        }

        // Update worker details (maintain original store name case)
        const updatedWorker = await Worker.findByIdAndUpdate(
            workerId,
            { ...req.body, store: worker.store },
            { new: true, runValidators: true }
        );
        console.log('Updated worker:', updatedWorker);

        res.status(200).json({
            status: 'success',
            data: updatedWorker
        });
    } catch (error) {
        console.error('Error in updateWorker:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error updating worker'
        });
    }
};

// Delete a worker
const deleteWorker = async (req, res) => {
    try {
        console.log('deleteWorker called');
        console.log('Worker ID:', req.params.workerId);
        
        const store = req.admin.storeName;
        const { workerId } = req.params;

        // Ensure worker belongs to admin's store (case-insensitive)
        const worker = await Worker.findOne({ 
            _id: workerId, 
            store: new RegExp('^' + store + '$', 'i') 
        });
        console.log('Found worker:', worker);
        
        if (!worker) {
            console.log('Worker not found');
            return res.status(404).json({
                status: 'error',
                message: 'Worker not found'
            });
        }

        await Worker.findByIdAndDelete(workerId);
        console.log('Worker deleted successfully');

        res.status(200).json({
            status: 'success',
            message: 'Worker deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteWorker:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error deleting worker'
        });
    }
};

// Get worker details
const getWorkerDetails = async (req, res) => {
    try {
        console.log('getWorkerDetails called');
        console.log('Worker ID:', req.params.workerId);
        
        const store = req.admin.storeName;
        const { workerId } = req.params;

        // Find worker with case-insensitive store name
        const worker = await Worker.findOne({ 
            _id: workerId, 
            store: new RegExp('^' + store + '$', 'i') 
        });
        console.log('Found worker:', worker);
        
        if (!worker) {
            console.log('Worker not found');
            return res.status(404).json({
                status: 'error',
                message: 'Worker not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: worker
        });
    } catch (error) {
        console.error('Error in getWorkerDetails:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching worker details'
        });
    }
};

module.exports = {
    getWorkers,
    addWorker,
    updateWorker,
    deleteWorker,
    getWorkerDetails
};
