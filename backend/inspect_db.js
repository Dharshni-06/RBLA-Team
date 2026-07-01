const mongoose = require('mongoose');
const connectDB = require('./utils/database/mongoConfig');
const Order = require('./models/user/Order');
const Product = require('./models/Product');

async function inspect() {
  await connectDB();
  console.log("Connected to MongoDB.");

  try {
    const o = await Order.findById('6a2a6353e4f3ea67dd52214d').populate({
      path: 'products.product',
      select: 'store'
    });
    console.log("Order found & populated:", JSON.stringify(o, null, 2));
    
    // Try saving to see if there is a validation error
    console.log("Testing order.save()...");
    o.orderStatus = 'Processing';
    await o.save();
    console.log("Save succeeded!");
  } catch (e) {
    console.log("Save failed with error:", e);
  }

  mongoose.connection.close();
}

inspect();
