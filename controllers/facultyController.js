const Faculty = require("../models/faculty");
const Student = require("../models/student");
const Subject = require("../models/subject");
const Attendance = require("../models/attendance");
const bcrypt = require("bcryptjs");
const emailvalidator = require("email-validator");

// Helper function to generate password from DOB
const generatePasswordFromDOB = (dob) => {
  // Remove all non-alphanumeric characters and use as password
  return dob.replace(/[^0-9]/g, '');
};

const facultyRegister = async (req, res) => {
  const {
    employeeId,
    name,
    email,
    gender,
    designation,
    mobile,
    dateOfBirth,
    dateOfJoining,
    department,
    address,
    aadhaar,
    employmentType,
    status,
    type,
    teachingExperience,
    subjectsTaught,
    classIncharge,
    researchPublications,
    technicalSkills,
    workExperience,
    reportingOfficer,
    shiftTiming,
  } = req.body;

  // Validate all fields
  if (
    !name ||
    !email ||
    !gender ||
    !designation ||
    !mobile ||
    !dateOfBirth ||
    !dateOfJoining ||
    !department ||
    !address ||
    !aadhaar ||
    !employmentType
    // !status ||
    // !type ||
    // !teachingExperience ||
    // !subjectsTaught ||
    // !classIncharge ||
    // !researchPublications ||
    // !technicalSkills ||
    // !workExperience ||
    // !reportingOfficer ||
    // !shiftTiming
  ) {
    return res.status(400).json({
      success: false,
      message: "Every field is mandatory",
    });
  }

  // Email validation
  if (!emailvalidator.validate(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email ID",
    });
  }

  try {
    const existingFaculty = await Faculty.findOne({ email });

    if (existingFaculty) {
      return res.status(400).json({
        success: false,
        message: "Account already exists with provided email ID",
      });
    }

    // Generate password from DOB
    const password = generatePasswordFromDOB(dateOfBirth);
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new faculty member (for both teaching and non-teaching staff)
    const newFaculty = new Faculty({
      employeeId,
      name,
      email,
      gender,
      dateOfBirth,
      mobile,
      address,
      aadhaar,
      department,
      designation,
      dateOfJoining,
      employmentType,
      status,
      type,
      teachingExperience,
      subjectsTaught,
      classIncharge,
      researchPublications,
      technicalSkills,
      workExperience,
      reportingOfficer,
      shiftTiming,
      password: hashedPassword,
    });

    const result = await newFaculty.save();

    return res.status(201).json({
      success: true,
      message: `${type === 'teaching' ? 'Faculty' : 'Non-teaching'} staff registered successfully`,
      data: {
        ...result._doc,
        initialPassword: password // Include the initial password in the response
      },
    });
  } catch (e) {
    console.error("Registration Error:", e);
    return res.status(500).json({ success: false, message: e.message });
  }
};

const staffLogin = async (req, res) => {
  const { email, password } = req.body;
  const errors = { emailError: "", passwordError: "" };

  try {
    const existingUser = await Faculty.findOne({ email });

    if (!existingUser) {
      errors.emailError = "Staff not found.";
      return res.status(404).json(errors);
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordCorrect) {
      errors.passwordError = "Incorrect password.";
      return res.status(401).json(errors);
    }

    return res.status(200).json({ success: true, result: existingUser });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword, email } = req.body;
    const errors = { mismatchError: String };
    if (newPassword !== confirmPassword) {
      errors.mismatchError =
        "Your password and confirmation password do not match";
      return res.status(400).json(errors);
    }

    const faculty = await Faculty.findOne({ email });
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "User not found with the provided email",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    faculty.password = hashedPassword;
    faculty.passwordUpdated = true;
    await faculty.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
      response: faculty,
    });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};

const updateFaculty = async (req, res) => {
  try {
    const { email } = req.params;
    const updateData = req.body;

    const faculty = await Faculty.findOne({ email });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Staff not found with the provided email",
      });
    }

    // Update only the fields that are provided
    Object.keys(updateData).forEach(key => {
      if (key !== 'email' && key !== 'password' && key !== 'employeeId') {
        faculty[key] = updateData[key];
      }
    });

    const updatedFaculty = await faculty.save();

    res.status(200).json({
      success: true,
      message: "Staff information updated successfully",
      data: updatedFaculty
    });
  } catch (error) {
    console.error("Update Faculty Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating staff information",
      error: error.message
    });
  }
};

const getFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.find(); // Fetch all faculties with all fields

    if (faculties.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No faculty records found"
      });
    }

    res.status(200).json({
      success: true,
      data: faculties
    });
  } catch (error) {
    console.error("Get Faculties Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving faculty data",
      error: error.message
    });
  }
};

const getStudent = async (req, res) => {
  try {
    const { department, year, section } = req.body;
    const errors = { noStudentError: String };
    const students = await Student.find({ department, year, section });
    if (students.length === 0) {
      errors.noStudentError = "No Student Found";
      return res.status(404).json(errors);
    }

    res.status(200).json({ result: students });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};

const markAttendance = async (req, res) => {
  try {
    const { selectedStudents, subjectName, department, year, section } =
      req.body;

    const sub = await Subject.findOne({ subjectName });
    if (!sub) {
      return res.status(404).json({
        success: false,
        message: "Subject not found"
      });
    }

    const allStudents = await Student.find({ department, year, section });

    for (let i = 0; i < allStudents.length; i++) {
      const pre = await Attendance.findOne({
        student: allStudents[i]._id,
        subject: sub._id,
      });
      if (!pre) {
        const attendance = new Attendance({
          student: allStudents[i]._id,
          subject: sub._id,
        });
        attendance.totalLecturesByFaculty += 1;
        await attendance.save();
      } else {
        pre.totalLecturesByFaculty += 1;
        await pre.save();
      }
    }

    for (var a = 0; a < selectedStudents.length; a++) {
      const pre = await Attendance.findOne({
        student: selectedStudents[a],
        subject: sub._id,
      });
      if (!pre) {
        const attendance = new Attendance({
          student: selectedStudents[a],
          subject: sub._id,
        });

        attendance.lectureAttended += 1;
        await attendance.save();
      } else {
        pre.lectureAttended += 1;
        await pre.save();
      }
    }
    res.status(200).json({
      success: true,
      message: "Attendance Marked successfully"
    });
  } catch (error) {
    console.error("Mark Attendance Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while marking attendance",
      error: error.message
    });
  }
};



const getLastEmployeeId = async (req, res) => {
  const { type } = req.query;

  try {
    const lastFaculty = await Faculty.find({ type })
      .sort({ employeeId: -1 })
      .limit(1);

    if (!lastFaculty.length) {
      return res.json({ lastEmployeeId: null });
    }

    res.json({ lastEmployeeId: lastFaculty[0].employeeId });
  } catch (err) {
    console.error("Error fetching last ID:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  facultyRegister,
  staffLogin,
  updatePassword,
  updateFaculty,
  getStudent,
  markAttendance,
  getFaculties,
  getLastEmployeeId,
}
