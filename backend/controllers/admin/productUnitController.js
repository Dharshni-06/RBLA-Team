// Architect: SP
const ProductUnit = require('../../models/schemas/productUnit');

// Get all product units
const getAllUnits = async (req, res) => {
    try {
        const units = await ProductUnit.find().sort('name');
        res.json(units);
    } catch (error) {
        console.error('Error fetching units:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Failed to fetch units' 
        });
    }
};

// Create new product unit
const createUnit = async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name || !name.trim()) {
            return res.status(400).json({
                status: 'error',
                message: 'Unit name is required'
            });
        }

        const existingUnit = await ProductUnit.findOne({ name: name.trim() });
        if (existingUnit) {
            return res.status(400).json({
                status: 'error',
                message: 'Unit with this name already exists'
            });
        }

        const unit = await ProductUnit.create({ name: name.trim() });
        res.status(201).json(unit);
    } catch (error) {
        console.error('Error creating unit:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Failed to create unit' 
        });
    }
};

module.exports = {
    getAllUnits,
    createUnit
};
