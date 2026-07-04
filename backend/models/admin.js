// Architect: SP
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Phone number must be 10 digits'],
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        // Username must be in format: something@storename
        const storePattern = new RegExp(`^[a-zA-Z0-9_]+@${this.storeName}$`);
        return storePattern.test(v);
      },
      message: props => `${props.value} is not a valid username. Format should be username@storename`
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false,
  },
  storeName: {
    type: String,
    required: [true, 'Store name is required'],
    enum: {
      values: ['varnam', 'siragugal', 'vaagai', 'entrepreneur 1', 'entrepreneur 3', 'entrepreneur 2'],
      message: 'Invalid store name',
    },
  },
  aadharNumber: {
    type: String,
    required: [true, 'Aadhar number is required'],
    unique: true,
    match: [/^[0-9]{12}$/, 'Aadhar number must be 12 digits'],
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
adminSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
