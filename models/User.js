const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  step: { type: String, default: "WELCOME" },
  intent: String,
  budget: String,
  location: String,
  name: String,
  city: String,
  called: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }

});

module.exports = mongoose.model("User", userSchema);
