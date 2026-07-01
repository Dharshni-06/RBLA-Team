// Architect: SP
/**
 * Migration script to update existing products to use the new store field instead of unit field
 * 
 * This script:
 * 1. Finds all products in the database
 * 2. Maps unit IDs to store names based on a predefined mapping
 * 3. Updates each product with the appropriate store value
 * 4. Logs the results of the migration
 * 
 * Usage: node migrateProductsToStore.js
 */

require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const Product = require('../../models/Product');
const ProductUnit = require('../../models/schemas/productUnit');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for migration'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define a mapping of unit names to store names
// This is a placeholder - you'll need to customize this based on your actual data
const storeMapping = {
  // Example: 'kg': 'varnam',
  // You should map each unit to the appropriate store
};

async function migrateProducts() {
  try {
    console.log('Starting product migration...');
    
    // First, get all product units to build the mapping
    const units = await ProductUnit.find({});
    console.log(`Found ${units.length} product units`);
    
    // Build the mapping from unit ID to store name
    // This is where you need to decide which units belong to which stores
    const unitToStoreMap = {};
    
    // For demonstration, we'll assign units to stores in a round-robin fashion
    // In a real scenario, you would have specific logic for this mapping
    const stores = ['varnam', 'siragugal', 'vaagai'];
    units.forEach((unit, index) => {
      unitToStoreMap[unit._id.toString()] = stores[index % stores.length];
    });
    
    console.log('Unit to store mapping:', unitToStoreMap);
    
    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to migrate`);
    
    // Track migration statistics
    const stats = {
      total: products.length,
      updated: 0,
      failed: 0,
      skipped: 0
    };
    
    // Process each product
    for (const product of products) {
      try {
        // Skip products that already have a store field
        if (product.store) {
          console.log(`Product ${product._id} (${product.name}) already has store: ${product.store}`);
          stats.skipped++;
          continue;
        }
        
        // Get the unit ID
        const unitId = product.unit ? product.unit.toString() : null;
        
        if (!unitId) {
          console.log(`Product ${product._id} (${product.name}) has no unit, skipping`);
          stats.skipped++;
          continue;
        }
        
        // Determine the store based on the unit
        const storeName = unitToStoreMap[unitId];
        
        if (!storeName) {
          console.log(`No store mapping found for unit ${unitId} of product ${product._id} (${product.name})`);
          // Default to a specific store if no mapping exists
          product.store = 'varnam';
        } else {
          product.store = storeName;
        }
        
        // Remove the unit field
        product.unit = undefined;
        
        // Save the updated product
        await product.save();
        console.log(`Updated product ${product._id} (${product.name}) with store: ${product.store}`);
        stats.updated++;
      } catch (error) {
        console.error(`Error updating product ${product._id} (${product.name}):`, error);
        stats.failed++;
      }
    }
    
    // Log migration results
    console.log('\nMigration completed:');
    console.log(`Total products: ${stats.total}`);
    console.log(`Updated: ${stats.updated}`);
    console.log(`Skipped: ${stats.skipped}`);
    console.log(`Failed: ${stats.failed}`);
    
    // Provide instructions for manual verification
    console.log('\nPlease verify the migration by checking a few products in the database.');
    console.log('You can use the following MongoDB query to check products without a store:');
    console.log('db.products.find({ store: { $exists: false } })');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the migration
migrateProducts();
