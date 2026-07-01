// Architect: SP
require('dotenv').config();
const mongoose = require('mongoose');
const Worker = require('../models/Worker');

const updateWorkerStoreNames = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Update Sirugugal workers to siragugal
        const result = await Worker.updateMany(
            { store: 'Sirugugal' },
            { $set: { store: 'siragugal' } }
        );
        console.log(`Updated ${result.modifiedCount} workers from Sirugugal to siragugal`);

        console.log('Store name update completed successfully');
    } catch (error) {
        console.error('Error updating store names:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

// Run the update
updateWorkerStoreNames();
