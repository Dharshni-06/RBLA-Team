// Architect: SP
import React, { useState, useEffect } from 'react';
import ProductForm from './ProductForm';
import ProductList from './ProductList';
import { FaList, FaPlus } from 'react-icons/fa';
import './Products.css';

const Products = () => {
    const [activeView, setActiveView] = useState('list');

    useEffect(() => {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.scrollTop = 0;
        }
        window.scrollTo(0, 0);
    }, [activeView]);

    return (
        <div className="products-page">
            <div className="products-header">
                <h1>Products Management</h1>
                <div className="view-toggle">
                    <button 
                        className={`toggle-btn ${activeView === 'list' ? 'active' : ''}`}
                        onClick={() => setActiveView('list')}
                    >
                        <FaList /> List Products
                    </button>
                    <button 
                        className={`toggle-btn ${activeView === 'add' ? 'active' : ''}`}
                        onClick={() => setActiveView('add')}
                    >
                        <FaPlus /> Add Product
                    </button>
                </div>
            </div>
            
            <div className="products-content">
                {activeView === 'list' ? (
                    <ProductList />
                ) : (
                    <ProductForm />
                )}
            </div>
        </div>
    );
};

export default Products;
