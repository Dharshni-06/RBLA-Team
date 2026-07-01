import React, { useState, useEffect } from "react";
import axios from "axios";
import "./adminregistration.css"; // Import CSS file

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000); // Auto close after 5 seconds
        
        return () => clearTimeout(timer);
    }, [onClose]);
    
    return (
        <div className={`toast-notification toast-${type}`}>
            <div className="toast-content">
                <span className="toast-icon">
                    {type === 'success' ? '✅' : '❌'}
                </span>
                <span>{message}</span>
            </div>
            <button className="toast-close" onClick={onClose}>
                ×
            </button>
        </div>
    );
};

// Admin List Modal Component
const AdminListModal = ({ isOpen, onClose }) => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchAdmins();
        }
    }, [isOpen]);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Get the authentication token
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError("Authentication required. Please log in as a superadmin.");
                setLoading(false);
                return;
            }
            
            const response = await axios.get("/api/superadmin/admins", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log("Admins data:", response.data);
            setAdmins(response.data.data || []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching admins:", error);
            setError(error.response?.data?.message || "Failed to load admins");
            setLoading(false);
        }
    };

    // Format date to readable format
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // If modal is not open, don't render anything
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>
                
                <div className="modal-header">
                    <h2>Admin List</h2>
                </div>
                
                {loading ? (
                    <p>Loading admins...</p>
                ) : error ? (
                    <p className="error-message">{error}</p>
                ) : admins.length === 0 ? (
                    <p className="admin-list-empty">No admins found</p>
                ) : (
                    <table className="admin-list-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Store</th>
                                <th>Aadhar</th>
                                <th>Status</th>
                                <th>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map(admin => (
                                <tr key={admin._id}>
                                    <td>{admin.name}</td>
                                    <td>{admin.username}</td>
                                    <td>{admin.email}</td>
                                    <td>{admin.phoneNumber}</td>
                                    <td>{admin.storeName}</td>
                                    <td>{admin.aadharNumber ? 
                                        // Show first 4 digits and mask the rest
                                        `${admin.aadharNumber.substring(0, 4)}${'*'.repeat(8)}` 
                                        : 'N/A'}
                                    </td>
                                    <td>
                                        <span className={`admin-status ${admin.isActive ? 'admin-active' : 'admin-inactive'}`}>
                                            {admin.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>{admin.createdAt ? formatDate(admin.createdAt) : 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

const AdminRegistration = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        username: "",
        aadharNumber: "",
        storeName: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const [showAdminList, setShowAdminList] = useState(false);

    // Available stores
    const storeOptions = [
        { value: "entrepreneur 1", label: "Entrepreneur 1" },
        { value: "entrepreneur 3", label: "Entrepreneur 3" },
        { value: "entrepreneur 2", label: "Entrepreneur 2" }
    ];

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // If store is changed, update username format hint
        if (name === "storeName") {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                // Clear username if store changes
                username: ""
            }));
        } else if (name === "username" && formData.storeName) {
            // Auto-format username to include @storeName
            const baseUsername = value.split("@")[0]; // Get part before @ if exists
            setFormData(prev => ({
                ...prev,
                username: baseUsername ? `${baseUsername}@${formData.storeName}` : value
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Show toast notification
    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
    };

    // Hide toast notification
    const hideToast = () => {
        setToast({ ...toast, show: false });
    };

    // Toggle admin list modal
    const toggleAdminList = () => {
        setShowAdminList(prev => !prev);
    };

    // Validate the form
    const validate = () => {
        let newErrors = {};
        
        // Name validation
        if (!formData.name) {
            newErrors.name = "Full Name is required";
            console.log("Validation failed: Name is required");
        }
        
        // Email validation
        if (!formData.email) {
            newErrors.email = "Email is required";
            console.log("Validation failed: Email is required");
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
            console.log("Validation failed: Invalid email format");
        }
        
        // Phone validation
        if (!formData.phoneNumber) {
            newErrors.phoneNumber = "Phone Number is required";
            console.log("Validation failed: Phone number is required");
        } else if (!/^[0-9]{10}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = "Phone number must be 10 digits";
            console.log("Validation failed: Phone number must be 10 digits, got:", formData.phoneNumber);
        }
        
        // Username validation
        if (!formData.username) {
            newErrors.username = "Username is required";
            console.log("Validation failed: Username is required");
        } else if (formData.storeName && !new RegExp(`^[a-zA-Z0-9_]+@${formData.storeName}$`).test(formData.username)) {
            newErrors.username = `Username must be in format: username@${formData.storeName}`;
            console.log(`Validation failed: Username must be in format username@${formData.storeName}, got:`, formData.username);
        }
        
        // Aadhar validation
        if (!formData.aadharNumber) {
            newErrors.aadharNumber = "Aadhar Number is required";
            console.log("Validation failed: Aadhar number is required");
        } else if (!/^[0-9]{12}$/.test(formData.aadharNumber)) {
            newErrors.aadharNumber = "Aadhar number must be 12 digits";
            console.log("Validation failed: Aadhar number must be 12 digits, got:", formData.aadharNumber, "Length:", formData.aadharNumber.length);
        }
        
        // Store validation
        if (!formData.storeName) {
            newErrors.storeName = "Store selection is required";
            console.log("Validation failed: Store selection is required");
        }
        
        // Password validation
        if (!formData.password) {
            newErrors.password = "Password is required";
            console.log("Validation failed: Password is required");
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters long";
            console.log("Validation failed: Password must be at least 6 characters");
        }
        
        // Confirm password validation
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
            console.log("Validation failed: Passwords do not match");
        }

        setErrors(newErrors);
        const isValid = Object.keys(newErrors).length === 0;
        console.log("Form validation result:", isValid ? "Valid" : "Invalid");
        return isValid;
    };

    // Get token from localStorage
    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form data before validation:", formData);
        
        if (validate()) {
            console.log("Validation passed, proceeding with submission");
            setIsLoading(true);
            setErrorMessage("");
            setSuccessMessage("");
            
            try {
                // Remove confirmPassword before sending to API
                const { confirmPassword, ...adminData } = formData;
                console.log("Data being sent to API:", adminData);
                
                // Get the authentication token
                const token = getAuthToken();
                console.log("Auth token retrieved:", token ? "Token exists" : "No token found");
                
                if (!token) {
                    setErrorMessage("You must be logged in as a superadmin to create an admin account.");
                    showToast("Login required. Please log in as a superadmin first.", "error");
                    setIsLoading(false);
                    return;
                }
                
                // Make the API request with the token in the header
                console.log("Sending request to /api/superadmin/admins");
                const response = await axios.post("/api/superadmin/admins", adminData, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                console.log("API Response:", response.data);
                setSuccessMessage("Admin registered successfully!");
                showToast(`Admin ${adminData.name} (${adminData.username}) was registered successfully!`, "success");
                
                // Reset form
                setFormData({
                    name: "",
                    email: "",
                    phoneNumber: "",
                    username: "",
                    aadharNumber: "",
                    storeName: "",
                    password: "",
                    confirmPassword: "",
                });
            } catch (error) {
                console.error("Registration error details:", error);
                console.log("Error response data:", error.response?.data);
                console.log("Error status:", error.response?.status);
                console.log("Error headers:", error.response?.headers);
                
                const errorMsg = error.response?.data?.message || 
                    "Failed to register admin. Please make sure you're logged in as a superadmin.";
                    
                setErrorMessage(errorMsg);
                showToast(errorMsg, "error");
            } finally {
                setIsLoading(false);
            }
        } else {
            console.log("Validation failed. Errors:", errors);
            showToast("Please fix the errors in the form before submitting.", "error");
        }
    };

    // Component initialization
    useEffect(() => {
        // Check if superadmin is logged in
        const token = localStorage.getItem('token');
        console.log("Component mounted, token exists:", !!token);
        
        // You could also validate the token here if needed
    }, []);

    return (
        <div className="admin-registration-page">
            <h2>Admin Registration</h2>
            <p>Create a store admin account</p>
            
            {successMessage && <div className="success-message">{successMessage}</div>}
            {errorMessage && <div className="error-message global-error">{errorMessage}</div>}
            {toast.show && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
            
            {/* View Admins Button */}
            <button type="button" className="view-admins-btn" onClick={toggleAdminList}>
                View All Admins
            </button>
            
            {/* Admin List Modal */}
            <AdminListModal isOpen={showAdminList} onClose={toggleAdminList} />
            
            <form onSubmit={handleSubmit}>
                {/* Full Name */}
                <label>Full Name <span className="required">*</span></label>
                <input 
                    type="text" 
                    name="name" 
                    value={formData.name}
                    placeholder="Enter full name" 
                    onChange={handleChange} 
                    className={errors.name ? "error" : ""} 
                />
                {errors.name && <p className="error-message">{errors.name}</p>}

                {/* Email & Phone in Two Columns */}
                <div className="input-group">
                    <div>
                        <label>Email <span className="required">*</span></label>
                        <input 
                            type="email" 
                            name="email" 
                            value={formData.email}
                            placeholder="Enter email" 
                            onChange={handleChange} 
                            className={errors.email ? "error" : ""} 
                        />
                        {errors.email && <p className="error-message">{errors.email}</p>}
                    </div>
                    <div>
                        <label>Phone Number <span className="required">*</span></label>
                        <input 
                            type="text" 
                            name="phoneNumber" 
                            value={formData.phoneNumber}
                            placeholder="10-digit phone number" 
                            onChange={handleChange} 
                            className={errors.phoneNumber ? "error" : ""} 
                        />
                        {errors.phoneNumber && <p className="error-message">{errors.phoneNumber}</p>}
                    </div>
                </div>

                {/* Store Name Dropdown - Must be selected before username */}
                <label>Store Name <span className="required">*</span></label>
                <select 
                    name="storeName" 
                    value={formData.storeName}
                    onChange={handleChange} 
                    className={errors.storeName ? "error" : ""}
                >
                    <option value="">Select a store</option>
                    {storeOptions.map(store => (
                        <option key={store.value} value={store.value}>{store.label}</option>
                    ))}
                </select>
                {errors.storeName && <p className="error-message">{errors.storeName}</p>}

                {/* Username with format hint */}
                <label>
                    Username <span className="required">*</span>
                    {formData.storeName && (
                        <span className="hint"> (Format: username@{formData.storeName})</span>
                    )}
                </label>
                <input 
                    type="text" 
                    name="username" 
                    value={formData.username}
                    placeholder={formData.storeName ? `username@${formData.storeName}` : "Choose a username"} 
                    onChange={handleChange} 
                    className={errors.username ? "error" : ""} 
                    disabled={!formData.storeName}
                />
                {!formData.storeName && <p className="hint-message">Select a store first</p>}
                {errors.username && <p className="error-message">{errors.username}</p>}

                {/* Aadhar Card Number */}
                <label>Aadhar Card Number <span className="required">*</span></label>
                <input 
                    type="text" 
                    name="aadharNumber" 
                    value={formData.aadharNumber}
                    placeholder="12-digit Aadhar number" 
                    onChange={(e) => {
                        // Only allow digits
                        const value = e.target.value.replace(/\D/g, '');
                        // Limit to 12 digits
                        const trimmedValue = value.slice(0, 12);
                        console.log("Aadhar input:", trimmedValue, "Length:", trimmedValue.length);
                        setFormData(prev => ({ ...prev, aadharNumber: trimmedValue }));
                    }} 
                    className={errors.aadharNumber ? "error" : ""} 
                />
                {errors.aadharNumber && <p className="error-message">{errors.aadharNumber}</p>}

                {/* Password & Confirm Password in Two Columns */}
                <div className="input-group">
                    <div>
                        <label>Password <span className="required">*</span></label>
                        <input 
                            type="password" 
                            name="password" 
                            value={formData.password}
                            placeholder="Minimum 6 characters" 
                            onChange={handleChange} 
                            className={errors.password ? "error" : ""} 
                        />
                        {errors.password && <p className="error-message">{errors.password}</p>}
                    </div>
                    <div>
                        <label>Confirm Password <span className="required">*</span></label>
                        <input 
                            type="password" 
                            name="confirmPassword" 
                            value={formData.confirmPassword}
                            placeholder="Confirm password" 
                            onChange={handleChange} 
                            className={errors.confirmPassword ? "error" : ""} 
                        />
                        {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
                    </div>
                </div>

                {/* Submit Button */}
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Registering..." : "Register Admin"}
                </button>
            </form>
        </div>
    );
};

export default AdminRegistration;
