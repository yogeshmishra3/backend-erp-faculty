const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  leaveType: {
    type: String,
    required: true,
    enum: ["Sick Leave", "Casual Leave", "Earned Leave"],
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  leaveDays: { type: Number, required: true },
  status: {
    type: String,
    enum: [
      //68219e3bc2a0a45aac68ebb6
      "Pending",
      "HOD Approved",
      "HOD Rejected",
      "Principal Approved",
      "Principal Rejected",
    ],
    default: "Pending",
  },
  hodDecision: {
    employeeId: { type: String },
    decision: { type: String, enum: ["Approved", "Rejected"] },
    comment: { type: String },
    decidedAt: { type: Date },
  },
  principalDecision: {
    employeeId: { type: String },
    decision: { type: String, enum: ["Approved", "Rejected"] },
    comment: { type: String },
    decidedAt: { type: Date },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Leave", leaveSchema);
