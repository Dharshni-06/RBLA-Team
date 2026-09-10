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
        const { name, phoneNumber, profilePicture } = req.body;
        console.log('Updating profile for user:', req.user.email);
        console.log('Update data received:', { name, phoneNumber, profilePicture });

        // Validate input
        if (!name && !phoneNumber && !profilePicture) {
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
        if (profilePicture !== undefined) user.profilePicture = profilePicture;

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

// Send OTP for account deletion
const sendDeleteAccountOtp = async (req, res) => {
    try {
        const { sendAccountDeletionOtpEmail } = require('../../utils/email');
        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate 6-digit numeric OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.deleteAccountOtp = otp;
        user.deleteAccountOtpExpires = otpExpires;
        await user.save();

        // Send OTP email
        await sendAccountDeletionOtpEmail(user.email, otp);

        res.status(200).json({
            success: true,
            message: 'Verification OTP sent to your registered email'
        });
    } catch (error) {
        console.error('Error in sendDeleteAccountOtp:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP for account deletion',
            error: error.message
        });
    }
};

// Verify OTP and permanently delete account
const verifyAndDeleteAccount = async (req, res) => {
    try {
        const { otp } = req.body;

        if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid 6-digit OTP'
            });
        }

        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.deleteAccountOtp || user.deleteAccountOtp !== otp.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP. Please check the code sent to your email.'
            });
        }

        if (!user.deleteAccountOtpExpires || user.deleteAccountOtpExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new OTP to delete your account.'
            });
        }

        // Clean up Cart and Wishlist if present
        try {
            const Cart = require('../../models/user/Cart');
            await Cart.deleteMany({ user: user._id });
        } catch (cartErr) {
            console.warn('Could not clean cart items on account delete:', cartErr.message);
        }

        try {
            const Wishlist = require('../../models/user/Wishlist');
            await Wishlist.deleteMany({ user: user._id });
        } catch (wishlistErr) {
            console.warn('Could not clean wishlist on account delete:', wishlistErr.message);
        }

        // Permanently delete user document
        await User.findByIdAndDelete(user._id);

        res.status(200).json({
            success: true,
            message: 'Your account has been deleted successfully'
        });
    } catch (error) {
        console.error('Error in verifyAndDeleteAccount:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting account',
            error: error.message
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    sendDeleteAccountOtp,
    verifyAndDeleteAccount
};
