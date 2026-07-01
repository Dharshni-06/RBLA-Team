const mongoose = require('mongoose');

async function inspectAbiramim() {
  try {
    const uri = "mongodb+srv://abiramimargabandhu_db_user:0uAjva5xRe0gkyBa@customization.7qa94qt.mongodb.net/Customization?retryWrites=true&w=majority";
    await mongoose.connect(uri);
    console.log('Connected to AbiramiM database');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections in AbiramiM DB:');
    
    for (const collInfo of collections) {
      const collName = collInfo.name;
      const count = await db.collection(collName).countDocuments();
      console.log(`- ${collName}: ${count} documents`);
      if (count > 0) {
        const sample = await db.collection(collName).findOne({});
        console.log(`  Sample ${collName}:`, JSON.stringify(sample, null, 2));
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

inspectAbiramim();
