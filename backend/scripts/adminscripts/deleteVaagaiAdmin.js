// Architect: SP
const mongoose = require('mongoose');
const Admin = require('../../models/admin');
require('dotenv').config();

const deleteVaagaiAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('\nConnected to MongoDB - Deleting Vaagai admin...');

        // Find the Vaagai admin
        const vaagaiAdmin = await Admin.findOne({ storeName: 'vaagai' });
        
        if (!vaagaiAdmin) {
            console.log('\n\u274c No Vaagai admin found in the database.');
            return;
        }
        
        // Delete the admin
        await Admin.deleteOne({ _id: vaagaiAdmin._id });
        
        console.log(`\n\u2705 Successfully deleted admin: ${vaagaiAdmin.username}`);
        console.log('Details of deleted admin:');
        console.log('---------------------------');
        console.log('Name:', vaagaiAdmin.name);
        console.log('Email:', vaagaiAdmin.email);
        console.log('Store:', vaagaiAdmin.storeName);
        console.log('Username:', vaagaiAdmin.username);
        
    } catch (error) {
        console.error('Error deleting Vaagai admin:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};

// Run the script
deleteVaagaiAdmin();
