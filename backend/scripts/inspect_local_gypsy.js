const mongoose = require('mongoose');

async function inspectLocal() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/gypsy');
    console.log('Connected to local MongoDB (gypsy)');
    
    const db = mongoose.connection.db;
    
    // Check categories
    const categories = await db.collection('categories').find({}).toArray();
    console.log(`Categories count: ${categories.length}`);
    console.log('Categories:', categories);
    
    // Check products
    const products = await db.collection('products').find({}).toArray();
    console.log(`Products count: ${products.length}`);
    if (products.length > 0) {
      console.log('Sample product:', JSON.stringify(products[0], null, 2));
      
      // Let's count products by category
      const categoriesCount = {};
      products.forEach(p => {
        categoriesCount[p.category] = (categoriesCount[p.category] || 0) + 1;
      });
      console.log('Products by category:', categoriesCount);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

inspectLocal();
