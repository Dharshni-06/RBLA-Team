import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCart, addToCart as addToCartAPI, updateCartItem, removeFromCart as removeFromCartAPI, clearCart as clearCartAPI } from '../services/userapi/cartAPI';
import { useNavigate } from 'react-router-dom';
import { authEvents, AUTH_EVENTS } from '../services/userapi/authEvents';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Load cart on mount and after login
    const fetchCart = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getCart();
            if (response.success) {
                setCartItems(response.data.items);
            }
        } catch (err) {
            setError(err.message);
            if (err.message === 'No authentication token, access denied') {
                // Handle unauthorized access
                setCartItems([]);
            }
        } finally {
            setLoading(false);
        }
    };

    // Clear cart data
    const clearCartData = () => {
        setCartItems([]);
        setError(null);
        setLoading(false);
    };

    useEffect(() => {
        // Subscribe to auth events
        const unsubscribe = authEvents.subscribe((event) => {
            if (event === AUTH_EVENTS.LOGIN) {
                fetchCart(); // Fetch cart on login
            } else if (event === AUTH_EVENTS.LOGOUT) {
                clearCartData(); // Clear data on logout
            }
        });

        // Initial fetch if user is logged in
        const token = localStorage.getItem('token');
        if (token) {
            fetchCart();
        }

        // Cleanup subscription
        return () => unsubscribe();
    }, []);

    // Add item to cart
    const addToCart = async (product, quantity = 1) => {
        try {
            setLoading(true);
            setError(null);
            
            const productData = {
                productId: product._id,
                quantity,
                price: product.price,
                productDetails: {
                    name: product.name,
                    image: product.image,
                    size: product.size,
                    color: product.color
                }
            };

            const response = await addToCartAPI(productData);
            if (response.success) {
                await fetchCart(); // Refresh cart
                return true;
            }
        } catch (err) {
            setError(err.message);
            if (err.message === 'No authentication token, access denied') {
                navigate('/login');
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Update item quantity
    const updateQuantity = async (itemId, quantity) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await updateCartItem({ itemId, quantity });
            if (response.success) {
                await fetchCart(); // Refresh cart
                return true;
            }
        } catch (err) {
            setError(err.message);
            if (err.message === 'No authentication token, access denied') {
                navigate('/login');
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Remove item from cart
    const removeFromCart = async (itemId) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await removeFromCartAPI(itemId);
            if (response.success) {
                await fetchCart(); // Refresh cart
                return true;
            }
        } catch (err) {
            setError(err.message);
            if (err.message === 'No authentication token, access denied') {
                navigate('/login');
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Clear entire cart
    const clearCart = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await clearCartAPI();
            if (response.success) {
                setCartItems([]);
                return true;
            }
        } catch (err) {
            setError(err.message);
            if (err.message === 'No authentication token, access denied') {
                navigate('/login');
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Calculate cart totals
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    const value = {
        cartItems,
        cartCount,
        cartTotal,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
