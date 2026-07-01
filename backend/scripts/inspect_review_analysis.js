const mongoose = require('mongoose');
require('dotenv').config();

async function inspectAtlas() {
  try {
    // Replace the database name in MONGO_URI, specifically targeting net/rbla?
    const uri = process.env.MONGO_URI.replace('net/rbla?', 'net/review-analysis?');
    console.log('Connecting to URI:', uri.replace(/:([^@]+)@/, ':******@'));
    
    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas (review-analysis)');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections in review-analysis DB:');
    
    for (const collInfo of collections) {
      const collName = collInfo.name;
      const count = await db.collection(collName).countDocuments();
      console.log(`- ${collName}: ${count} documents`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

inspectAtlas();
