// Architect: SP
const express = require('express');
const router = express.Router();
const upload = require('../../middleware/uploadMiddleware');
const adminMiddleware = require('../../middleware/admin/adminMiddleware');

// Route to handle single image upload
router.post('/image', adminMiddleware, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Create URL for the uploaded file
        const fileUrl = `/uploads/products/${req.file.filename}`;
        
        res.status(200).json({ 
            message: 'File uploaded successfully',
            fileUrl: fileUrl
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Error uploading file' });
    }
});

module.exports = router;
