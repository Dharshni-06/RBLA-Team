const mongoose = require('mongoose');
const Admin = require('../models/admin');
require('dotenv').config({ path: '../.env' });

async function inspectAdmins() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb+srv://rbla_user:rbla1234@cluster0.xvazton.mongodb.net/rbla?retryWrites=true&w=majority';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected.');
    
    const admins = await Admin.find({});
    console.log('Admins count:', admins.length);
    admins.forEach(admin => {
      console.log({
        id: admin._id,
        name: admin.name,
        email: admin.email,
        username: admin.username,
        storeName: admin.storeName,
        isActive: admin.isActive
      });
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

inspectAdmins();
