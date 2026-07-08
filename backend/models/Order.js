// Architect: SP
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // New specification fields (relaxed schema-level validation for backwards compatibility)
  userid: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  items: [
    {
      productid: { 
        type: mongoose.Schema.Types.Mixed // Number or ObjectId
      },
      productName: { 
        type: String 
      },
      quantity: { 
        type: Number, 
        min: 1 
      },
      price: { 
        type: Number 
      },
      images: [{ 
        type: String 
      }]
    }
  ],
  shippingAddress: {
    name: String,
    address: String,
    city: String,
    postalCode: String,
    country: String,
    phone: String,
    
    // Legacy fields for compatibility
    fullName: String,
    state: String,
    pincode: String
  },
  billingAddress: {
    name: String,
    address: String,
    city: String,
    postalCode: String,
    country: String,
    phone: String,
    
    // Legacy fields for compatibility
    fullName: String,
    state: String,
    pincode: String
  },
  paymentMethod: { 
    type: String, 
    enum: ['Razorpay', 'Credit Card', 'Debit Card', 'UPI', 'COD']
  },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Failed', 'Refunded', 'Unpaid', 'COD'], 
    default: 'Pending' 
  },
  totalPrice: { 
    type: Number 
  },
  orderStatus: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Canceled'], 
    default: 'Pending' 
  },
  razorpay_order_id: { 
    type: String 
  },
  orderedDate: { 
    type: Date, 
    default: Date.now 
  },
  orderDate: { 
    type: Date, 
    default: Date.now 
  },
  orderedTime: { 
    type: String, 
    default: () => new Date().toLocaleTimeString() 
  },

  // Legacy fields for backwards compatibility with Braintree and admin controllers
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  products: [{
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product' 
    },
    quantity: { 
      type: Number 
    },
    price: { 
      type: Number 
    }
  }],
  totalAmount: { 
    type: Number 
  },
  orderNumber: { 
    type: String 
  },
  deliveryDate: { 
    type: Date 
  }
}, {
  timestamps: true
});

// Pre-save hook to populate compatibility fields automatically and validate IDs
orderSchema.pre('save', async function(next) {
  // Enforce that user identity is present
  if (!this.userid && !this.user) {
    return next(new Error('Path `userid` or `user` is required.'));
  }

  // Sync user IDs
  if (this.userid && !this.user) {
    this.user = this.userid;
  } else if (this.user && !this.userid) {
    this.userid = this.user;
  }

  // Sync totals
  if (this.totalPrice !== undefined && this.totalAmount === undefined) {
    this.totalAmount = this.totalPrice;
  } else if (this.totalAmount !== undefined && this.totalPrice === undefined) {
    this.totalPrice = this.totalAmount;
  }

  // Sync dates
  if (this.orderedDate && !this.orderDate) {
    this.orderDate = this.orderedDate;
  } else if (this.orderDate && !this.orderedDate) {
    this.orderedDate = this.orderDate;
  }

  // Enforce that a total price exists
  if (this.totalPrice === undefined && this.totalAmount === undefined) {
    return next(new Error('Path `totalPrice` or `totalAmount` is required.'));
  }

  // Sync paymentMethod
  if (!this.paymentMethod) {
    if (this.paymentStatus === 'COD') {
      this.paymentMethod = 'COD';
    } else if (this.paymentStatus === 'Paid') {
      this.paymentMethod = 'Credit Card'; // Default fallback for successful payments
    } else {
      this.paymentMethod = 'Razorpay';
    }
  }

  // Sync items array <-> products array
  if (this.items && this.items.length > 0 && (!this.products || this.products.length === 0)) {
    this.products = this.items
      .filter(item => mongoose.isValidObjectId(item.productid))
      .map(item => ({
        product: item.productid,
        quantity: item.quantity,
        price: item.price
      }));
  } else if (this.products && this.products.length > 0 && (!this.items || this.items.length === 0)) {
    this.items = this.products.map(p => ({
      productid: p.product,
      productName: 'Product',
      quantity: p.quantity,
      price: p.price,
      images: []
    }));
  }

  // Sync address fields between old (fullName/pincode/state) and new formats (name/postalCode/country)
  const syncAddress = (addr) => {
    if (addr) {
      if (addr.fullName && !addr.name) addr.name = addr.fullName;
      if (addr.name && !addr.fullName) addr.fullName = addr.name;
      
      if (addr.pincode && !addr.postalCode) addr.postalCode = addr.pincode;
      if (addr.postalCode && !addr.pincode) addr.pincode = addr.postalCode;
      
      if (addr.state && !addr.country) addr.country = 'India';
    }
  };

  syncAddress(this.shippingAddress);
  syncAddress(this.billingAddress);

  // Generate orderNumber if missing
  if (!this.orderNumber) {
    const latestOrder = await this.constructor.findOne({}, {}, { sort: { 'createdAt': -1 } });
    let nextNumber = '000001';
    if (latestOrder && latestOrder.orderNumber) {
      const lastNumber = parseInt(latestOrder.orderNumber.slice(-6));
      if (!isNaN(lastNumber)) {
        nextNumber = String(lastNumber + 1).padStart(6, '0');
      }
    }
    this.orderNumber = `RBLA${nextNumber}`;
  }

  next();
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
module.exports = Order;
