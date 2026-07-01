import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { getAuthToken } from '../services/userapi/authservice';
import { authEvents, AUTH_EVENTS } from '../services/userapi/authEvents';

const WishlistContext = createContext();

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }) => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get wishlist items
    const fetchWishlist = async () => {
        const token = getAuthToken();
        if (!token) {
            setWishlistItems([]);
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get('/api/user/wishlist', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (response.data.success) {
                setWishlistItems(response.data.wishlist?.items || []);
                setError(null);
            } else {
                throw new Error(response.data.message || 'Failed to fetch wishlist');
            }
        } catch (err) {
            console.error('Fetch wishlist error:', err);
            setError(err.response?.data?.message || err.message || 'Error fetching wishlist');
            setWishlistItems([]);
            
            // If unauthorized, clear wishlist
            if (err.response?.status === 401) {
                clearWishlistData();
            }
        } finally {
            setLoading(false);
        }
    };

    // Add to wishlist
    const addToWishlist = async (productId) => {
        try {
            setLoading(true);
            const token = getAuthToken();
            if (!token) {
                throw new Error('Please login to add items to wishlist');
            }

            const response = await axios.post('/api/user/wishlist/add', 
                { productId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            if (response.data.success) {
                setWishlistItems(response.data.wishlist?.items || []);
                setError(null);
                return true;
            } else {
                throw new Error(response.data.message || 'Failed to add to wishlist');
            }
        } catch (err) {
            console.error('Add to wishlist error:', err);
            setError(err.response?.data?.message || err.message || 'Error adding to wishlist');
            
            // If unauthorized, clear wishlist
            if (err.response?.status === 401) {
                clearWishlistData();
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Remove from wishlist
    const removeFromWishlist = async (productId) => {
        try {
            setLoading(true);
            const token = getAuthToken();
            if (!token) {
                throw new Error('Please login to remove items from wishlist');
            }

            const response = await axios.delete(`/api/user/wishlist/remove/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setWishlistItems(response.data.wishlist?.items || []);
                setError(null);
                return true;
            } else {
                throw new Error(response.data.message || 'Failed to remove from wishlist');
            }
        } catch (err) {
            console.error('Remove from wishlist error:', err);
            setError(err.response?.data?.message || err.message || 'Error removing from wishlist');
            
            // If unauthorized, clear wishlist
            if (err.response?.status === 401) {
                clearWishlistData();
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Clear wishlist
    const clearWishlist = async () => {
        try {
            setLoading(true);
            const token = getAuthToken();
            if (!token) {
                throw new Error('Please login to clear wishlist');
            }

            const response = await axios.delete('/api/user/wishlist/clear', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setWishlistItems([]);
                setError(null);
                return true;
            } else {
                throw new Error(response.data.message || 'Failed to clear wishlist');
            }
        } catch (err) {
            console.error('Clear wishlist error:', err);
            setError(err.response?.data?.message || err.message || 'Error clearing wishlist');
            
            // If unauthorized, clear wishlist
            if (err.response?.status === 401) {
                clearWishlistData();
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Check if item is in wishlist
    const isInWishlist = (productId) => {
        return wishlistItems.some(item => item.product?._id === productId);
    };

    // Clear wishlist data
    const clearWishlistData = () => {
        setWishlistItems([]);
        setError(null);
        setLoading(false);
    };

    useEffect(() => {
        // Subscribe to auth events
        const unsubscribe = authEvents.subscribe((event) => {
            if (event === AUTH_EVENTS.LOGIN) {
                fetchWishlist(); // Fetch wishlist on login
            } else if (event === AUTH_EVENTS.LOGOUT) {
                clearWishlistData(); // Clear data on logout
            }
        });

        // Initial fetch if user is logged in
        const token = getAuthToken();
        if (token) {
            fetchWishlist();
        }

        // Cleanup subscription
        return () => unsubscribe();
    }, []);

    const value = {
        wishlistItems,
        loading,
        error,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        wishlistCount: wishlistItems.length
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};
