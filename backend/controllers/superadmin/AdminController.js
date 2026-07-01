// Architect: SP
const Admin = require('../../models/admin'); 
// this is the superadmin database where the admin 
// data is stored and validated when the admin logins in the portal 

// Create Admin
exports.createAdmin = async (req, res) => {
  try {
    console.log('Create admin request received:', req.body);
    const { name, email, phoneNumber, username, password, storeName, aadharNumber } = req.body;

    // Check for required fields
    if (!name || !email || !phoneNumber || !username || !password || !storeName || !aadharNumber) {
      console.log('Missing required fields:', { 
        name: !!name, 
        email: !!email, 
        phoneNumber: !!phoneNumber, 
        username: !!username, 
        password: !!password, 
        storeName: !!storeName, 
        aadharNumber: !!aadharNumber 
      });
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate username format (username@storename)
    const usernamePattern = new RegExp(`^[a-zA-Z0-9_]+@${storeName}$`);
    if (!usernamePattern.test(username)) {
      console.log('Invalid username format:', { username, storeName, pattern: `^[a-zA-Z0-9_]+@${storeName}$` });
      return res.status(400).json({ 
        message: `Invalid username format. Username must be in format: username@${storeName}` 
      });
    }

    // Check if admin already exists
    console.log('Checking for existing admin with:', { email, username, aadharNumber, phoneNumber });
    const existingAdmin = await Admin.findOne({
      $or: [
        { email },
        { username },
        { aadharNumber },
        { phoneNumber }
      ]
    });

    if (existingAdmin) {
      let field = '';
      if (existingAdmin.email === email) field = 'email';
      if (existingAdmin.username === username) field = 'username';
      if (existingAdmin.aadharNumber === aadharNumber) field = 'Aadhar number';
      if (existingAdmin.phoneNumber === phoneNumber) field = 'phone number';
      
      console.log('Admin already exists with field:', field, existingAdmin);
      return res.status(400).json({ 
        message: `Admin with this ${field} already exists` 
      });
    }

    // Create admin
    console.log('Creating new admin with:', { 
      name, 
      email, 
      phoneNumber, 
      username, 
      storeName, 
      aadharNumber,
      passwordLength: password ? password.length : 0
    });
    
    const admin = new Admin({
      name,
      email,
      phoneNumber,
      username,
      password,
      storeName,
      aadharNumber,
      isActive: true
    });

    await admin.save();
    console.log('Admin saved successfully with ID:', admin._id);

    // Remove password from response
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    res.status(201).json({ 
      message: 'Admin created successfully', 
      admin: adminResponse 
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all admins
exports.getAdmins = async (req, res) => {
  try {
    console.log('Get all admins request received');
    
    // Find all admins and exclude password field
    const admins = await Admin.find({}).select('-password');
    
    console.log(`Found ${admins.length} admins`);
    
    res.status(200).json({ 
      success: true, 
      count: admins.length, 
      data: admins 
    });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get all admins with optional store filter
exports.getAllAdmins = async (req, res) => {
  try {
    const { store } = req.query;
    const filter = store ? { storeName: store } : {};

    const admins = await Admin.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: admins.length,
      admins
    });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get admin by ID
exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.status(200).json({ admin });
  } catch (error) {
    console.error('Get admin error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update admin
exports.updateAdmin = async (req, res) => {
  try {
    const { name, email, phoneNumber, storeName, aadharNumber, isActive } = req.body;
    const adminId = req.params.id;

    // Find admin first
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Check if email/phone/aadhar is being used by another admin
    if (email || phoneNumber || aadharNumber) {
      const existingAdmin = await Admin.findOne({
        _id: { $ne: adminId },
        $or: [
          { email: email || '' },
          { phoneNumber: phoneNumber || '' },
          { aadharNumber: aadharNumber || '' }
        ]
      });

      if (existingAdmin) {
        let field = '';
        if (email && existingAdmin.email === email) field = 'email';
        if (phoneNumber && existingAdmin.phoneNumber === phoneNumber) field = 'phone number';
        if (aadharNumber && existingAdmin.aadharNumber === aadharNumber) field = 'Aadhar number';
        
        return res.status(400).json({ 
          message: `Another admin with this ${field} already exists` 
        });
      }
    }

    // Update admin
    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      {
        ...(name && { name }),
        ...(email && { email }),
        ...(phoneNumber && { phoneNumber }),
        ...(storeName && { storeName }),
        ...(aadharNumber && { aadharNumber }),
        ...(typeof isActive !== 'undefined' && { isActive })
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      message: 'Admin updated successfully',
      admin: updatedAdmin
    });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete admin
exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    await Admin.findByIdAndDelete(req.params.id);
    res.status(200).json({ 
      message: 'Admin deleted successfully' 
    });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Toggle admin status
exports.toggleAdminStatus = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    admin.isActive = !admin.isActive;
    await admin.save();

    res.status(200).json({
      message: `Admin ${admin.isActive ? 'activated' : 'deactivated'} successfully`,
      admin: {
        ...admin.toObject(),
        password: undefined
      }
    });
  } catch (error) {
    console.error('Toggle admin status error:', error);
    res.status(500).json({ message: error.message });
  }
};
