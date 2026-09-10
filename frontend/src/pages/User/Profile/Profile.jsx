// Architect: SP
import React, { useState, useEffect } from 'react';
import { useUser } from '../../../Context/UserContext';
import { getProfile, updateProfile, uploadAvatar, sendDeleteAccountOtp, verifyAndDeleteAccount } from '../../../services/userapi/profileService';
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
        profilePicture: '',
        profileCompleted: false
    });
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(true);

    // Account deletion states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteStep, setDeleteStep] = useState(1); // 1: Confirmation/Send OTP, 2: Input OTP/Verify
    const [deleteOtp, setDeleteOtp] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    // Cooldown timer for resending OTP
    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCooldown]);

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

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setMessage({ text: 'Please select a valid image file', type: 'error' });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage({ text: 'Image size should be less than 5MB', type: 'error' });
            return;
        }

        try {
            setUploadingAvatar(true);
            setMessage({ text: '', type: '' });
            const response = await uploadAvatar(token, file);
            if (response.success) {
                setProfile(prev => ({
                    ...prev,
                    profilePicture: response.profilePicture
                }));
                setMessage({ text: 'Profile picture updated successfully', type: 'success' });
            }
        } catch (error) {
            setMessage({
                text: error.message || 'Error uploading profile picture',
                type: 'error'
            });
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleOpenDeleteModal = () => {
        setShowDeleteModal(true);
        setDeleteStep(1);
        setDeleteOtp('');
        setDeleteError('');
    };

    const handleCloseDeleteModal = () => {
        if (deleteLoading) return;
        setShowDeleteModal(false);
        setDeleteStep(1);
        setDeleteOtp('');
        setDeleteError('');
    };

    const handleSendDeleteOtp = async () => {
        try {
            setDeleteLoading(true);
            setDeleteError('');
            const res = await sendDeleteAccountOtp(token);
            if (res.success) {
                setDeleteStep(2);
                setResendCooldown(60);
            } else {
                setDeleteError(res.message || 'Failed to send OTP');
            }
        } catch (err) {
            setDeleteError(err.message || 'Failed to send OTP. Please try again.');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteOtp || deleteOtp.trim().length !== 6) {
            setDeleteError('Please enter a valid 6-digit OTP');
            return;
        }

        try {
            setDeleteLoading(true);
            setDeleteError('');
            const res = await verifyAndDeleteAccount(token, deleteOtp.trim());
            if (res.success) {
                alert('Your account has been deleted successfully.');
                logout();
                navigate('/login');
            } else {
                setDeleteError(res.message || 'Failed to delete account');
            }
        } catch (err) {
            setDeleteError(err.message || 'Failed to delete account. Please verify the OTP.');
        } finally {
            setDeleteLoading(false);
        }
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

            {/* Top Right Corner Delete Button (opposite to Go Back button) */}
            <div className="profile-delete-corner-container animate-fade-in">
                <button 
                    type="button" 
                    className="profile-corner-delete-btn"
                    onClick={handleOpenDeleteModal}
                    title="Delete Account"
                >
                    Delete Account
                </button>
            </div>

            <div className="profile-container">
                <div className="profile-card">
                    <h2>Profile</h2>

                    <div className="profile-avatar-container">
                        <div className="profile-avatar-wrapper">
                            <img 
                                src={profile.profilePicture ? `http://localhost:5000${profile.profilePicture}` : 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
                                alt={profile.name || 'User'} 
                                className="profile-avatar-image"
                                onError={(e) => {
                                    e.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
                                }}
                            />
                            <label htmlFor="avatar-upload-input" className="avatar-upload-overlay">
                                <span>Upload</span>
                            </label>
                        </div>
                        <input 
                            type="file" 
                            id="avatar-upload-input" 
                            accept="image/*" 
                            onChange={handleAvatarChange} 
                            style={{ display: 'none' }}
                        />
                        {uploadingAvatar && <div className="avatar-loading">Uploading...</div>}
                    </div>

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

            {/* Account Deletion Confirmation & OTP Modal */}
            {showDeleteModal && (
                <div className="delete-modal-overlay">
                    <div className="delete-modal-content">
                        <div className="delete-modal-header">
                            <h3>⚠️ Delete Account</h3>
                            <button 
                                className="delete-modal-close" 
                                onClick={handleCloseDeleteModal} 
                                disabled={deleteLoading}
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        {deleteError && (
                            <div className="delete-error-banner">
                                {deleteError}
                            </div>
                        )}

                        {deleteStep === 1 ? (
                            <div className="delete-modal-body">
                                <p className="delete-warning-text">
                                    Are you sure you want to delete your account? This action is <strong>permanent</strong> and cannot be undone.
                                </p>

                                <div className="delete-info-box">
                                    <div className="delete-info-title">What will be permanently deleted:</div>
                                    <ul className="delete-info-list">
                                        <li>
                                            <span className="delete-list-bullet">✕</span>
                                            <span>Your profile details, personal data, and login credentials</span>
                                        </li>
                                        <li>
                                            <span className="delete-list-bullet">✕</span>
                                            <span>Your shopping cart items and saved wishlist</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="delete-security-notice">
                                    <span className="security-notice-icon">🔒</span>
                                    <div className="security-notice-text">
                                        For your security, a One-Time Password (OTP) will be sent to your registered email: <span className="highlight-email">{profile.email}</span>
                                    </div>
                                </div>

                                <div className="delete-modal-actions">
                                    <button
                                        type="button"
                                        className="cancel-delete-btn"
                                        onClick={handleCloseDeleteModal}
                                        disabled={deleteLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="send-otp-btn"
                                        onClick={handleSendDeleteOtp}
                                        disabled={deleteLoading}
                                    >
                                        {deleteLoading ? 'Sending OTP...' : 'Send Verification OTP'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="delete-modal-body">
                                <div className="otp-sent-notice">
                                    <span className="otp-sent-icon">📩</span>
                                    <div className="otp-sent-text">
                                        A 6-digit verification code has been sent to <span className="highlight-email">{profile.email}</span>. Please enter it below to confirm permanent deletion.
                                    </div>
                                </div>

                                <div className="otp-input-group">
                                    <label htmlFor="delete-otp-input">Enter 6-Digit OTP</label>
                                    <input
                                        id="delete-otp-input"
                                        type="text"
                                        maxLength="6"
                                        placeholder="• • • • • •"
                                        value={deleteOtp}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            setDeleteOtp(val);
                                            if (deleteError) setDeleteError('');
                                        }}
                                        className="delete-otp-input"
                                        autoFocus
                                    />
                                </div>

                                <div className="resend-otp-wrapper">
                                    {resendCooldown > 0 ? (
                                        <span className="resend-timer">Resend OTP in <strong>{resendCooldown}s</strong></span>
                                    ) : (
                                        <button
                                            type="button"
                                            className="resend-otp-btn"
                                            onClick={handleSendDeleteOtp}
                                            disabled={deleteLoading}
                                        >
                                            Resend OTP
                                        </button>
                                    )}
                                </div>

                                <div className="delete-modal-actions">
                                    <button
                                        type="button"
                                        className="cancel-delete-btn"
                                        onClick={handleCloseDeleteModal}
                                        disabled={deleteLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="confirm-delete-btn"
                                        onClick={handleConfirmDelete}
                                        disabled={deleteLoading || deleteOtp.length !== 6}
                                    >
                                        {deleteLoading ? 'Deleting Account...' : 'Permanently Delete Account'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
