// Architect: SP
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    getAllProducts, 
    toggleProductActive, 
    deleteProduct,
    updateAllProductStocks
} from '../../../services/adminapi/index';
import { isAdminLoggedIn, getAdminStore } from '../../../services/adminAuthService';
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import './ProductList.css';

const ProductList = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [adminStore, setAdminStore] = useState('');
    const [filter, setFilter] = useState({
        category: '',
        isActive: ''
    });
    const [bulkStock, setBulkStock] = useState('');
    const [updateLoading, setUpdateLoading] = useState(false);

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
                
                await fetchProducts();
            } catch (error) {
                console.error('Authentication check failed:', error);
                navigate('/admin/login');
            }
        };
        checkAuthAndFetchData();
    }, [navigate]);

    const handleUnauthorized = () => {
        // Clear any error state
        setError('');
        setLoading(false);
        // Redirect to login
        navigate('/admin/login');
    };

    const fetchProducts = async () => {
        try {
            const queryParams = {};
            if (filter.category) queryParams.category = filter.category;
            if (filter.isActive !== '') queryParams.isActive = filter.isActive;

            const data = await getAllProducts(queryParams);
            setProducts(data);
            setError('');
        } catch (error) {
            console.error('Error fetching products:', error);
            if (error.response?.status === 401) {
                handleUnauthorized();
            } else {
                setError('Failed to load products. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = async (e) => {
        const { name, value } = e.target;
        setFilter(prev => ({
            ...prev,
            [name]: value
        }));
        setLoading(true);
        await fetchProducts();
    };

    const handleToggleActive = async (productId) => {
        try {
            setLoading(true);
            await toggleProductActive(productId);
            await fetchProducts(); // Refresh the list
            setError('');
        } catch (error) {
            console.error('Error toggling product status:', error);
            if (error.response?.status === 401) {
                handleUnauthorized();
            } else {
                setError('Failed to update product status. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                setLoading(true);
                await deleteProduct(productId);
                await fetchProducts(); // Refresh the list
                setError('');
            } catch (error) {
                console.error('Error deleting product:', error);
                if (error.response?.status === 401) {
                    handleUnauthorized();
                } else {
                    setError('Failed to delete product. Please try again.');
                }
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
            await updateAllProductStocks(parseInt(bulkStock));
            await fetchProducts(); // Refresh the list
            setBulkStock(''); // Clear input
            setError('');
        } catch (error) {
            console.error('Error updating stocks:', error);
            if (error.response?.status === 401) {
                handleUnauthorized();
            } else {
                setError('Failed to update stocks. Please try again.');
            }
        } finally {
            setUpdateLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading products...</p>
            </div>
        );
    }

    return (
        <div className="product-list-container">
            <div className="product-list-header">
                <h2>Product List</h2>
                <div className="filters">
                    <select
                        name="category"
                        value={filter.category}
                        onChange={handleFilterChange}
                        disabled={loading}
                    >
                        <option value="">All Categories</option>
                        {products.map(product => (
                            product.category && (
                                <option key={product.category._id} value={product.category._id}>
                                    {product.category.name}
                                </option>
                            )
                        )).filter((option, index, self) => 
                            option && // Remove null/undefined
                            self.findIndex(t => 
                                t && t.props.value === option.props.value
                            ) === index // Remove duplicates
                        )}
                    </select>
                    <select
                        name="isActive"
                        value={filter.isActive}
                        onChange={handleFilterChange}
                        disabled={loading}
                    >
                        <option value="">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
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
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="product-table-container">
                {products.length === 0 ? (
                    <div className="no-products">No products found</div>
                ) : (
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Unit</th>
                                <th>Size</th>
                                <th>Price</th>
                                <th>Stock Status</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product._id}>
                                    <td>
                                        <img 
                                            src={product.image_url ? `http://localhost:5000${product.image_url}` : '/placeholder-image.jpg'}
                                            alt={product.name}
                                            className="product-thumbnail"
                                            onError={(e) => {
                                                console.error('Image failed to load:', e.target.src);
                                                e.target.src = '/placeholder-image.jpg';
                                            }}
                                        />
                                    </td>
                                    <td>{product.name}</td>
                                    <td>{product.category?.name || '-'}</td>
                                    <td>{product.store ? product.store.charAt(0).toUpperCase() + product.store.slice(1) : '-'}</td>
                                    <td>{product.size ? `${product.size.breadth}x${product.size.height}` : '-'}</td>
                                    <td>₹{product.new_price}</td>
                                    <td className={`stock-status ${
                                        product.stock === 0 ? 'out-of-stock' : 
                                        product.stock <= 5 ? 'low-stock' : 
                                        'in-stock'
                                    }`}>
                                        <span className="stock-count">{product.stock}</span>
                                        <span className="stock-label">
                                            {product.stock === 0 ? 'Out of Stock' :
                                             product.stock <= 5 ? 'Low Stock' :
                                             'In Stock'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className={`status-toggle ${product.isActive ? 'active' : 'inactive'}`}
                                            onClick={() => handleToggleActive(product._id)}
                                            title={product.isActive ? 'Active' : 'Inactive'}
                                        >
                                            {product.isActive ? <FaToggleOn /> : <FaToggleOff />}
                                        </button>
                                    </td>
                                    <td className="actions">
                                        <button
                                            onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                                            className="edit-btn"
                                            title="Edit"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product._id)}
                                            className="delete-btn"
                                            title="Delete"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ProductList;
