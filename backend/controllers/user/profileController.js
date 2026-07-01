// Architect: SP
const User = require('../../models/user/User');

// Get user profile
const getProfile = async (req, res) => {
    try {
        console.log('Getting profile for user:', req.user.email);
        // Get user from email (set by auth middleware)
        const user = await User.findOne({ email: req.user.email });
        
        if (!user) {
            console.log('User not found:', req.user.email);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const publicProfile = user.getPublicProfile();
        console.log('Returning profile:', publicProfile);

        // Return public profile
        res.status(200).json({
            success: true,
            data: publicProfile
        });
    } catch (error) {
        console.error('Error in getProfile:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const { name, phoneNumber } = req.body;
        console.log('Updating profile for user:', req.user.email);
        console.log('Update data received:', { name, phoneNumber });

        // Validate input
        if (!name && !phoneNumber) {
            console.log('No fields provided for update');
            return res.status(400).json({
                success: false,
                message: 'Please provide at least one field to update'
            });
        }

        // Find user by email
        const user = await User.findOne({ email: req.user.email });
        
        if (!user) {
            console.log('User not found for update:', req.user.email);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields if provided
        if (name) user.name = name;
        if (phoneNumber) user.phoneNumber = phoneNumber;

        // Set profile as completed if both fields are filled
        if (user.name && user.phoneNumber) {
            user.profileCompleted = true;
            console.log('Profile marked as completed');
        }

        await user.save();
        console.log('Profile updated successfully:', user.getPublicProfile());

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Error in updateProfile:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};

module.exports = {
    getProfile,
    updateProfile
};
