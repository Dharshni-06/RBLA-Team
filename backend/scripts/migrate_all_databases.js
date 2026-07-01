const mongoose = require('mongoose');
require('dotenv').config();

// Mappings of database URIs
const DATABASES = {
  abirami: "mongodb+srv://abiramimargabandhu_db_user:0uAjva5xRe0gkyBa@customization.7qa94qt.mongodb.net/test?retryWrites=true&w=majority",
  preethi: "mongodb+srv://preethir7200:DBvhKZcf5si9qDDy@cluster0.3hyt39x.mongodb.net/test?retryWrites=true&w=majority",
  rblaGit: "mongodb+srv://2301722037024:GHtWORpsyIfySaSv@cluster0.ghloi.mongodb.net/test?retryWrites=true&w=majority",
  destination: process.env.MONGO_URI || "mongodb+srv://rbla_user:rbla1234@cluster0.xvazton.mongodb.net/rbla?retryWrites=true&w=majority"
};

// Destination Schemas
const CategorySchema = new mongoose.Schema({ name: { type: String, required: true, unique: true } });
const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    new_price: { type: Number, required: true },
    old_price: { type: Number, required: true },
    stock: { type: Number, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    store: { type: String, required: true, enum: ['varnam', 'siragugal', 'vaagai'] },
    size: {
        breadth: { type: Number, required: true },
        height: { type: Number, required: true }
    },
    images: [{ type: String }],
    image_url: { type: String, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const DesignSchema = new mongoose.Schema({
    image: { type: String, required: true },
    config: { type: Object },
    type: { type: String, required: true }
}, { timestamps: true });

const OrderSchema = new mongoose.Schema({
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    orderStatus: { type: String, default: 'Pending' },
    paymentStatus: { type: String, default: 'Unpaid' },
    orderDate: { type: Date, default: Date.now },
    shippingAddress: { type: Object, required: true }
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' }
}, { timestamps: true });

const ReviewSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true }
}, { timestamps: true });

const AdminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    storeName: { type: String, required: true }
}, { timestamps: true });

async function migrate() {
  console.log('=== Starting RBLA Multi-Database Migration ===\n');

  let destConn;
  try {
    console.log('Connecting to Destination database (rbla)...');
    destConn = await mongoose.createConnection(DATABASES.destination).asPromise();
    console.log('✓ Connected to Destination database successfully!\n');
  } catch (err) {
    console.error('❌ Failed to connect to Destination database:', err.message);
    return;
  }

  const NewCategory = destConn.model('Category', CategorySchema);
  const NewProduct = destConn.model('Product', ProductSchema);
  const NewDesign = destConn.model('Design', DesignSchema);
  const NewUser = destConn.model('User', UserSchema);
  const NewOrder = destConn.model('Order', OrderSchema);
  const NewReview = destConn.model('Review', ReviewSchema);
  const NewAdmin = destConn.model('Admin', AdminSchema);

  // Helper function to test and migrate a source database
  const migrateSource = async (name, uri, handler) => {
    console.log(`\n--- Migrating Source: ${name.toUpperCase()} ---`);
    console.log(`Connecting to ${name} database...`);
    let conn;
    try {
      conn = await mongoose.createConnection(uri).asPromise();
      console.log(`✓ Connected to ${name} database.`);
      await handler(conn);
    } catch (err) {
      console.error(`❌ Connection/Migration failed for ${name}:`);
      console.error(`   Error message: ${err.message}`);
      if (err.message.includes('ENOTFOUND')) {
        console.error(`   💡 TIP: The MongoDB Atlas cluster for ${name} appears to be paused/suspended.`);
        console.error(`      Please log into the MongoDB Atlas dashboard for this account and "Resume" the cluster.`);
      }
    } finally {
      if (conn) await conn.close();
    }
  };

  // 1. Migrate Abirami Customization
  await migrateSource('abirami', DATABASES.abirami, async (sourceConn) => {
    const OldDesign = sourceConn.model('Design', new mongoose.Schema({}, { strict: false }));
    const designs = await OldDesign.find({}).lean();
    console.log(`Found ${designs.length} designs in Abirami's database.`);
    
    let count = 0;
    for (const d of designs) {
      // Map Abirami design format to destination Design format
      // Abirami schema: { title, description, fileUrl }
      const imagePath = d.fileUrl || d.image || '';
      if (!imagePath) continue;

      const existing = await NewDesign.findOne({ image: imagePath });
      if (!existing) {
        const newDesign = new NewDesign({
          image: imagePath,
          config: { title: d.title, description: d.description },
          type: 'bedsheet' // Abirami did BedSheets
        });
        await newDesign.save();
        count++;
      }
    }
    console.log(`✓ Migrated ${count} designs from Abirami's DB.`);
  });

  // 2. Migrate Preethi Customization
  await migrateSource('preethi', DATABASES.preethi, async (sourceConn) => {
    const OldDesign = sourceConn.model('Design', new mongoose.Schema({}, { strict: false }));
    const designs = await OldDesign.find({}).lean();
    console.log(`Found ${designs.length} designs in Preethi's database.`);
    
    let count = 0;
    for (const d of designs) {
      const imagePath = d.image || '';
      if (!imagePath) continue;

      const existing = await NewDesign.findOne({ image: imagePath });
      if (!existing) {
        const newDesign = new NewDesign({
          image: imagePath,
          config: d.config || {},
          type: d.type || 'cupcoaster' // Default to cupcoaster or customizer types
        });
        await newDesign.save();
        count++;
      }
    }
    console.log(`✓ Migrated ${count} designs from Preethi's DB.`);
  });

  // 3. Migrate Joe Antony / RBLA-Git
  await migrateSource('joe-antony-rbla-git', DATABASES.rblaGit, async (sourceConn) => {
    // Models for Joe's database
    const OldCategory = sourceConn.model('Category', new mongoose.Schema({}, { strict: false }));
    const OldProduct = sourceConn.model('Product', new mongoose.Schema({}, { strict: false }));
    const OldUser = sourceConn.model('User', new mongoose.Schema({}, { strict: false }));
    const OldOrder = sourceConn.model('Order', new mongoose.Schema({}, { strict: false }));
    const OldReview = sourceConn.model('Review', new mongoose.Schema({}, { strict: false }));
    const OldAdmin = sourceConn.model('Admin', new mongoose.Schema({}, { strict: false }));

    // 3.1 Migrate Admins
    console.log('Migrating admins...');
    const admins = await OldAdmin.find({}).lean();
    let adminCount = 0;
    for (const a of admins) {
      const existing = await NewAdmin.findOne({ email: a.email });
      if (!existing) {
        const newAdmin = new NewAdmin(a);
        await newAdmin.save();
        adminCount++;
      }
    }
    console.log(`✓ Migrated ${adminCount} admins.`);

    // 3.2 Migrate Users
    console.log('Migrating users...');
    const users = await OldUser.find({}).lean();
    let userCount = 0;
    const userMap = {}; // oldUserId -> newUserId
    for (const u of users) {
      let existing = await NewUser.findOne({ email: u.email });
      if (!existing) {
        existing = new NewUser(u);
        await existing.save();
        userCount++;
      }
      userMap[u._id.toString()] = existing._id;
    }
    console.log(`✓ Migrated ${userCount} users.`);

    // 3.3 Migrate Categories
    console.log('Migrating categories...');
    const categories = await OldCategory.find({}).lean();
    let catCount = 0;
    const catMap = {}; // oldCatId -> newCatId
    for (const c of categories) {
      // Keep category names consistent with pluralization
      let targetName = c.name;
      const mappings = {
        'Bedsheet': 'Bedsheets',
        'Cupcoaster': 'Cupcoasters',
        'Towel': 'Towels',
        'Bag': 'Bags',
        'Napkin': 'Napkins',
        'Paperfile': 'Paperfiles',
        'Bamboo': 'Bamboo'
      };
      if (mappings[targetName]) {
        targetName = mappings[targetName];
      }

      let existing = await NewCategory.findOne({ name: targetName });
      if (!existing) {
        existing = new NewCategory({ name: targetName });
        await existing.save();
        catCount++;
      }
      catMap[c._id.toString()] = existing._id;
    }
    console.log(`✓ Migrated/Mapped ${catCount} categories.`);

    // 3.4 Migrate Products
    console.log('Migrating products...');
    const products = await OldProduct.find({}).lean();
    let prodCount = 0;
    const prodMap = {}; // oldProdId -> newProdId
    for (const p of products) {
      const newCatId = catMap[p.category?.toString()];
      if (!newCatId) {
        console.warn(`⚠️ Skipping product ${p.name} - Category mapping not found`);
        continue;
      }

      let existing = await NewProduct.findOne({ name: p.name, store: p.store });
      if (!existing) {
        // Build product size correctly
        const sizeData = {
          breadth: p.size?.breadth || 1,
          height: p.size?.height || 1
        };

        existing = new NewProduct({
          name: p.name,
          description: p.description || 'No description provided.',
          new_price: p.new_price || p.price || 0,
          old_price: p.old_price || 0,
          stock: p.stock || 10,
          category: newCatId,
          store: p.store || 'varnam',
          size: sizeData,
          images: p.images || [],
          image_url: p.image_url || (p.images && p.images[0]) || '/placeholder.jpg',
          isActive: p.isActive !== false
        });
        await existing.save();
        prodCount++;
      }
      prodMap[p._id.toString()] = existing._id;
    }
    console.log(`✓ Migrated ${prodCount} products.`);

    // 3.5 Migrate Reviews
    console.log('Migrating reviews...');
    const reviews = await OldReview.find({}).lean();
    let reviewCount = 0;
    for (const r of reviews) {
      const newProdId = prodMap[r.product?.toString()];
      const newUserId = userMap[r.user?.toString()];
      if (!newProdId || !newUserId) continue;

      const existing = await NewReview.findOne({ product: newProdId, user: newUserId, comment: r.comment });
      if (!existing) {
        const newReview = new NewReview({
          product: newProdId,
          user: newUserId,
          rating: r.rating || 5,
          comment: r.comment || ''
        });
        await newReview.save();
        reviewCount++;
      }
    }
    console.log(`✓ Migrated ${reviewCount} reviews.`);

    // 3.6 Migrate Orders
    console.log('Migrating orders...');
    const orders = await OldOrder.find({}).lean();
    let orderCount = 0;
    for (const o of orders) {
      const newUserId = userMap[o.user?.toString()];
      if (!newUserId) continue;

      const existing = await NewOrder.findOne({ orderNumber: o.orderNumber });
      if (!existing) {
        const orderProducts = [];
        for (const item of o.products || []) {
          const newProdId = prodMap[item.product?.toString()];
          if (newProdId) {
            orderProducts.push({
              product: newProdId,
              quantity: item.quantity || 1,
              price: item.price || 0
            });
          }
        }

        if (orderProducts.length === 0) continue;

        const newOrder = new NewOrder({
          orderNumber: o.orderNumber,
          user: newUserId,
          products: orderProducts,
          totalAmount: o.totalAmount || 0,
          orderStatus: o.orderStatus || 'Pending',
          paymentStatus: o.paymentStatus || 'Unpaid',
          orderDate: o.orderDate || o.createdAt || new Date(),
          shippingAddress: o.shippingAddress || { fullName: 'User', address: 'Unknown' }
        });
        await newOrder.save();
        orderCount++;
      }
    }
    console.log(`✓ Migrated ${orderCount} orders.`);
  });

  if (destConn) await destConn.close();
  console.log('\n=== Migration Run Complete ===');
}

migrate();
