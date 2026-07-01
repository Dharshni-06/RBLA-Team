// Architect: SP
/**
 * Script to assign a specific store to products based on criteria
 * 
 * This script allows an admin to:
 * 1. Assign a store to all products
 * 2. Assign a store to products in a specific category
 * 3. Assign a store to specific products by ID
 * 
 * Usage: 
 *   node assignStoreToProducts.js --store=<storeName> [--category=<categoryId>] [--products=<productId1,productId2,...>]
 * 
 * Examples:
 *   node assignStoreToProducts.js --store=varnam
 *   node assignStoreToProducts.js --store=siragugal --category=60d21b4667d0d8992e610c85
 *   node assignStoreToProducts.js --store=vaagai --products=60d21b4667d0d8992e610c86,60d21b4667d0d8992e610c87
 */

require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const Product = require('../../models/Product');

// Parse command line arguments
const args = process.argv.slice(2);
const params = {};

args.forEach(arg => {
  const [key, value] = arg.split('=');
  if (key && value) {
    params[key.replace('--', '')] = value;
  }
});

// Validate required parameters
if (!params.store) {
  console.error('Error: --store parameter is required');
  console.log('Valid store values: varnam, siragugal, vaagai');
  console.log('Usage: node assignStoreToProducts.js --store=<storeName> [--category=<categoryId>] [--products=<productId1,productId2,...>]');
  process.exit(1);
}

// Validate store value
const validStores = ['varnam', 'siragugal', 'vaagai'];
if (!validStores.includes(params.store)) {
  console.error(`Error: Invalid store value. Must be one of: ${validStores.join(', ')}`);
  process.exit(1);
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for store assignment'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function assignStore() {
  try {
    console.log(`Starting store assignment to: ${params.store}`);
    
    // Build the query based on parameters
    const query = {};
    
    if (params.category) {
      query.category = params.category;
      console.log(`Filtering by category: ${params.category}`);
    }
    
    if (params.products) {
      const productIds = params.products.split(',');
      query._id = { $in: productIds };
      console.log(`Filtering by product IDs: ${productIds.join(', ')}`);
    }
    
    // Get matching products
    const products = await Product.find(query);
    console.log(`Found ${products.length} products matching criteria`);
    
    if (products.length === 0) {
      console.log('No products found matching the criteria. No changes made.');
      return;
    }
    
    // Track assignment statistics
    const stats = {
      total: products.length,
      updated: 0,
      failed: 0,
      alreadyAssigned: 0
    };
    
    // Process each product
    for (const product of products) {
      try {
        // Check if the product already has the same store
        if (product.store === params.store) {
          console.log(`Product ${product._id} (${product.name}) already assigned to store: ${params.store}`);
          stats.alreadyAssigned++;
          continue;
        }
        
        // Update the store
        const oldStore = product.store || 'none';
        product.store = params.store;
        
        // Save the updated product
        await product.save();
        console.log(`Updated product ${product._id} (${product.name}) from store: ${oldStore} to: ${params.store}`);
        stats.updated++;
      } catch (error) {
        console.error(`Error updating product ${product._id} (${product.name}):`, error);
        stats.failed++;
      }
    }
    
    // Log assignment results
    console.log('\nStore assignment completed:');
    console.log(`Total products: ${stats.total}`);
    console.log(`Updated: ${stats.updated}`);
    console.log(`Already assigned: ${stats.alreadyAssigned}`);
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
assignStore();
