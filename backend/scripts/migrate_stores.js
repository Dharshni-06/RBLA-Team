const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: __dirname + '/../.env' });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI not found in environment variables.");
  process.exit(1);
}

// Define inline schemas for migration to avoid loading application code
const ProductSchema = new mongoose.Schema({}, { strict: false });
const AdminSchema = new mongoose.Schema({}, { strict: false });
const WorkerSchema = new mongoose.Schema({}, { strict: false });
const CustomerSchema = new mongoose.Schema({}, { strict: false });
const StoreSchema = new mongoose.Schema({}, { strict: false });

const Product = mongoose.model('Product', ProductSchema);
const Admin = mongoose.model('Admin', AdminSchema);
const Worker = mongoose.model('Worker', WorkerSchema);
const Customer = mongoose.model('Customer', CustomerSchema);
const Store = mongoose.model('Store', StoreSchema);

const storeMapping = {
  'varnam': 'entrepreneur 1',
  'vaagai': 'entrepreneur 2',
  'siragugal': 'entrepreneur 3',
  'sirugugal': 'entrepreneur 3' // Cover the typo in customer schema enum list
};

const titleCase = (str) => {
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

async function runMigration() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB.");

    // 1. Migrate Products
    console.log("\n📦 Migrating Products...");
    for (const [oldName, newName] of Object.entries(storeMapping)) {
      // Direct match
      const res1 = await Product.updateMany(
        { store: oldName },
        { $set: { store: newName } }
      );
      console.log(`Updated products for store '${oldName}' -> '${newName}':`, res1.modifiedCount);

      // Title case match if any
      const res2 = await Product.updateMany(
        { store: titleCase(oldName) },
        { $set: { store: newName } }
      );
      if (res2.modifiedCount > 0) {
        console.log(`Updated products for store (TitleCase) '${titleCase(oldName)}' -> '${newName}':`, res2.modifiedCount);
      }
    }

    // 2. Migrate Admins
    console.log("\n👤 Migrating Admins...");
    for (const [oldName, newName] of Object.entries(storeMapping)) {
      // Find admins of the old store
      const admins = await Admin.find({ storeName: { $regex: new RegExp(`^${oldName}$`, 'i') } });
      console.log(`Found ${admins.length} admins for store '${oldName}'.`);

      for (const admin of admins) {
        const oldUsername = admin.username;
        // replace @storeName at end of username
        let newUsername = oldUsername;
        if (oldUsername.toLowerCase().endsWith(`@${oldName}`)) {
          newUsername = oldUsername.slice(0, -(oldName.length + 1)) + `@${newName}`;
        }

        const res = await Admin.updateOne(
          { _id: admin._id },
          { 
            $set: { 
              storeName: newName,
              username: newUsername
            } 
          }
        );
        console.log(`  Updated admin username '${oldUsername}' -> '${newUsername}' (storeName: '${newName}'):`, res.modifiedCount);
      }
    }

    // 3. Migrate Workers
    console.log("\n👷 Migrating Workers...");
    for (const [oldName, newName] of Object.entries(storeMapping)) {
      // Matches both lower and title case since workers might use 'Varnam', etc.
      const res = await Worker.updateMany(
        { store: { $regex: new RegExp(`^${oldName}$`, 'i') } },
        { $set: { store: newName } }
      );
      console.log(`Updated workers for store '${oldName}' -> '${newName}':`, res.modifiedCount);
    }

    // 4. Migrate Customers
    console.log("\n🤝 Migrating Customers...");
    for (const [oldName, newName] of Object.entries(storeMapping)) {
      const res = await Customer.updateMany(
        { store: { $regex: new RegExp(`^${oldName}$`, 'i') } },
        { $set: { store: newName } }
      );
      console.log(`Updated customers for store '${oldName}' -> '${newName}':`, res.modifiedCount);
    }

    // 5. Migrate Store settings if any
    console.log("\n🏪 Migrating Stores...");
    for (const [oldName, newName] of Object.entries(storeMapping)) {
      const res = await Store.updateMany(
        { name: { $regex: new RegExp(`^${oldName}$`, 'i') } },
        { $set: { name: newName } }
      );
      console.log(`Updated stores with name '${oldName}' -> '${newName}':`, res.modifiedCount);
    }

    console.log("\n🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

runMigration();
