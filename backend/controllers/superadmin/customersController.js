// Architect: SP
const Customer = require('../../models/Customer');
const AppError = require('../../utils/appError');
const { catchAsync } = require('../../utils/catchAsync');

// Get all customers
exports.getAllCustomers = catchAsync(async (req, res, next) => {
    const customers = await Customer.find();
    
    res.status(200).json({
        status: 'success',
        results: customers.length,
        data: {
            customers
        }
    });
});

// Get a single customer
exports.getCustomerById = catchAsync(async (req, res, next) => {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
        return next(new AppError('No customer found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            customer
        }
    });
});

// Create new customer
exports.createCustomer = catchAsync(async (req, res, next) => {
    // Check if email already exists
    const existingCustomer = await Customer.findOne({ email: req.body.email });
    if (existingCustomer) {
        return next(new AppError('A customer with this email already exists', 400));
    }

    const newCustomer = await Customer.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            customer: newCustomer
        }
    });
});

// Update customer
exports.updateCustomer = catchAsync(async (req, res, next) => {
    // If trying to update email, check if new email already exists
    if (req.body.email) {
        const existingCustomer = await Customer.findOne({ 
            email: req.body.email,
            _id: { $ne: req.params.id }
        });
        if (existingCustomer) {
            return next(new AppError('A customer with this email already exists', 400));
        }
    }

    const customer = await Customer.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    if (!customer) {
        return next(new AppError('No customer found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            customer
        }
    });
});

// Delete customer
exports.deleteCustomer = catchAsync(async (req, res, next) => {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
        return next(new AppError('No customer found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});

// Search customers
exports.searchCustomers = catchAsync(async (req, res, next) => {
    const query = req.query.query;
    if (!query) {
        return next(new AppError('Please provide a search query', 400));
    }

    const customers = await Customer.find({
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } },
            { phone: { $regex: query, $options: 'i' } }
        ]
    });

    res.status(200).json({
        status: 'success',
        results: customers.length,
        data: {
            customers
        }
    });
});

// Filter customers by store
exports.filterCustomersByStore = catchAsync(async (req, res, next) => {
    const store = req.query.store;
    if (!store) {
        return next(new AppError('Please provide a store to filter by', 400));
    }

    if (!['varnam', 'sirugugal', 'vaagai'].includes(store)) {
        return next(new AppError('Invalid store. Must be one of: varnam, sirugugal, vaagai', 400));
    }

    const customers = await Customer.find({ store });

    res.status(200).json({
        status: 'success',
        results: customers.length,
        data: {
            customers
        }
    });
});
