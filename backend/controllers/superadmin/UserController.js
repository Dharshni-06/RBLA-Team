// Architect: SP
const User = require('../../models/user/User');

/**
 * Get all users with optional filtering and pagination
 * @route GET /api/superadmin/users
 */
exports.getAllUsers = async (req, res) => {
  try {
    console.log('Get all users request received');
    
    // Extract query parameters for filtering and pagination
    const { 
      page = 1, 
      limit = 10, 
      sort = 'createdAt', 
      order = 'desc',
      search = '',
      isVerified
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Add search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by verification status if provided
    if (isVerified !== undefined) {
      filter.isVerified = isVerified === 'true';
    }

    // Count total documents for pagination
    const total = await User.countDocuments(filter);
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Determine sort order
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sort]: sortOrder };

    // Find users with filter, sort, and pagination
    const users = await User.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password -otp -otpExpires'); // Exclude sensitive fields
    
    console.log(`Found ${users.length} users`);
    
    // Return users with pagination metadata
    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
      error: error.message
    });
  }
};

/**
 * Get user by ID
 * @route GET /api/superadmin/users/:id
 */
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(`Get user by ID request received for ID: ${userId}`);
    
    // Find user by ID
    const user = await User.findById(userId).select('-password -otp -otpExpires');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user',
      error: error.message
    });
  }
};

/**
 * Update user
 * @route PUT /api/superadmin/users/:id
 */
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, phoneNumber, isVerified, profileCompleted } = req.body;
    
    console.log(`Update user request received for ID: ${userId}`);
    
    // Find user first to ensure it exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (profileCompleted !== undefined) updateData.profileCompleted = profileCompleted;
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpires');
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user',
      error: error.message
    });
  }
};

/**
 * Delete user
 * @route DELETE /api/superadmin/users/:id
 */
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(`Delete user request received for ID: ${userId}`);
    
    // Find and delete user
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user',
      error: error.message
    });
  }
};

/**
 * Get user statistics
 * @route GET /api/superadmin/users/stats
 */
exports.getUserStats = async (req, res) => {
  try {
    console.log('Get user statistics request received');
    
    // Get total users count
    const totalUsers = await User.countDocuments();
    
    // Get verified users count
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    
    // Get users with completed profiles count
    const completedProfiles = await User.countDocuments({ profileCompleted: true });
    
    // Get users registered in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    
    // Return statistics
    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        verifiedUsers,
        unverifiedUsers: totalUsers - verifiedUsers,
        completedProfiles,
        incompleteProfiles: totalUsers - completedProfiles,
        newUsers,
        verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers * 100).toFixed(2) : 0,
        profileCompletionRate: totalUsers > 0 ? (completedProfiles / totalUsers * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user statistics',
      error: error.message
    });
  }
};
