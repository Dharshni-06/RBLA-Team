import React, { useState, useEffect } from 'react';
import { createProduct } from '../../../services/superadmin/productAPI';
import { getAllCategories, createCategory } from '../../../services/superadmin/categoryAPI';
import { uploadImage } from '../../../services/superadmin/uploadAPI';
import { FaArrowLeft, FaUpload, FaPlus } from 'react-icons/fa';
import './ProductForm.css';

const ProductForm = ({ onBack }) => {
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
    
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [showCategoryInput, setShowCategoryInput] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const stores = ['entrepreneur 1', 'entrepreneur 3', 'entrepreneur 2'];

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await getAllCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Failed to load categories. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('Please upload a valid image file (JPEG, PNG, WebP)');
            return;
        }

        try {
            setUploadLoading(true);
            const imageUrl = await uploadImage(file);
            setFormData(prev => ({
                ...prev,
                image_url: imageUrl
            }));
            setError('');
        } catch (error) {
            console.error('Error uploading image:', error);
            setError('Failed to upload image. Please try again.');
        } finally {
            setUploadLoading(false);
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) {
            setError('Please enter a category name');
            return;
        }

        try {
            setLoading(true);
            const createdCategory = await createCategory({ name: newCategory });
            setCategories(prev => [...prev, createdCategory]);
            setFormData(prev => ({
                ...prev,
                category: createdCategory._id
            }));
            setNewCategory('');
            setShowCategoryInput(false);
            setError('');
        } catch (error) {
            console.error('Error creating category:', error);
            setError('Failed to create category. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form data
        if (!formData.name || !formData.description || !formData.category || 
            !formData.store || !formData.new_price || !formData.stock) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);
            setError('');
            
            // Format data for API
            const productData = {
                ...formData,
                new_price: parseFloat(formData.new_price),
                old_price: formData.old_price ? parseFloat(formData.old_price) : undefined,
                stock: parseInt(formData.stock)
            };
            
            await createProduct(productData);
            setSuccess('Product created successfully!');
            
            // Reset form after success
            setFormData({
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
            
            // Go back to product list after 2 seconds
            setTimeout(() => {
                onBack();
            }, 2000);
            
        } catch (error) {
            console.error('Error creating product:', error);
            setError('Failed to create product. Please try again.');
        } finally {
            setSubmitting(false);
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
            <div className="form-header">
                <button className="back-button" onClick={onBack}>
                    <FaArrowLeft /> Back to Products
                </button>
                <h2>Add New Product</h2>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
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
                        disabled={submitting}
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
                        disabled={submitting}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category">Category *</label>
                    {showCategoryInput ? (
                        <div className="new-category-form">
                            <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="Enter new category name"
                                disabled={loading}
                            />
                            <div className="category-form-actions">
                                <button
                                    type="button"
                                    onClick={handleCreateCategory}
                                    className="save-category-btn"
                                    disabled={loading || !newCategory.trim()}
                                >
                                    <FaPlus /> Add
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCategoryInput(false)}
                                    className="cancel-btn"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                disabled={submitting}
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

                <div className="form-group">
                    <label htmlFor="store">Store *</label>
                    <select
                        id="store"
                        name="store"
                        value={formData.store}
                        onChange={handleChange}
                        required
                        disabled={submitting}
                    >
                        <option value="">Select a store</option>
                        {stores.map(store => (
                            <option key={store} value={store}>
                                {store.charAt(0).toUpperCase() + store.slice(1)}
                            </option>
                        ))}
                    </select>
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
                        disabled={submitting}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="old_price">Old Price (₹) (Optional)</label>
                    <input
                        type="number"
                        id="old_price"
                        name="old_price"
                        value={formData.old_price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        disabled={submitting}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="stock">Stock *</label>
                    <input
                        type="number"
                        id="stock"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        min="0"
                        required
                        disabled={submitting}
                    />
                </div>

                <div className="form-group">
                    <label>Size (Optional)</label>
                    <div className="size-inputs">
                        <div>
                            <label htmlFor="size.breadth">Breadth (cm)</label>
                            <input
                                type="number"
                                id="size.breadth"
                                name="size.breadth"
                                value={formData.size.breadth}
                                onChange={handleChange}
                                min="0"
                                step="0.1"
                                disabled={submitting}
                            />
                        </div>
                        <div>
                            <label htmlFor="size.height">Height (cm)</label>
                            <input
                                type="number"
                                id="size.height"
                                name="size.height"
                                value={formData.size.height}
                                onChange={handleChange}
                                min="0"
                                step="0.1"
                                disabled={submitting}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="image">Product Image</label>
                    <div className="image-upload-container">
                        {formData.image_url ? (
                            <div className="image-preview">
                                <img src={formData.image_url} alt="Product preview" />
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                                    className="remove-image-btn"
                                    disabled={submitting}
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div className="upload-area">
                                <input
                                    type="file"
                                    id="image"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploadLoading || submitting}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="image" className="upload-label">
                                    {uploadLoading ? (
                                        <>
                                            <div className="spinner-small"></div>
                                            <span>Uploading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaUpload />
                                            <span>Click to upload image</span>
                                        </>
                                    )}
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-group checkbox-group">
                    <label>
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleChange}
                            disabled={submitting}
                        />
                        Active (Product will be visible to customers)
                    </label>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={onBack}
                        className="cancel-button"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="submit-button"
                        disabled={submitting || uploadLoading}
                    >
                        {submitting ? 'Creating...' : 'Create Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
