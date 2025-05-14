const express = require("express");
const router = express.Router();

const {
  getAttendanceLogs,
  getAttendanceLog,
  createAttendanceLog,
  updateAttendanceLog,
  deleteAttendanceLog,
} = require("../controllers/attendanceController");

// Removed the protect middleware for open-source access

router.route("/").get(getAttendanceLogs).post(createAttendanceLog);

router
  .route("/:id")
  .get(getAttendanceLog)
  .put(updateAttendanceLog)
  .delete(deleteAttendanceLog);

module.exports = router;
