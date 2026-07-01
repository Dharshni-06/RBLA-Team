const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Design = require('./models/Design');

dotenv.config();

async function query() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const designs = await Design.find({});
    console.log(`Found ${designs.length} designs in the database:`);
    console.log(JSON.stringify(designs, null, 2));

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error querying database:", err);
  }
}

query();
