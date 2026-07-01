// Architect: SP
const Wishlist = require('../../models/user/Wishlist');
const Product = require('../../models/Product');

const wishlistController = {
    // Get user's wishlist
    getWishlist: async (req, res) => {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Please login to access your wishlist' 
                });
            }

            let wishlist = await Wishlist.findOne({ user: req.user._id })
                .populate('items.product', 'name new_price old_price image_url');

            if (!wishlist) {
                wishlist = new Wishlist({ user: req.user._id, items: [] });
                try {
                    await wishlist.save();
                } catch (saveError) {
                    console.error('Error creating wishlist:', saveError);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Error creating wishlist' 
                    });
                }
            }

            res.json({ success: true, wishlist });
        } catch (error) {
            console.error('Get wishlist error:', error);
            res.status(500).json({ success: false, message: 'Error fetching wishlist' });
        }
    },

    // Add item to wishlist
    addToWishlist: async (req, res) => {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Please login to add items to wishlist' 
                });
            }

            const { productId } = req.body;
            if (!productId) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Product ID is required' 
                });
            }

            // Validate product exists
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Product not found' 
                });
            }

            let wishlist = await Wishlist.findOne({ user: req.user._id });

            // Create wishlist if it doesn't exist
            if (!wishlist) {
                wishlist = new Wishlist({ user: req.user._id, items: [] });
            }

            // Check if product already exists in wishlist
            const existingItem = wishlist.items.find(
                item => item.product?.toString() === productId
            );

            if (existingItem) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Product already in wishlist' 
                });
            }

            // Add new item
            wishlist.items.push({ product: productId });
            try {
                await wishlist.save();
            } catch (saveError) {
                console.error('Error saving wishlist:', saveError);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error saving wishlist' 
                });
            }

            // Return populated wishlist
            wishlist = await Wishlist.findById(wishlist._id)
                .populate('items.product', 'name new_price old_price image_url');
            
            res.json({ success: true, wishlist });
        } catch (error) {
            console.error('Add to wishlist error:', error);
            res.status(500).json({ success: false, message: 'Error adding to wishlist' });
        }
    },

    // Remove item from wishlist
    removeFromWishlist: async (req, res) => {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Please login to remove items from wishlist' 
                });
            }

            const { productId } = req.params;
            if (!productId) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Product ID is required' 
                });
            }

            let wishlist = await Wishlist.findOne({ user: req.user._id });
            
            if (!wishlist) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Wishlist not found' 
                });
            }

            wishlist.items = wishlist.items.filter(
                item => item.product?.toString() !== productId
            );

            try {
                await wishlist.save();
            } catch (saveError) {
                console.error('Error saving wishlist:', saveError);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error saving wishlist' 
                });
            }
            
            // Return populated wishlist
            wishlist = await Wishlist.findById(wishlist._id)
                .populate('items.product', 'name new_price old_price image_url');
            
            res.json({ success: true, wishlist });
        } catch (error) {
            console.error('Remove from wishlist error:', error);
            res.status(500).json({ success: false, message: 'Error removing from wishlist' });
        }
    },

    // Clear entire wishlist
    clearWishlist: async (req, res) => {
        try {
            if (!req.user?._id) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Please login to clear wishlist' 
                });
            }

            const wishlist = await Wishlist.findOne({ user: req.user._id });
            
            if (!wishlist) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Wishlist not found' 
                });
            }

            wishlist.items = [];
            try {
                await wishlist.save();
            } catch (saveError) {
                console.error('Error saving wishlist:', saveError);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error saving wishlist' 
                });
            }

            res.json({ success: true, message: 'Wishlist cleared successfully' });
        } catch (error) {
            console.error('Clear wishlist error:', error);
            res.status(500).json({ success: false, message: 'Error clearing wishlist' });
        }
    }
};

module.exports = wishlistController;
