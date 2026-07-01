// Architect: SP
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, updateProduct, updateProductStock } from '../../../services/adminapi/index';
import { getAllCategories } from '../../../services/adminapi/categoryAPI';
import { uploadImage } from '../../../services/adminapi/uploadAPI';
import { isAdminLoggedIn, getAdminStore } from '../../../services/adminAuthService';
import { toast } from 'react-toastify';
import './ProductForm.css';
import './EditProduct.css';

const EditProduct = () => {
    const { id } = useParams();
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
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [uploadLoading, setUploadLoading] = useState(false);
    const [stockOnly, setStockOnly] = useState(false);
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
                
                // Get admin's store
                const store = getAdminStore();
                if (store) {
                    setAdminStore(store);
                }
                
                await Promise.all([fetchProduct(), fetchCategories()]);
            } catch (error) {
                console.error('Authentication check failed:', error);
                navigate('/admin/login');
            } finally {
                setLoading(false);
            }
        };

        checkAuthAndFetchData();
    }, [id, navigate]);

    const fetchProduct = async () => {
        try {
            const product = await getProduct(id);
            
            // Check if product belongs to admin's store
            const adminStore = getAdminStore();
            if (product.store !== adminStore) {
                setError('You can only edit products from your store');
                navigate('/admin/products');
                return;
            }
            
            setFormData({
                name: product.name || '',
                description: product.description || '',
                category: product.category?._id || product.category || '',
                store: product.store || '',
                new_price: product.new_price || '',
                old_price: product.old_price || '',
                stock: product.stock || '',
                image_url: product.image_url || '',
                size: {
                    breadth: product.size?.breadth || '',
                    height: product.size?.height || ''
                },
                isActive: product.isActive !== undefined ? product.isActive : true
            });
            setImagePreview(product.image_url);
        } catch (error) {
            console.error('Error fetching product:', error);
            if (error.response?.status === 401) {
                handleUnauthorized();
            } else {
                setError('Failed to load product. Please try again.');
            }
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await getAllCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            if (error.response?.status === 401) {
                handleUnauthorized();
            } else {
                setError('Failed to load categories. Please try again.');
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
        setSubmitting(true);
        setError('');

        try {
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

            if (stockOnly) {
                await updateProductStock(id, { stock: productData.stock });
                toast.success('Product stock updated successfully');
            } else {
                await updateProduct(id, productData);
                toast.success('Product updated successfully');
            }
            
            navigate('/admin/products');
        } catch (error) {
            console.error('Error updating product:', error);
            if (error.response?.status === 401) {
                handleUnauthorized();
            } else {
                setError(error.response?.data?.message || 'Failed to update product. Please try again.');
                toast.error('Failed to update product');
            }
        } finally {
            setSubmitting(false);
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

    const toggleStockOnly = () => {
        setStockOnly(!stockOnly);
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading product data...</p>
            </div>
        );
    }

    return (
        <div className="product-form-container edit-product">
            <div className="form-header">
                <h2>Edit Product</h2>
                <div className="stock-toggle">
                    <label>
                        <input
                            type="checkbox"
                            checked={stockOnly}
                            onChange={toggleStockOnly}
                        />
                        Update Stock Only
                    </label>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit} className="product-form">
                {!stockOnly ? (
                    <>
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
                                disabled={submitting}
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
                                disabled={submitting}
                            />
                        </div>
                    </>
                ) : null}

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
                        disabled={submitting}
                    />
                </div>

                {!stockOnly ? (
                    <>
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
                                        disabled={submitting}
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
                                        disabled={submitting}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="image">Product Image</label>
                            <input
                                type="file"
                                id="image"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={submitting || uploadLoading}
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
                                    disabled={submitting}
                                />
                                Active (Product will be visible to customers)
                            </label>
                        </div>
                    </>
                ) : null}

                <div className="form-actions">
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={submitting || uploadLoading}
                    >
                        {submitting ? 'Updating...' : stockOnly ? 'Update Stock' : 'Update Product'}
                    </button>
                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => navigate('/admin/products')}
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProduct;
