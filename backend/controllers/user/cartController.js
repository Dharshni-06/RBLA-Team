// Architect: SP
const Cart = require('../../models/user/Cart');
const CartItem = require('../../models/user/CartItem');
const User = require('../../models/user/User');

// Helper function to get or create cart
const getOrCreateCart = async (userId) => {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
        cart = await Cart.create({ userId });
    }
    return cart;
};

// Get cart with items
const getCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const cart = await Cart.findOne({ userId });
        
        if (!cart) {
            return res.status(200).json({
                success: true,
                data: { items: [], totalPrice: 0, totalItems: 0 }
            });
        }

        const cartItems = await CartItem.find({ cartId: cart._id });
        
        return res.status(200).json({
            success: true,
            data: {
                items: cartItems,
                totalPrice: cart.totalPrice,
                totalItems: cart.totalItems
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching cart'
        });
    }
};

// Add item to cart
const addToCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, quantity, price, productDetails } = req.body;

        if (!productId || !price) {
            return res.status(400).json({
                success: false,
                message: 'Product ID and price are required'
            });
        }

        const cart = await getOrCreateCart(userId);

        // Check if item already exists
        let cartItem = await CartItem.findOne({ cartId: cart._id, productId });

        if (cartItem) {
            // Update quantity if item exists
            cartItem.quantity += quantity || 1;
            await cartItem.save();
        } else {
            // Create new cart item
            cartItem = await CartItem.create({
                cartId: cart._id,
                productId,
                quantity: quantity || 1,
                price,
                productDetails
            });
        }

        // Update cart totals
        cart.totalItems = (cart.totalItems || 0) + (quantity || 1);
        cart.totalPrice = (cart.totalPrice || 0) + (price * (quantity || 1));
        await cart.save();

        return res.status(200).json({
            success: true,
            data: cartItem
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error adding item to cart'
        });
    }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
    try {
        const userId = req.user._id;
        const { itemId, quantity } = req.body;

        if (!itemId || quantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid item ID and quantity required'
            });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const cartItem = await CartItem.findOne({ _id: itemId, cartId: cart._id });
        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        // Calculate price difference
        const priceDiff = cartItem.price * (quantity - cartItem.quantity);
        const itemsDiff = quantity - cartItem.quantity;

        // Update cart item
        cartItem.quantity = quantity;
        await cartItem.save();

        // Update cart totals
        cart.totalPrice += priceDiff;
        cart.totalItems += itemsDiff;
        await cart.save();

        return res.status(200).json({
            success: true,
            data: cartItem
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error updating cart item'
        });
    }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { itemId } = req.params;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const cartItem = await CartItem.findOne({ _id: itemId, cartId: cart._id });
        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        // Update cart totals before removing item
        cart.totalPrice -= cartItem.price * cartItem.quantity;
        cart.totalItems -= cartItem.quantity;
        await cart.save();

        // Remove the item
        await CartItem.deleteOne({ _id: itemId });

        return res.status(200).json({
            success: true,
            message: 'Item removed from cart'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error removing item from cart'
        });
    }
};

// Clear cart
const clearCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const cart = await Cart.findOne({ userId });

        if (cart) {
            // Remove all cart items
            await CartItem.deleteMany({ cartId: cart._id });
            
            // Reset cart totals
            cart.totalPrice = 0;
            cart.totalItems = 0;
            await cart.save();
        }

        return res.status(200).json({
            success: true,
            message: 'Cart cleared successfully'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error clearing cart'
        });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};
