const mongoose = require('mongoose');
require('dotenv').config();

const CategorySchema = new mongoose.Schema({ name: { type: String, required: true, unique: true } });

async function fix() {
  let conn;
  try {
    conn = await mongoose.createConnection(process.env.MONGO_URI).asPromise();
    console.log('Connected to MongoDB Atlas');

    const Category = conn.model('Category', CategorySchema);

    // List of mappings: singular -> plural
    const mappings = {
      'Bedsheet': 'Bedsheets',
      'Cupcoaster': 'Cupcoasters',
      'Towel': 'Towels',
      'Bag': 'Bags',
      'Napkin': 'Napkins',
      'Paperfile': 'Paperfiles',
      'Bamboo': 'Bamboo'
    };

    for (const [singular, plural] of Object.entries(mappings)) {
      // Find category with singular name
      const cat = await Category.findOne({ name: singular });
      if (cat) {
        // Check if plural name already exists
        const existingPlural = await Category.findOne({ name: plural });
        if (existingPlural) {
          // If plural exists, we delete the singular one (we'll need to re-map products, but let's just update the singular one if plural doesn't exist)
          console.log(`Plural category ${plural} already exists. Deleting singular ${singular}...`);
          await Category.deleteOne({ _id: cat._id });
        } else {
          cat.name = plural;
          await cat.save();
          console.log(`✓ Renamed Category: ${singular} -> ${plural}`);
        }
      } else {
        // Ensure plural exists
        const existingPlural = await Category.findOne({ name: plural });
        if (!existingPlural) {
          const newCat = new Category({ name: plural });
          await newCat.save();
          console.log(`✓ Created Category: ${plural}`);
        }
      }
    }

    console.log('\n🎉 Category fixing completed successfully!');
  } catch (err) {
    console.error(err);
  } finally {
    if (conn) await conn.close();
  }
}

fix();
