const mongoose = require("mongoose");

const leaveSummarySchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  monthlyLeaves: [
    {
      year: { type: Number, required: true },
      month: { type: Number, required: true },
      days: { type: Number, default: 0 },
    },
  ],
  yearlyLeaves: [
    {
      year: { type: Number, required: true },
      days: { type: Number, default: 0 },
    },
  ],
});

module.exports = mongoose.model("LeaveSummary", leaveSummarySchema);
