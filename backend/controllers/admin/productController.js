// Architect: SP
const { Product } = require('../../models');

// Get all products with optional filtering
exports.getAllProducts = async (req, res) => {
    try {
        const query = { store: req.adminStore }; // Filter by admin's store
        if (req.query.category) {
            query.category = req.query.category;
        }
        if (req.query.isActive !== undefined) {
            query.isActive = req.query.isActive === 'true';
        }

        const products = await Product.find(query)
            .populate('category', 'name')
            .sort({ date: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single product
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        // Check if product belongs to admin's store
        if (product.store !== req.adminStore) {
            return res.status(403).json({ 
                message: 'Access denied: You can only view products from your store' 
            });
        }
        
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new product
exports.createProduct = async (req, res) => {
    try {
        // Force store to be admin's store
        const product = new Product({
            name: req.body.name,
            description: req.body.description,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
            stock: req.body.stock,
            category: req.body.category,
            size: {
                breadth: req.body.size.breadth,
                height: req.body.size.height
            },
            images: req.body.images,
            image_url: req.body.image_url,
            store: req.adminStore, // Set store to admin's store
            isActive: req.body.isActive !== undefined ? req.body.isActive : true
        });

        const newProduct = await product.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update product
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        // Check if product belongs to admin's store
        if (product.store !== req.adminStore) {
            return res.status(403).json({ 
                message: 'Access denied: You can only update products from your store' 
            });
        }

        // Update only the fields that are provided
        const updates = req.body;
        Object.keys(updates).forEach(key => {
            if (key === 'size' && updates.size) {
                product.size.breadth = updates.size.breadth || product.size.breadth;
                product.size.height = updates.size.height || product.size.height;
            } else if (key === 'store') {
                // Do not allow updating store
                return;
            } else {
                product[key] = updates[key];
            }
        });

        const updatedProduct = await product.save();
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        // Check if product belongs to admin's store
        if (product.store !== req.adminStore) {
            return res.status(403).json({ 
                message: 'Access denied: You can only delete products from your store' 
            });
        }
        
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update product stock
exports.updateStock = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        // Check if product belongs to admin's store
        if (product.store !== req.adminStore) {
            return res.status(403).json({ 
                message: 'Access denied: You can only update stock of products from your store' 
            });
        }

        product.stock = req.body.stock;
        const updatedProduct = await product.save();
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Toggle product active status
exports.toggleActive = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        // Check if product belongs to admin's store
        if (product.store !== req.adminStore) {
            return res.status(403).json({ 
                message: 'Access denied: You can only toggle active status of products from your store' 
            });
        }

        product.isActive = !product.isActive;
        const updatedProduct = await product.save();
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update all product stocks
exports.updateAllStocks = async (req, res) => {
    try {
        const { stock } = req.body;
        
        if (stock === undefined || stock < 0) {
            return res.status(400).json({ message: 'Invalid stock value' });
        }

        // Update all products' stock from admin's store
        await Product.updateMany({ store: req.adminStore }, { stock });

        res.status(200).json({ 
            success: true,
            message: `Updated stock to ${stock} for all products in your store` 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
