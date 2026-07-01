// Architect: SP
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Models
const { Product, Category } = require('../models');

async function checkProducts() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Find Bedsheets category
        const bedsheetsCat = await Category.findOne({ name: { $regex: /bedsheets/i } });
        console.log('\nBedsheets Category:', bedsheetsCat);

        // Find Towels category
        const towelsCat = await Category.findOne({ name: { $regex: /towels/i } });
        console.log('\nTowels Category:', towelsCat);

        // Find products in Bedsheets category
        if (bedsheetsCat) {
            const bedsheets = await Product.find({ category: bedsheetsCat._id })
                .populate('category', 'name');
            console.log('\nBedsheets Products:', bedsheets);
        }

        // Find products in Towels category
        if (towelsCat) {
            const towels = await Product.find({ category: towelsCat._id })
                .populate('category', 'name')
                .populate('unit', 'name');
            console.log('\nTowels Products:', towels);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

checkProducts();
