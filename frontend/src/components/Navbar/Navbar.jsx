import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../Context/WishlistContext';
import { useUser } from '../../Context/UserContext';
import './Navbar.css';

const Navbar = () => {
    const { wishlist } = useWishlist();
    const { isAuthenticated } = useUser();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <Link to="/">RBLA5</Link>
            </div>
            
            <button className="nav-toggle" onClick={() => setIsOpen(!isOpen)}>
                <span></span>
                <span></span>
                <span></span>
            </button>
            
            <div className={`nav-menu ${isOpen ? 'active' : ''}`}>
                <Link to="/" className="nav-item">Home</Link>
                <Link to="/products" className="nav-item">Products</Link>
                <Link to="/about" className="nav-item">About</Link>
                <Link to="/contact" className="nav-item">Contact</Link>
            </div>
            
            <div className="nav-icons">
                {isAuthenticated ? (
                    <>
                        <Link to="/profile" className="nav-icon">Profile</Link>
                        <Link to="/wishlist" className="nav-icon">
                            Wishlist {wishlist.length > 0 && <span>({wishlist.length})</span>}
                        </Link>
                        <Link to="/cart" className="nav-icon">Cart</Link>
                    </>
                ) : (
                    <Link to="/loginsignup" className="nav-icon">Login</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
