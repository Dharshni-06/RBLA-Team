// Architect: SP
const mongoose = require('mongoose');
const Admin = require('../../models/admin');
require('dotenv').config();

const testVarnamAdminLogin = async () => {
    try {
        // Connect to MongoDB to verify against admin collection
        await mongoose.connect(process.env.MONGO_URI);
        console.log('\nConnected to MongoDB - Checking admin database...');

        // First verify the admin exists in database
        // Note: we need to explicitly select password field since it's excluded by default
        const adminInDb = await Admin.findOne({ username: 'admin@varnam' }).select('+password');
        if (!adminInDb) {
            console.error(' Admin not found in database. Please run createTestAdmins.js first.');
            return;
        }
        console.log(' Found admin@varnam in database');
        console.log('Store:', adminInDb.storeName);
        console.log('Is Active:', adminInDb.isActive);

        // Test login credentials
        const credentials = {
            username: 'admin@varnam',
            password: 'varnam123'
        };

        // Verify password using the admin model's matchPassword method
        const isPasswordValid = await adminInDb.matchPassword(credentials.password);
        if (!isPasswordValid) {
            console.error(' Password verification failed');
            return;
        }
        console.log(' Password verified successfully');

        // Verify username format matches store
        const usernamePattern = new RegExp(`^[a-zA-Z0-9_]+@${adminInDb.storeName}$`);
        if (!usernamePattern.test(credentials.username)) {
            console.error(' Username format validation failed');
            return;
        }
        console.log(' Username format validated');

        console.log('\n All checks passed! Admin login validation successful');
        console.log('Admin Details:');
        console.log('-------------');
        console.log('Name:', adminInDb.name);
        console.log('Email:', adminInDb.email);
        console.log('Store:', adminInDb.storeName);
        console.log('Phone:', adminInDb.phoneNumber);

    } catch (error) {
        console.error('Error during login test:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};

// Run the test
testVarnamAdminLogin();
