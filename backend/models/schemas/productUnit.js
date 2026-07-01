// Architect: SP
const mongoose = require('mongoose');

const productUnitSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    }
}, {
    timestamps: true
});

const ProductUnit = mongoose.model('ProductUnit', productUnitSchema);

module.exports = ProductUnit;
