import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { authEvents, AUTH_EVENTS } from '../services/userapi/authEvents';
import { getProfile } from '../services/userapi/profileService';

// API URL
const API_URL = 'http://localhost:5000/api/user/auth';

// Action Types
const USER_ACTIONS = {
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGOUT: 'LOGOUT',
    UPDATE_USER: 'UPDATE_USER',
    SET_LOADING: 'SET_LOADING',
    AUTH_ERROR: 'AUTH_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR'
};

// Initial state
const initialState = {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: false,
    error: null
};

// Create context
const UserContext = createContext(initialState);

// Reducer function
const userReducer = (state, action) => {
    switch (action.type) {
        case USER_ACTIONS.LOGIN_SUCCESS:
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                loading: false,
                error: null
            };
        case USER_ACTIONS.LOGOUT:
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                loading: false,
                error: null
            };
        case USER_ACTIONS.UPDATE_USER:
            return {
                ...state,
                user: { ...state.user, ...action.payload },
                loading: false
            };
        case USER_ACTIONS.SET_LOADING:
            return {
                ...state,
                loading: action.payload
            };
        case USER_ACTIONS.AUTH_ERROR:
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                loading: false,
                error: action.payload
            };
        case USER_ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null
            };
        default:
            return state;
    }
};

// Provider component
export const UserProvider = ({ children }) => {
    const [state, dispatch] = useReducer(userReducer, initialState);

    // Check token and load user
    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                dispatch({ type: USER_ACTIONS.LOGOUT });
                return;
            }

            try {
                dispatch({ type: USER_ACTIONS.SET_LOADING, payload: true });
                const profileRes = await getProfile(token);
                if (profileRes.success) {
                    dispatch({
                        type: USER_ACTIONS.LOGIN_SUCCESS,
                        payload: { user: profileRes.data, token }
                    });
                } else {
                    dispatch({
                        type: USER_ACTIONS.LOGIN_SUCCESS,
                        payload: { user: { isAuthenticated: true }, token }
                    });
                }
            } catch (error) {
                console.error('Error loading user profile:', error);
                // In case of profile fetch failure (e.g. token expired), log out the user
                localStorage.removeItem('token');
                authEvents.notify(AUTH_EVENTS.LOGOUT);
                dispatch({
                    type: USER_ACTIONS.AUTH_ERROR,
                    payload: 'Authentication failed. Please login again.'
                });
            }
        };

        loadUser();
    }, []);

    // Login user
    const login = async (credentials) => {
        try {
            dispatch({ type: USER_ACTIONS.SET_LOADING, payload: true });
            const response = await axios.post(`${API_URL}/login`, {
                email: credentials.email,
                password: credentials.password
            });
            
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                authEvents.notify(AUTH_EVENTS.LOGIN);
                
                try {
                    const profileRes = await getProfile(response.data.token);
                    if (profileRes.success) {
                        dispatch({
                            type: USER_ACTIONS.LOGIN_SUCCESS,
                            payload: { user: profileRes.data, token: response.data.token }
                        });
                        return true;
                    }
                } catch (profileErr) {
                    console.error('Error fetching profile on login:', profileErr);
                }

                dispatch({
                    type: USER_ACTIONS.LOGIN_SUCCESS,
                    payload: { user: { email: credentials.email, isAuthenticated: true }, token: response.data.token }
                });
                return true;
            }
            return false;
        } catch (error) {
            localStorage.removeItem('token');
            authEvents.notify(AUTH_EVENTS.LOGOUT);
            dispatch({
                type: USER_ACTIONS.AUTH_ERROR,
                payload: error.response?.data?.message || 'Login failed'
            });
            return false;
        }
    };

    // Logout user
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');  
        authEvents.notify(AUTH_EVENTS.LOGOUT);
        dispatch({ type: USER_ACTIONS.LOGOUT });
    };

    // Update user
    const updateUser = async (updates) => {
        try {
            dispatch({ type: USER_ACTIONS.SET_LOADING, payload: true });
            const response = await axios.put(`${API_URL}/update`, updates, {
                headers: { Authorization: `Bearer ${state.token}` }
            });
            dispatch({
                type: USER_ACTIONS.UPDATE_USER,
                payload: response.data
            });
            return true;
        } catch (error) {
            dispatch({
                type: USER_ACTIONS.AUTH_ERROR,
                payload: error.response?.data?.message || 'Update failed'
            });
            return false;
        }
    };

    // Clear error
    const clearError = () => {
        dispatch({ type: USER_ACTIONS.CLEAR_ERROR });
    };

    return (
        <UserContext.Provider
            value={{
                ...state,
                login,
                logout,
                updateUser,
                clearError
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

// Custom hook for using the user context
export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export default UserContext;
