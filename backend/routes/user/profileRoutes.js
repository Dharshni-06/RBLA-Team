// Architect: SP
const express = require('express');
const router = express.Router();
const { 
    getProfile, 
    updateProfile, 
    sendDeleteAccountOtp, 
    verifyAndDeleteAccount 
} = require('../../controllers/user/profileController');
const authMiddleware = require('../../middleware/user/auth');

// All routes in this file are protected with auth middleware
router.use(authMiddleware);

// Get user profile
router.get('/', getProfile);

// Update user profile
router.put('/', updateProfile);

// Account deletion routes (OTP-verified)
router.post('/delete-account/send-otp', sendDeleteAccountOtp);
router.post('/delete-account/verify-and-delete', verifyAndDeleteAccount);

// Upload profile picture
const upload = require('../../middleware/uploadMiddleware');
router.post('/avatar', upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const User = require('../../models/user/User');
        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const fileUrl = `/uploads/products/${req.file.filename}`;
        user.profilePicture = fileUrl;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile picture updated successfully',
            profilePicture: fileUrl,
            data: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({ success: false, message: 'Error uploading profile picture', error: error.message });
    }
});

module.exports = router;
