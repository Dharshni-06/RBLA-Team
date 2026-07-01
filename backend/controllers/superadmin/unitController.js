// Architect: SP
const Unit = require('../../models/Unit');
const { catchAsync } = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const mongoose = require('mongoose');

// Get all units
exports.getAllUnits = catchAsync(async (req, res) => {
    const units = await Unit.find()
        .populate('currentWorkers')
        .sort('-createdAt');
    
    res.status(200).json({
        status: 'success',
        results: units.length,
        data: units
    });
});

// Get single unit
exports.getUnit = catchAsync(async (req, res, next) => {
    const unit = await Unit.findById(req.params.id).populate('currentWorkers');
    
    if (!unit) {
        return next(new AppError('No unit found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: unit
    });
});

// Create new unit
exports.createUnit = catchAsync(async (req, res, next) => {
    // Validate required fields
    const requiredFields = ['unitName', 'adminName', 'location', 'address', 'workerCapacity', 'email', 'phoneNo'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
        return next(new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400));
    }

    // Convert workerCapacity to number
    if (req.body.workerCapacity) {
        req.body.workerCapacity = Number(req.body.workerCapacity);
        if (isNaN(req.body.workerCapacity)) {
            return next(new AppError('Worker capacity must be a valid number', 400));
        }
    }

    // Create the unit
    const newUnit = await Unit.create(req.body);

    res.status(201).json({
        status: 'success',
        data: newUnit
    });
});

// Update unit
exports.updateUnit = catchAsync(async (req, res, next) => {
    const unit = await Unit.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true, // Return updated unit
            runValidators: true // Run schema validators
        }
    );

    if (!unit) {
        return next(new AppError('No unit found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: unit
    });
});

// Delete unit
exports.deleteUnit = catchAsync(async (req, res, next) => {
    // Check if unit has any workers
    const workersCount = await mongoose.model('Worker').countDocuments({ unit: req.params.id });
    
    if (workersCount > 0) {
        return next(new AppError('Cannot delete unit with assigned workers. Please reassign or remove workers first.', 400));
    }

    const unit = await Unit.findByIdAndDelete(req.params.id);

    if (!unit) {
        return next(new AppError('No unit found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});

// Get unit statistics
exports.getUnitStats = catchAsync(async (req, res) => {
    const stats = await Unit.aggregate([
        {
            $lookup: {
                from: 'workers',
                localField: '_id',
                foreignField: 'unit',
                as: 'workers'
            }
        },
        {
            $project: {
                unitName: 1,
                workerCapacity: 1,
                currentWorkerCount: { $size: '$workers' },
                capacityUtilization: {
                    $multiply: [
                        { $divide: [{ $size: '$workers' }, '$workerCapacity'] },
                        100
                    ]
                }
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: stats
    });
});
