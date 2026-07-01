// Architect: SP
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct, getAllCategories } from '../../../services/adminapi/index';
import { createCategory } from '../../../services/adminapi/categoryAPI';
import { uploadImage } from '../../../services/adminapi/uploadAPI';
import { isAdminLoggedIn, getAdminStore } from '../../../services/adminAuthService';
import './ProductForm.css';

const ProductForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        store: '',
        new_price: '',
        old_price: '',
        stock: '',
        image_url: '',
        size: {
            breadth: '',
            height: ''
        },
        isActive: true
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [showCategoryInput, setShowCategoryInput] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [adminStore, setAdminStore] = useState('');
    const stores = ['entrepreneur 1', 'entrepreneur 3', 'entrepreneur 2'];

    useEffect(() => {
        const checkAuthAndFetchData = async () => {
            try {
                const isLoggedIn = await isAdminLoggedIn();
                if (!isLoggedIn) {
                    navigate('/admin/login');
                    return;
                }
                
                // Get admin's store and set it in the form
                const store = getAdminStore();
                if (store) {
                    setAdminStore(store);
                    setFormData(prev => ({ ...prev, store }));
                }
                
                await fetchCategories();
            } catch (error) {
                console.error('Authentication check failed:', error);
                navigate('/admin/login');
            } finally {
                setLoading(false);
            }
        };

        checkAuthAndFetchData();
    }, [navigate]);

    const fetchCategories = async () => {
        try {
            const data = await getAllCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            if (error.response?.status === 401) {
                handleUnauthorized();
            } else {
                setError('Failed to load categories. Please refresh the page.');
            }
        }
    };

    const handleUnauthorized = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === 'breadth' || name === 'height') {
            setFormData(prev => ({
                ...prev,
                size: {
                    ...prev.size,
                    [name]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate form data
            if (!formData.image_url) {
                throw new Error('Please upload a product image');
            }

            const productData = {
                ...formData,
                new_price: parseFloat(formData.new_price),
                old_price: parseFloat(formData.old_price),
                stock: parseInt(formData.stock, 10),
                size: {
                    breadth: parseFloat(formData.size.breadth),
                    height: parseFloat(formData.size.height)
                }
            };

            await createProduct(productData);
            navigate('/admin/products'); 
        } catch (error) {
            console.error('Error creating product:', error);
            if (error.response?.status === 401) {
                handleUnauthorized();
            } else {
                setError(error.response?.data?.message || 'Failed to create product. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) {
            setError('Category name cannot be empty');
            return;
        }

        setLoading(true);
        try {
            const response = await createCategory({ name: newCategory.trim() });
            setCategories([...categories, response]);
            setFormData(prev => ({ ...prev, category: response._id }));
            setNewCategory('');
            setShowCategoryInput(false);
            setError('');
        } catch (error) {
            console.error('Error creating category:', error);
            setError(error.response?.data?.message || 'Failed to create category');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB');
            return;
        }

        setUploadLoading(true);
        setError('');

        try {
            const result = await uploadImage(file);
            const fileUrl = result.fileUrl;
            setFormData(prev => ({ ...prev, image_url: fileUrl }));
            setImagePreview(URL.createObjectURL(file));
        } catch (error) {
            console.error('Error uploading image:', error);
            setError(error.response?.data?.message || 'Failed to upload image');
            // Clear the file input on error
            e.target.value = '';
        } finally {
            setUploadLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="product-form-container">
            <h2>Add New Product</h2>
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit} className="product-form">
                <div className="form-group">
                    <label htmlFor="name">Product Name *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description *</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category">Category *</label>
                    <div className="category-input-group">
                        {showCategoryInput ? (
                            <div className="new-category-input">
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    placeholder="Enter new category name"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCategory}
                                    disabled={loading || !newCategory.trim()}
                                    className="add-category-btn"
                                >
                                    Add
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCategoryInput(false);
                                        setNewCategory('');
                                    }}
                                    className="cancel-btn"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(category => (
                                        <option key={category._id} value={category._id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setShowCategoryInput(true)}
                                    className="new-category-btn"
                                    disabled={loading}
                                >
                                    New Category
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="store">Store *</label>
                    <input
                        type="text"
                        id="store"
                        name="store"
                        value={formData.store ? formData.store.charAt(0).toUpperCase() + formData.store.slice(1) : ''}
                        disabled={true}
                        readOnly
                        className="readonly-field"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="new_price">New Price (₹) *</label>
                    <input
                        type="number"
                        id="new_price"
                        name="new_price"
                        value={formData.new_price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="old_price">Old Price (₹) *</label>
                    <input
                        type="number"
                        id="old_price"
                        name="old_price"
                        value={formData.old_price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="stock">Stock Quantity *</label>
                    <input
                        type="number"
                        id="stock"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        min="0"
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group size-group">
                    <label>Size (cm) *</label>
                    <div className="size-inputs">
                        <div>
                            <label htmlFor="breadth">Breadth:</label>
                            <input
                                type="number"
                                id="breadth"
                                name="breadth"
                                value={formData.size.breadth}
                                onChange={handleChange}
                                min="0"
                                step="0.1"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label htmlFor="height">Height:</label>
                            <input
                                type="number"
                                id="height"
                                name="height"
                                value={formData.size.height}
                                onChange={handleChange}
                                min="0"
                                step="0.1"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="image">Product Image *</label>
                    <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={loading || uploadLoading}
                    />
                    {uploadLoading && <div className="upload-loading">Uploading...</div>}
                    {imagePreview && (
                        <div className="image-preview">
                            <img src={imagePreview} alt="Product preview" />
                        </div>
                    )}
                </div>

                <div className="form-group checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        Active (Product will be visible to customers)
                    </label>
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading || uploadLoading}
                    >
                        {loading ? 'Creating...' : 'Create Product'}
                    </button>
                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => navigate('/admin/products')}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
