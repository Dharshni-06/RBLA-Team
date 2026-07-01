// Architect: SP
const Worker = require('../../models/Worker');

// Get all workers with filtering and sorting
exports.getWorkers = async (req, res) => {
  try {
    const { store, role, sortBy, order, search } = req.query;
    const query = {};

    // Filter by store
    if (store) {
      query.store = store;
    }

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Search by name or phone
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phoneNo: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = order === 'desc' ? -1 : 1;
    } else {
      sortOptions.name = 1; // Default sort by name ascending
    }

    const workers = await Worker.find(query).sort(sortOptions);

    // Get store statistics
    const storeStats = await Worker.aggregate([
      {
        $group: {
          _id: '$store',
          count: { $sum: 1 },
          roles: { $addToSet: '$role' }
        }
      }
    ]);

    res.json({
      workers,
      stats: {
        total: workers.length,
        stores: storeStats
      }
    });
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({ message: 'Error fetching workers' });
  }
};

// Get worker by ID
exports.getWorkerById = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    res.json(worker);
  } catch (error) {
    console.error('Error fetching worker:', error);
    res.status(500).json({ message: 'Error fetching worker' });
  }
};

// Create a new worker
exports.createWorker = async (req, res) => {
  try {
    // Validate required fields
    const { name, age, phoneNo, address, role, store, aadharNo } = req.body;
    if (!name || !age || !phoneNo || !address || !role || !store || !aadharNo) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate phone number format (10 digits)
    if (!/^\d{10}$/.test(phoneNo)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    // Validate Aadhar number format (12 digits, can have spaces)
    const aadharNoClean = aadharNo.replace(/\s/g, '');
    if (!/^\d{12}$/.test(aadharNoClean)) {
      return res.status(400).json({ message: 'Invalid Aadhar number format' });
    }

    // Check for duplicate phone number
    const existingWorker = await Worker.findOne({ phoneNo });
    if (existingWorker) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    const newWorker = new Worker(req.body);
    const savedWorker = await newWorker.save();
    res.status(201).json(savedWorker);
  } catch (error) {
    console.error('Error creating worker:', error);
    res.status(500).json({ message: 'Error creating worker' });
  }
};

// Update an existing worker
exports.updateWorker = async (req, res) => {
  try {
    const { phoneNo, aadharNo } = req.body;

    // Validate phone number if provided
    if (phoneNo && !/^\d{10}$/.test(phoneNo)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    // Validate Aadhar number if provided
    if (aadharNo) {
      const aadharNoClean = aadharNo.replace(/\s/g, '');
      if (!/^\d{12}$/.test(aadharNoClean)) {
        return res.status(400).json({ message: 'Invalid Aadhar number format' });
      }
    }

    // Check for duplicate phone number, excluding current worker
    if (phoneNo) {
      const existingWorker = await Worker.findOne({
        phoneNo,
        _id: { $ne: req.params.id }
      });
      if (existingWorker) {
        return res.status(400).json({ message: 'Phone number already registered' });
      }
    }

    const updatedWorker = await Worker.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedWorker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    res.json(updatedWorker);
  } catch (error) {
    console.error('Error updating worker:', error);
    res.status(500).json({ message: 'Error updating worker' });
  }
};

// Delete a worker by ID
exports.deleteWorker = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    await Worker.deleteOne({ _id: req.params.id });
    res.json({ message: 'Worker deleted successfully' });
  } catch (error) {
    console.error('Error deleting worker:', error);
    res.status(500).json({ message: 'Error deleting worker' });
  }
};

// Get worker statistics
exports.getWorkerStats = async (req, res) => {
  try {
    const stats = await Worker.aggregate([
      {
        $group: {
          _id: '$store',
          totalWorkers: { $sum: 1 },
          roles: { $addToSet: '$role' },
          avgAge: { $avg: '$age' }
        }
      }
    ]);

    const roleStats = await Worker.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          stores: { $addToSet: '$store' }
        }
      }
    ]);

    res.json({
      storeStats: stats,
      roleStats
    });
  } catch (error) {
    console.error('Error fetching worker statistics:', error);
    res.status(500).json({ message: 'Error fetching worker statistics' });
  }
};
