const mongoose = require("mongoose");

const principalSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
});

module.exports = mongoose.model("Principal", principalSchema);
