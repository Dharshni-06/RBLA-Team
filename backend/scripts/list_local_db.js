const mongoose = require('mongoose');

async function listDbs() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/admin');
    console.log('Connected to local MongoDB');
    
    const admin = mongoose.connection.useDb('admin').db;
    const dbsList = await admin.admin().listDatabases();
    console.log('Databases on local MongoDB:');
    console.log(JSON.stringify(dbsList.databases, null, 2));
    
    for (const dbInfo of dbsList.databases) {
      const dbName = dbInfo.name;
      // Skip system databases if desired, but let's check collections
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

listDbs();
