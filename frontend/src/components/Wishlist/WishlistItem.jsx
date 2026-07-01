import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../../Context/WishlistContext';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import './WishlistItem.css';

const WishlistItem = ({ item }) => {
    const navigate = useNavigate();
    const { removeFromWishlist } = useWishlist();
    const { product } = item;

    const handleRemove = async (e) => {
        e.stopPropagation();
        await removeFromWishlist(product._id);
    };

    const handleClick = () => {
        navigate(`/product/${product._id}`);
    };

    // Get the image URL from the product
    const imageUrl = product.image_url || (product.images && product.images[0]);
    const fullImageUrl = imageUrl ? `http://localhost:5000${imageUrl}` : '/placeholder.jpg';

    return (
        
        <Card className="wishlist-item" onClick={handleClick}>
            <CardMedia
                component="img"
                height="200"
                image={fullImageUrl}
                alt={product.name}
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder.jpg';
                }}
                sx={{ objectFit: 'contain', padding: '1rem' }}
            />
            <CardContent>
                <div className="wishlist-item-header">
                    <Typography variant="h6" component="h2" noWrap>
                        {product.name}
                    </Typography>
                    <IconButton 
                        onClick={handleRemove}
                        size="small"
                        color="error"
                        className="remove-button"
                    >
                        <DeleteIcon />
                    </IconButton>
                </div>
                <Typography variant="body2" color="text.secondary" noWrap>
                    {product.description}
                </Typography>
                <Typography variant="h6" color="primary">
                    ₹{product.price}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default WishlistItem;
