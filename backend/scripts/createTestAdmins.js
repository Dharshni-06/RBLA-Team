// Architect: SP
const mongoose = require('mongoose');
const Admin = require('../models/admin');
require('dotenv').config();

const createTestAdmins = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Test admin data
        const testAdmins = [
            {
                name: 'Varnam Admin',
                email: 'varnam@test.com',
                phoneNumber: '9876543210',
                username: 'admin@varnam',
                password: 'varnam123',
                storeName: 'varnam',
                aadharNumber: '123456789012',
                isActive: true
            },
            {
                name: 'Siragugal Admin',
                email: 'siragugal@test.com',
                phoneNumber: '9876543211',
                username: 'admin@siragugal',
                password: 'siragugal123',
                storeName: 'siragugal',
                aadharNumber: '123456789013',
                isActive: true
            },
            {
                name: 'Vaagai Admin',
                email: 'vaagai@test.com',
                phoneNumber: '9876543212',
                username: 'admin@vaagai',
                password: 'vaagai123',
                storeName: 'vaagai',
                aadharNumber: '123456789014',
                isActive: true
            }
        ];

        // Clear existing test admins
        console.log('Clearing existing test admins...');
        await Admin.deleteMany({
            email: { $in: testAdmins.map(admin => admin.email) }
        });

        // Create new admins
        console.log('Creating test admins...');
        for (const adminData of testAdmins) {
            try {
                const existingAdmin = await Admin.findOne({ username: adminData.username });
                if (existingAdmin) {
                    console.log(`Admin ${adminData.username} already exists`);
                    continue;
                }

                const admin = new Admin(adminData);
                await admin.save();
                console.log(`Created admin for ${adminData.storeName}`);
            } catch (error) {
                console.error(`Error creating admin ${adminData.username}:`, error.message);
            }
        }

        console.log('\nTest admins created successfully!');
        console.log('\nLogin Credentials:');
        testAdmins.forEach(admin => {
            console.log(`\n${admin.storeName.toUpperCase()}:`);
            console.log(`Username: ${admin.username}`);
            console.log(`Password: ${admin.password}`);
        });

    } catch (error) {
        console.error('Error creating test admins:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};

// Run the script
createTestAdmins();
