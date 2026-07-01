// Architect: SP
const Product = require('../../models/Product');

// Search products with filters
exports.searchProducts = async (req, res) => {
    try {
        const { query } = req.query;
        
        // Build search criteria
        let searchCriteria = { isActive: true }; // Only show active products
        if (query) {
            searchCriteria.$or = [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }

        const products = await Product.find(searchCriteria)
            .populate('category', 'name')
            .select('name description new_price old_price image_url category')
            .limit(10);

        // Log the first product to see the image_url structure
        if (products.length > 0) {
            console.log('First product image_url:', products[0].image_url);
        }

        res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching products',
            error: error.message
        });
    }
};
