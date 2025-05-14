const Attendance = require("../models/Attendancelog");

// Get all attendance logs
exports.getAttendanceLogs = async (req, res, next) => {
  try {
    const logs = await Attendance.find();
    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
};

// Get single attendance log by ID
exports.getAttendanceLog = async (req, res, next) => {
  try {
    const log = await Attendance.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ message: "Attendance log not found" });
    }
    res.status(200).json(log);
  } catch (error) {
    next(error);
  }
};

// Create new attendance log
exports.createAttendanceLog = async (req, res, next) => {
  try {
    const log = await Attendance.create(req.body);
    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
};

// Update attendance log
exports.updateAttendanceLog = async (req, res, next) => {
  try {
    const log = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!log) {
      return res.status(404).json({ message: "Attendance log not found" });
    }
    res.status(200).json(log);
  } catch (error) {
    next(error);
  }
};

// Delete attendance log
exports.deleteAttendanceLog = async (req, res, next) => {
  try {
    const log = await Attendance.findByIdAndDelete(req.params.id);
    if (!log) {
      return res.status(404).json({ message: "Attendance log not found" });
    }
    res.status(200).json({ message: "Attendance log deleted" });
  } catch (error) {
    next(error);
  }
};
