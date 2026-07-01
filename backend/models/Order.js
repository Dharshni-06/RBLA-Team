// Architect: SP
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled'],
    default: 'Pending',
  },
  paymentStatus: { type: String, enum: ['Paid', 'Unpaid', 'COD'], default: 'Unpaid' },
  orderDate: { type: Date, default: Date.now },
  deliveryDate: { type: Date },
});

module.exports = mongoose.model('Order', orderSchema);
