const mongoose = require('mongoose');
require('dotenv').config();

async function listAtlasDbs() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas');
    
    const admin = mongoose.connection.useDb('admin').db;
    const dbsList = await admin.admin().listDatabases();
    console.log('Databases on MongoDB Atlas cluster:');
    console.log(JSON.stringify(dbsList.databases, null, 2));
    
    for (const dbInfo of dbsList.databases) {
      const dbName = dbInfo.name;
      // Skip admin/local/config unless needed
      if (['admin', 'local', 'config'].includes(dbName)) continue;
      const db = mongoose.connection.useDb(dbName).db;
      const collections = await db.listCollections().toArray();
      console.log(`\nDatabase: ${dbName}`);
      console.log('Collections:', collections.map(c => c.name));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

listAtlasDbs();
