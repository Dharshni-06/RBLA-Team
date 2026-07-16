import React, { useState, useEffect } from 'react';
import { 
    getAllProducts, 
    toggleProductActive, 
    deleteProduct,
    updateAllProductStocks
} from '../../../services/superadmin/productAPI';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../../services/superadmin/categoryAPI';
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaPlus } from 'react-icons/fa';
import './ProductList.css';
import ProductForm from './ProductForm';
import EditProduct from './EditProduct';

const ProductList = ({ initialSearch = '' }) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState({
        category: '',
        isActive: '',
        store: '',
        search: initialSearch || ''
    });

    useEffect(() => {
        if (initialSearch !== undefined) {
            setFilter(prev => ({ ...prev, search: initialSearch }));
        }
    }, [initialSearch]);
    const [bulkStock, setBulkStock] = useState('');
    const [updateLoading, setUpdateLoading] = useState(false);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);
    const stores = ['entrepreneur 1', 'entrepreneur 3', 'entrepreneur 2'];

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    useEffect(() => {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.scrollTop = 0;
        }
        window.scrollTo(0, 0);
    }, [showAddProduct, editingProduct]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            console.log('Fetching products with filter:', filter);
            const data = await getAllProducts(filter);
            console.log('Fetched products:', data);
            setProducts(data);
            setError('');
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to load products. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await getAllCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            await createCategory({ name: newCategory });
            setNewCategory('');
            setShowAddCategory(false);
            await fetchCategories();
        } catch (error) {
            console.error('Error adding category:', error);
            setError('Failed to add category. Please try again.');
        }
    };

    const handleUpdateCategory = async (id, name) => {
        try {
            await updateCategory(id, { name });
            setEditingCategory(null);
            await fetchCategories();
        } catch (error) {
            console.error('Error updating category:', error);
            setError('Failed to update category. Please try again.');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await deleteCategory(id);
                await fetchCategories();
            } catch (error) {
                console.error('Error deleting category:', error);
                setError('Failed to delete category. Please try again.');
            }
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const applyFilters = async () => {
        await fetchProducts();
    };

    const resetFilters = () => {
        setFilter({
            category: '',
            isActive: '',
            store: '',
            search: ''
        });
    };

    const handleToggleActive = async (productId) => {
        try {
            setLoading(true);
            await toggleProductActive(productId);
            await fetchProducts();
            setError('');
        } catch (error) {
            console.error('Error toggling product status:', error);
            setError('Failed to update product status. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                setLoading(true);
                await deleteProduct(productId);
                await fetchProducts();
                setError('');
            } catch (error) {
                console.error('Error deleting product:', error);
                setError('Failed to delete product. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleBulkStockUpdate = async () => {
        if (!bulkStock || isNaN(bulkStock) || parseInt(bulkStock) < 0) {
            setError('Please enter a valid stock number');
            return;
        }

        try {
            setUpdateLoading(true);
            await updateAllProductStocks(parseInt(bulkStock), filter.store || null);
            await fetchProducts();
            setBulkStock('');
            setError('');
        } catch (error) {
            console.error('Error updating stocks:', error);
            setError('Failed to update stocks. Please try again.');
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setShowAddProduct(false);
    };

    const handleAddNew = () => {
        setShowAddProduct(true);
        setEditingProduct(null);
    };

    const handleBack = () => {
        setShowAddProduct(false);
        setEditingProduct(null);
        fetchProducts();
    };

    if (showAddProduct) {
        return <ProductForm onBack={handleBack} />;
    }

    if (editingProduct) {
        return <EditProduct product={editingProduct} onBack={handleBack} />;
    }

    if (loading && products.length === 0) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading products...</p>
            </div>
        );
    }

    return (
        <div className="product-list-container">
            <h1>Product Management</h1>
            {error && <div className="error-message">{error}</div>}
            
            {/* Category Management Section */}
            <div className="category-section">
                <h2>Categories</h2>
                <button onClick={() => setShowAddCategory(!showAddCategory)} className="add-button">
                    <FaPlus /> Add Category
                </button>
                
                {showAddCategory && (
                    <form onSubmit={handleAddCategory} className="category-form">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="Enter category name"
                            required
                        />
                        <button type="submit">Add</button>
                    </form>
                )}
                
                <div className="categories-list">
                    {categories.map(category => (
                        <div key={category._id} className="category-item">
                            {editingCategory === category._id ? (
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    handleUpdateCategory(category._id, e.target.name.value);
                                }}>
                                    <input
                                        name="name"
                                        defaultValue={category.name}
                                        required
                                    />
                                    <button type="submit">Save</button>
                                    <button type="button" onClick={() => setEditingCategory(null)}>Cancel</button>
                                </form>
                            ) : (
                                <>
                                    <span>{category.name}</span>
                                    <div className="category-actions">
                                        <button onClick={() => setEditingCategory(category._id)}>
                                            <FaEdit />
                                        </button>
                                        <button onClick={() => handleDeleteCategory(category._id)}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Existing Product Management Section */}
            <div className="product-list-header">
                <h2>All Products</h2>
                <button className="add-product-btn" onClick={handleAddNew}>
                    <FaPlus /> Add New Product
                </button>
            </div>

            <div className="filters-section">
                <div className="filters">
                    <select
                        name="store"
                        value={filter.store}
                        onChange={handleFilterChange}
                        disabled={loading}
                    >
                        <option value="">All Stores</option>
                        {stores.map(store => (
                            <option key={store} value={store}>
                                {store.charAt(0).toUpperCase() + store.slice(1)}
                            </option>
                        ))}
                    </select>
                    <select
                        name="category"
                        value={filter.category}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                            <option key={category._id} value={category._id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <select
                        name="isActive"
                        value={filter.isActive}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                    <input
                        type="text"
                        name="search"
                        value={filter.search || ''}
                        onChange={handleFilterChange}
                        placeholder="Search by product name..."
                    />
                    <div className="bulk-stock-update">
                        <input
                            type="number"
                            min="0"
                            value={bulkStock}
                            onChange={(e) => setBulkStock(e.target.value)}
                            placeholder="Enter stock value"
                            disabled={updateLoading}
                        />
                        <button 
                            onClick={handleBulkStockUpdate}
                            disabled={updateLoading || !bulkStock}
                            className="update-stock-btn"
                        >
                            {updateLoading ? 'Updating...' : 'Update All Stocks'}
                        </button>
                    </div>
                </div>
                <div className="filter-actions">
                    <button onClick={applyFilters} disabled={loading} className="apply-filters-btn">
                        Apply Filters
                    </button>
                    <button onClick={resetFilters} disabled={loading} className="reset-filters-btn">
                        Reset
                    </button>
                </div>
            </div>

            {products.length === 0 ? (
                <div className="no-products">
                    <p>No products found. Try adjusting your filters or add a new product.</p>
                </div>
            ) : (
                <div className="product-table-wrapper">
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Store</th>
                                <th>Category</th>
                                <th>Price (₹)</th>
                                <th>Size (B×H)</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Sentiment</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                             {products.filter(product => {
                                 if (!filter.search) return true;
                                 return product.name.toLowerCase().includes(filter.search.toLowerCase());
                             }).map(product => (
                                <tr key={product._id} className={!product.isActive ? 'inactive-product' : ''}>
                                    <td>
                                        <div className="product-image">
                                            <img 
                                                src={`http://localhost:5000${product.image_url}`}
                                                alt={product.name}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/placeholder.png';
                                                }}
                                            />
                                        </div>
                                    </td>
                                    <td>{product.name}</td>
                                    <td>{product.store.charAt(0).toUpperCase() + product.store.slice(1)}</td>
                                    <td>{product.category?.name || 'N/A'}</td>
                                    <td>
                                        <div className="price-info">
                                            <span className="new-price">₹{product.new_price}</span>
                                            {product.old_price && (
                                                <span className="old-price">₹{product.old_price}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="size-info">
                                            {product.size ? `${product.size.breadth}×${product.size.height}` : 'N/A'}
                                        </div>
                                    </td>
                                    <td className={product.stock < 5 ? 'low-stock' : ''}>{product.stock}</td>
                                    <td>
                                        <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                                            {product.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        {product.sentiment ? (
                                            <span className={`sentiment-badge ${product.sentiment.toLowerCase()}`}>
                                                {product.sentiment.charAt(0).toUpperCase() + product.sentiment.slice(1)}
                                            </span>
                                        ) : (
                                            <span className="sentiment-badge neutral">N/A</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                onClick={() => handleEdit(product)}
                                                className="edit-btn"
                                                title="Edit"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button 
                                                onClick={() => handleToggleActive(product._id)}
                                                className={`toggle-btn ${product.isActive ? 'active' : 'inactive'}`}
                                                title={product.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                {product.isActive ? <FaToggleOn /> : <FaToggleOff />}
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(product._id)}
                                                className="delete-btn"
                                                title="Delete"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ProductList;
