// Architect: SP
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/user';

// Get user profile
export const getProfile = async (token) => {
    try {
        const response = await axios.get(`${API_URL}/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw {
            error,
            message: 'Error fetching profile' 
        };
    }
};

// Update user profile
export const updateProfile = async (token, profileData) => {
    try {
        const response = await axios.put(
            `${API_URL}/profile`,
            profileData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw {
            error,
            message: 'Error updating profile' 
        };
    }
};

// Upload profile avatar picture
export const uploadAvatar = async (token, file) => {
    try {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await axios.post(
            `${API_URL}/profile/avatar`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error uploading avatar:', error);
        throw {
            error,
            message: error.response?.data?.message || 'Error uploading profile picture'
        };
    }
};

// Send OTP to registered email for account deletion
export const sendDeleteAccountOtp = async (token) => {
    try {
        const response = await axios.post(
            `${API_URL}/profile/delete-account/send-otp`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error sending delete account OTP:', error);
        throw {
            error,
            message: error.response?.data?.message || 'Error sending deletion OTP'
        };
    }
};

// Verify OTP and permanently delete account
export const verifyAndDeleteAccount = async (token, otp) => {
    try {
        const response = await axios.post(
            `${API_URL}/profile/delete-account/verify-and-delete`,
            { otp },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error deleting account:', error);
        throw {
            error,
            message: error.response?.data?.message || 'Error deleting account'
        };
    }
};

