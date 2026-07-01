// Architect: SP
import React from 'react';
import { useWishlist } from '../../../Context/WishlistContext';
import WishlistItem from '../../../components/Wishlist/WishlistItem';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import './WishlistPage.css';

const WishlistPage = () => {
    const { wishlistItems, loading, error, clearWishlist } = useWishlist();

    console.log('Wishlist items:', wishlistItems); // Debug log

    if (loading) {
        return (
            <Container>
                <div className="wishlist-loading">
                    <CircularProgress />
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <div className="wishlist-error">
                    <Typography variant="h6" color="error" align="center">{error}</Typography>
                </div>
            </Container>
        );
    }

    if (!wishlistItems?.length) {
        return (
            <Container>
                <div className="wishlist-empty">
                    <Typography variant="h5" gutterBottom>
                        Your wishlist is empty
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        Add items to your wishlist while shopping to save them for later
                    </Typography>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <div className="wishlist-header">
                <Typography variant="h4" gutterBottom>
                    My Wishlist ({wishlistItems.length} items)
                </Typography>
                <Button 
                    variant="outlined" 
                    color="error" 
                    onClick={clearWishlist}
                    disabled={loading}
                    startIcon={<DeleteSweepIcon />}
                >
                    Clear Wishlist
                </Button>
            </div>
            <div className="wishlist-grid">
                {wishlistItems.map((item) => {
                    console.log('Item:', item); // Debug log for each item
                    return <WishlistItem key={item.product._id} item={item} />;
                })}
            </div>
        </Container>
    );
};

export default WishlistPage;
