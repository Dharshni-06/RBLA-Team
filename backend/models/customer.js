// Architect: SP
const mongoose = require('mongoose');
// this is not yet completed this a dummy data for the superadmin
const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  store: {
    type: String,
    required: [true, 'Store is required'],
    enum: ['entrepreneur 1', 'entrepreneur 3', 'entrepreneur 2'],
    default: 'entrepreneur 1'
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  customerType: {
    type: String,
    required: [true, 'Customer type is required'],
    enum: ['buyer', 'vendor'],
    default: 'buyer'
  },
  orders: [{
    productName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    orderDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
});

// Add index for better search performance
customerSchema.index({ name: 1, email: 1, phone: 1 });

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
