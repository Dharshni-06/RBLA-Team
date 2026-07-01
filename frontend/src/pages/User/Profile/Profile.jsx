// Architect: SP
import React, { useState, useEffect } from 'react';
import { useUser } from '../../../Context/UserContext';
import { getProfile, updateProfile } from '../../../services/userapi/profileService';
import { useNavigate, Link } from 'react-router-dom';
import './Profile.css';

const ProfileHeader = ({ user, onLogout }) => {
    return (
        <div className="profile-header">
            <div className="announcement-bar">
                Free Shipping on Orders Above ₹499 | Easy Returns | COD Available
            </div>
            <div className="profile-header-content">
                <Link to="/" className="profile-logo">
                    <span className="logo-text">RBLA</span>
                </Link>
                <div className="profile-header-right">
                    <button className="header-button" onClick={onLogout}>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

const Profile = () => {
    const { user, token, logout } = useUser();
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        name: '',
        phoneNumber: '',
        email: '',
        profileCompleted: false
    });
    const [isEditing, setIsEditing] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, [token]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await getProfile(token);
            if (response.success) {
                setProfile(response.data);
            }
        } catch (error) {
            setMessage({
                text: error.message || 'Error fetching profile',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const validatePhoneNumber = (number) => {
        if (!number) {
            return 'Phone number is required';
        }
        if (!/^\d{10}$/.test(number)) {
            return 'Phone number must be exactly 10 digits';
        }
        if (!/^[6-9]\d{9}$/.test(number)) {
            return 'Phone number must start with 6, 7, 8, or 9';
        }
        return '';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'phoneNumber') {
            // Only allow digits and limit to 10 characters
            const sanitizedValue = value.replace(/\D/g, '').slice(0, 10);
            setProfile(prev => ({
                ...prev,
                [name]: sanitizedValue
            }));
            
            // Validate phone number
            const error = validatePhoneNumber(sanitizedValue);
            setValidationError(error);
        } else {
            setProfile(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate phone number before submission
        const phoneError = validatePhoneNumber(profile.phoneNumber);
        if (phoneError) {
            setValidationError(phoneError);
            return;
        }

        try {
            const response = await updateProfile(token, {
                name: profile.name,
                phoneNumber: profile.phoneNumber
            });

            if (response.success) {
                setMessage({ text: 'Profile updated successfully', type: 'success' });
                setIsEditing(false);
                setValidationError('');
            }
        } catch (error) {
            setMessage({
                text: error.message || 'Error updating profile',
                type: 'error'
            });
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="profile-page">
                <ProfileHeader user={user} onLogout={handleLogout} />
                <div className="profile-container">
                    <div className="profile-card">
                        <div className="loading">Loading...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <ProfileHeader user={user} onLogout={handleLogout} />
            <div className="profile-container">
                <div className="profile-card">
                    <h2>Profile</h2>
                    {message.text && (
                        <div className={`message ${message.type}`}>
                            {message.text}
                        </div>
                    )}
                    
                    {!isEditing ? (
                        <div className="profile-details">
                            <div className="detail-section">
                                <div className="detail-header">Account Information</div>
                                <div className="detail-row">
                                    <div className="detail-label">Email</div>
                                    <div className="detail-value">{profile.email}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">Name</div>
                                    <div className="detail-value">{profile.name || 'Not set'}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">Phone Number</div>
                                    <div className="detail-value">{profile.phoneNumber || 'Not set'}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">Profile Status</div>
                                    <div className={`detail-value status ${profile.profileCompleted ? 'complete' : 'incomplete'}`}>
                                        {profile.profileCompleted ? 'Complete' : 'Incomplete'}
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="edit-button"
                            >
                                Edit Profile
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    disabled
                                    className="input-disabled"
                                />
                            </div>
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profile.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter your name"
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={profile.phoneNumber}
                                    onChange={handleInputChange}
                                    placeholder="Enter 10 digit mobile number"
                                    className={validationError ? 'error' : ''}
                                />
                                {validationError && (
                                    <div className="validation-error">{validationError}</div>
                                )}
                                {!validationError && profile.phoneNumber && (
                                    <div className="validation-success">✓ Valid phone number</div>
                                )}
                            </div>
                            <div className="button-group">
                                <button type="submit" className="save-button">
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        fetchProfile();
                                    }}
                                    className="cancel-button"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
