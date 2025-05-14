const express = require("express");
const router = express.Router();
const {
  facultyRegister,
  staffLogin,
  updatePassword,
  updateFaculty,
  getStudent,
  markAttendance,
  getFaculties,
} = require("../controllers/facultyController");

// Faculty routes
router.post("/register", facultyRegister);
router.post("/login", staffLogin);
router.post("/updatepassword", updatePassword);
router.put("/update/:email", updateFaculty);
router.post("/getstudent", getStudent);
router.post("/markattendance", markAttendance);
router.get("/faculties", getFaculties);

module.exports = router;