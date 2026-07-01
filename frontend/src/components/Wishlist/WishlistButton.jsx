import React from 'react';
import { useWishlist } from '../../Context/WishlistContext';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CircularProgress from '@mui/material/CircularProgress';
import { useSnackbar } from 'notistack';

const WishlistButton = ({ productId, size = 'medium' }) => {
    const { addToWishlist, removeFromWishlist, isInWishlist, loading, error } = useWishlist();
    const { enqueueSnackbar } = useSnackbar();
    const inWishlist = isInWishlist(productId);

    const handleToggleWishlist = async (e) => {
        e.stopPropagation(); // Prevent event bubbling
        if (loading) return;
        
        try {
            const success = inWishlist 
                ? await removeFromWishlist(productId)
                : await addToWishlist(productId);

            if (success) {
                enqueueSnackbar(
                    inWishlist ? 'Removed from wishlist' : 'Added to wishlist',
                    { variant: 'success' }
                );
            } else if (error) {
                enqueueSnackbar(error, { variant: 'error' });
            }
        } catch (err) {
            console.error('Wishlist operation error:', err);
            enqueueSnackbar(
                err.message || 'Error updating wishlist',
                { variant: 'error' }
            );
        }
    };

    return (
        <Tooltip title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}>
            <IconButton
                onClick={handleToggleWishlist}
                disabled={loading}
                color={inWishlist ? "error" : "default"}
                size={size}
                sx={{
                    '&:hover': {
                        color: '#ff1744',
                    },
                    position: 'relative'
                }}
            >
                {loading ? (
                    <CircularProgress
                        size={24}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginTop: '-12px',
                            marginLeft: '-12px'
                        }}
                    />
                ) : inWishlist ? (
                    <FavoriteIcon />
                ) : (
                    <FavoriteBorderIcon />
                )}
            </IconButton>
        </Tooltip>
    );
};

export default WishlistButton;
