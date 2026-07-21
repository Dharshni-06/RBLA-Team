const mongoose = require("mongoose");

const DesignSchema = new mongoose.Schema(
  {
    image: { type: String, required: true }, 
    config: { type: Object },     
    type: { type: String, required: true },           
    userId: { type: String },
    userEmail: { type: String },
  },
  { timestamps: true } 
);

module.exports = mongoose.models.Design || mongoose.model("Design", DesignSchema);

