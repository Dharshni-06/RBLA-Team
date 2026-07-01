// Architect: SP
const express = require('express');
const router = express.Router();
const { Product } = require('../models');

// --------------------------
// CREATE: Add a new product
// POST /api/products
// --------------------------
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body); // Create a new product from the request body
    await product.save(); // Save the product to the database
    res.status(201).json({ message: 'Product added successfully', product });
  } catch (err) {
    res.status(400).json({ message: 'Error adding product', error: err.message });
  }
});

// --------------------------
// READ: Get all products
// GET /api/products
// --------------------------
router.get('/', async (req, res) => {
  try {
    const products = await Product.find(); // Fetch all products from the database
    res.status(200).json({ message: 'Products fetched successfully', products });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products', error: err.message });
  }
});

// --------------------------
// READ: Get a single product by ID
// GET /api/products/:id
// --------------------------
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id); // Find product by ID
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product fetched successfully', product });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching product', error: err.message });
  }
});

// --------------------------
// UPDATE: Update a product by ID
// PUT /api/products/:id
// --------------------------
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, // ID of the product to update
      req.body, // New data to update
      { new: true, runValidators: true } // Return the updated product and run validators
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (err) {
    res.status(400).json({ message: 'Error updating product', error: err.message });
  }
});

// --------------------------
// DELETE: Delete a product by ID
// DELETE /api/products/:id
// --------------------------
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id); // Find and delete product by ID
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully', product });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product', error: err.message });
  }
});

module.exports = router;
