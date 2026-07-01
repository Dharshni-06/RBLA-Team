const mongoose = require('mongoose');

async function inspectOldAtlas() {
  try {
    const uri = "mongodb+srv://2301722037024:GHtWORpsyIfySaSv@cluster0.ghloi.mongodb.net/?retryWrites=true&w=majority";
    await mongoose.connect(uri);
    console.log('Connected to old MongoDB Atlas (cluster0.ghloi.mongodb.net)');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections in database:');
    
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

inspectOldAtlas();
