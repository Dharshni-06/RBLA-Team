// Architect: SP
/**
 * Script to assign stores to products based on their order
 * - First two products to Siragugal
 * - Remaining products to Varnam
 */

require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const Product = require('../../models/Product');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for store assignment'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function assignStoresByOrder() {
  try {
    console.log('Starting store assignment by order...');
    
    // Get all products sorted by creation date
    const products = await Product.find({}).sort({ createdAt: 1 });
    console.log(`Found ${products.length} products total`);
    
    if (products.length === 0) {
      console.log('No products found. No changes made.');
      return;
    }
    
    // Track assignment statistics
    const stats = {
      siragugal: 0,
      varnam: 0,
      failed: 0
    };
    
    // Process each product
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      try {
        // Assign first two to Siragugal, rest to Varnam
        const targetStore = i < 2 ? 'siragugal' : 'varnam';
        
        // Skip if already assigned to the target store
        if (product.store === targetStore) {
          console.log(`Product ${product._id} (${product.name}) already assigned to store: ${targetStore}`);
          stats[targetStore]++;
          continue;
        }
        
        // Update the store
        const oldStore = product.store || 'none';
        product.store = targetStore;
        
        // Save the updated product
        await product.save();
        console.log(`Updated product ${product._id} (${product.name}) from store: ${oldStore} to: ${targetStore}`);
        stats[targetStore]++;
      } catch (error) {
        console.error(`Error updating product ${product._id} (${product.name}):`, error);
        stats.failed++;
      }
    }
    
    // Log assignment results
    console.log('\nStore assignment completed:');
    console.log(`Total products: ${products.length}`);
    console.log(`Assigned to Siragugal: ${stats.siragugal}`);
    console.log(`Assigned to Varnam: ${stats.varnam}`);
    console.log(`Failed: ${stats.failed}`);
    
  } catch (error) {
    console.error('Store assignment failed:', error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the store assignment
assignStoresByOrder();
