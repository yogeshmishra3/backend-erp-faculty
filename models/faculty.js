
const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  employeeId: { type: String, required: true },
  department: { type: String, required: true },
  designation: { type: String },
  type: { type: String, enum: ["teaching", "non-teaching"], required: true },
  status: { type: String, default: "Active" },
  email: { type: String },
  mobile: { type: String },
  address: { type: String },
  gender: { type: String },
  dateOfBirth: { type: String },
  aadhaar: { type: String },
  dateOfJoining: { type: String },
  employmentType: { type: String },
  teachingExperience: { type: Number, default: 0 },
  reportingOfficer: { type: String },
  shiftTiming: { type: String },
  classIncharge: { type: String },
  subjectsTaught: { type: [String] },
  technicalSkills: { type: [String] },
  researchPublications: { type: [String] },
  isHOD: { type: Boolean, default: false },
});

module.exports = mongoose.model("Faculty", facultySchema);