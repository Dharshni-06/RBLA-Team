// Architect: SP
const mongoose = require('mongoose');

const returnRequestSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  orderNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  details: {
    type: String,
    // Required only if reason is 'other'
    required: function() {
      return this.reason === 'other';
    }
  },
  store: {
    type: String,
    required: true,
    enum: ['entrepreneur 1', 'entrepreneur 3', 'entrepreneur 2']
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ReturnRequest', returnRequestSchema);
