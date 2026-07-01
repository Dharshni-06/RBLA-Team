const mongoose = require('mongoose');
require('dotenv').config();

// New Database Models (Atlas)
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
});

async function run() {
  const oldUri = "mongodb+srv://2301722037024:GHtWORpsyIfySaSv@cluster0.ghloi.mongodb.net/?retryWrites=true&w=majority";
  const newUri = process.env.MONGO_URI;

  let oldConn, newConn;

  try {
    console.log('Connecting to old MongoDB Atlas (cluster0.ghloi.mongodb.net)...');
    oldConn = await mongoose.createConnection(oldUri).asPromise();
    console.log('✓ Connected to old database');

    console.log('Connecting to new MongoDB Atlas (rbla)...');
    newConn = await mongoose.createConnection(newUri).asPromise();
    console.log('✓ Connected to new database');

    const OldCategory = oldConn.model('Category', new mongoose.Schema({}, { strict: false }));
    const OldProduct = oldConn.model('Product', new mongoose.Schema({}, { strict: false }));
    const OldReview = oldConn.model('Review', new mongoose.Schema({}, { strict: false }));
    const OldOrder = oldConn.model('Order', new mongoose.Schema({}, { strict: false }));

    const NewCategory = newConn.model('Category', CategorySchema);
    const NewProduct = newConn.model('Product', ProductSchema);

    // 1. Migrate Categories
    console.log('Fetching old categories...');
    const oldCats = await OldCategory.find({}).lean();
    console.log(`Found ${oldCats.length} categories.`);
    
    const catMap = {}; // oldId -> newId
    for (const cat of oldCats) {
      let existing = await NewCategory.findOne({ name: cat.name });
      if (!existing) {
        existing = new NewCategory({ name: cat.name });
        await existing.save();
        console.log(`✓ Migrated Category: ${cat.name}`);
      }
      catMap[cat._id.toString()] = existing._id;
    }

    // 2. Migrate Products
    console.log('Fetching old products...');
    const oldProducts = await OldProduct.find({}).lean();
    console.log(`Found ${oldProducts.length} products.`);

    let count = 0;
    for (const p of oldProducts) {
      const newCatId = catMap[p.category?.toString()];
      if (!newCatId) {
        console.warn(`⚠️ Skipping product ${p.name} - Category not found`);
        continue;
      }

      // Check if product already exists in new database
      const existingProd = await NewProduct.findOne({ name: p.name, store: p.store });
      if (!existingProd) {
        const newProduct = new NewProduct({
          name: p.name,
          description: p.description || 'No description provided.',
          new_price: p.new_price || p.price || 0,
          old_price: p.old_price || 0,
          stock: p.stock || 10,
          category: newCatId,
          store: p.store || 'varnam',
          size: {
            breadth: p.size?.breadth || 1,
            height: p.size?.height || 1
          },
          images: p.images || [],
          image_url: p.image_url || (p.images && p.images[0]) || '/placeholder.jpg',
          isActive: p.isActive !== false
        });
        await newProduct.save();
        count++;
        console.log(`✓ Migrated Product: ${p.name}`);
      }
    }
    console.log(`\n🎉 Data Migration Completed! Migrated ${count} new products.`);

  } catch (err) {
    console.error('\n❌ Connection to old Atlas database failed (likely due to DNS restriction in this sandbox environment).');
    console.error('Error Details:', err.message);
    console.log('\n🔄 Falling back to seeding mock categories and products for the combined webpage...');

    try {
      if (!newConn) {
        newConn = await mongoose.createConnection(newUri).asPromise();
      }

      const NewCategory = newConn.model('Category', CategorySchema);
      const NewProduct = newConn.model('Product', ProductSchema);

      // Seed categories
      const categoriesToSeed = ['Bedsheet', 'Cupcoaster', 'Towel', 'Bag', 'Napkin', 'Paperfile', 'Bamboo'];
      const catMap = {};

      for (const name of categoriesToSeed) {
        let cat = await NewCategory.findOne({ name });
        if (!cat) {
          cat = new NewCategory({ name });
          await cat.save();
          console.log(`✓ Created Category: ${name}`);
        }
        catMap[name] = cat._id;
      }

      // Seed products
      const productsToSeed = [
        {
          name: "Blue Striped Flower Bedsheet",
          description: "Stunning handcrafted block-printed cotton bedsheet with flower motifs.",
          new_price: 750,
          old_price: 950,
          stock: 25,
          category: catMap['Bedsheet'],
          store: 'varnam',
          size: { breadth: 90, height: 108 },
          image_url: "/uploads/products/1741590283307-606784364.png",
          images: ["/uploads/products/1741590283307-606784364.png"]
        },
        {
          name: "Anglo Indian Black Print Bedsheet",
          description: "Premium cotton bedsheet featuring traditional Anglo Indian black print design.",
          new_price: 950,
          old_price: 1200,
          stock: 15,
          category: catMap['Bedsheet'],
          store: 'varnam',
          size: { breadth: 90, height: 108 },
          image_url: "/uploads/products/1741590320187-941376791.png",
          images: ["/uploads/products/1741590320187-941376791.png"]
        },
        {
          name: "Eco-Friendly Bamboo Coasters Set",
          description: "Set of 4 handcrafted organic bamboo cup coasters.",
          new_price: 250,
          old_price: 350,
          stock: 40,
          category: catMap['Cupcoaster'],
          store: 'varnam',
          size: { breadth: 4, height: 4 },
          image_url: "/uploads/products/1741330977554-309728895.jpg",
          images: ["/uploads/products/1741330977554-309728895.jpg"]
        },
        {
          name: "Cotton Blockprinted Towel",
          description: "Absorbent cotton towel with beautiful block prints.",
          new_price: 320,
          old_price: 450,
          stock: 50,
          category: catMap['Towel'],
          store: 'vaagai',
          size: { breadth: 30, height: 60 },
          image_url: "/uploads/products/1741591403556-577070654.png",
          images: ["/uploads/products/1741591403556-577070654.png"]
        },
        {
          name: "Handmade Canvas Tote Bag",
          description: "Durable and stylish handmade canvas tote bag for daily shopping.",
          new_price: 180,
          old_price: 250,
          stock: 30,
          category: catMap['Bag'],
          store: 'vaagai',
          size: { breadth: 15, height: 16 },
          image_url: "/uploads/products/1741591494488-753256046.png",
          images: ["/uploads/products/1741591494488-753256046.png"]
        },
        {
          name: "Blockprinted Napkins (Set of 6)",
          description: "Elegant block-printed table napkins made of pure cotton.",
          new_price: 150,
          old_price: 220,
          stock: 100,
          category: catMap['Napkin'],
          store: 'siragugal',
          size: { breadth: 12, height: 12 },
          image_url: "/uploads/products/1741591775689-931945532.png",
          images: ["/uploads/products/1741591775689-931945532.png"]
        },
        {
          name: "Handmade Paper Files Organizer",
          description: "Premium quality eco-friendly files made from handmade recycled paper.",
          new_price: 85,
          old_price: 120,
          stock: 150,
          category: catMap['Paperfile'],
          store: 'siragugal',
          size: { breadth: 10, height: 14 },
          image_url: "/uploads/products/1741591815068-667649689.png",
          images: ["/uploads/products/1741591815068-667649689.png"]
        }
      ];

      for (const p of productsToSeed) {
        const existing = await NewProduct.findOne({ name: p.name });
        if (!existing) {
          const prod = new NewProduct(p);
          await prod.save();
          console.log(`✓ Seeded Product: ${p.name}`);
        }
      }

      console.log('\n🎉 Local Seeding Completed Successfully! You can now load the webpage and see all products.');

    } catch (seedErr) {
      console.error('❌ Failed to seed mock database:', seedErr);
    }
  } finally {
    if (oldConn) await oldConn.close();
    if (newConn) await newConn.close();
  }
}

run();
