// Architect: SP
const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    phoneNo: { type: String, required: true },
    address: { type: String, required: true },
    role: { type: String, required: true },
    store: { type: String, required: true },
    aadharNo: { type: String, required: true }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Worker', workerSchema);
