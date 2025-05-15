const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  const {
    username,
    email,
    // remove password from destructuring since we generate it
    role,
    firstName,
    lastName,
    employeeId,
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
    teachingExperience,
    subjectsTaught,
    classIncharge,
    researchPublications,
    technicalSkills,
    workExperience,
  } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate password from dateOfBirth by removing special characters
    const rawPassword = dateOfBirth || "";
    const cleanPassword = rawPassword.replace(/[^a-zA-Z0-9]/g, "");

    // Hash the cleaned password
    const hashedPassword = await bcrypt.hash(cleanPassword, 10);

    // Create new user with hashed password
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
      employeeId,
      gender,
      dateOfBirth,
      mobile,
      address,
      aadhaar,
      department,
      designation,
      dateOfJoining,
      employmentType,
      status: status || "Active",
      teachingExperience: teachingExperience || 0,
      subjectsTaught: subjectsTaught || [],
      classIncharge,
      researchPublications: researchPublications || [],
      technicalSkills: technicalSkills || [],
      workExperience: workExperience || 0,
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const login = async (req, res) => {
  const { employeeId, password } = req.body;
  try {
    const user = await User.findOne({ employeeId });
    console.log("User found:", user);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("Password found:", password, user.password);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.type,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        employeeId: user.employeeId,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        mobile: user.mobile,
        address: user.address,
        aadhaar: user.aadhaar,
        department: user.department,
        designation: user.designation,
        dateOfJoining: user.dateOfJoining,
        employmentType: user.employmentType,
        status: user.status,
        teachingExperience: user.teachingExperience,
        subjectsTaught: user.subjectsTaught,
        classIncharge: user.classIncharge,
        researchPublications: user.researchPublications,
        technicalSkills: user.technicalSkills,
        workExperience: user.workExperience,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      username,
      email,
      firstName,
      lastName,
      employeeId,
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
      teachingExperience,
      subjectsTaught,
      classIncharge,
      researchPublications,
      technicalSkills,
      workExperience,
    } = req.body;

    user.username = username || user.username;
    user.email = email || user.email;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.name = `${firstName || user.firstName} ${lastName || user.lastName
      }`.trim();
    user.employeeId = employeeId || user.employeeId;
    user.gender = gender || user.gender;
    user.dateOfBirth = dateOfBirth || user.dateOfBirth;
    user.mobile = mobile || user.mobile;
    user.address = address || user.address;
    user.aadhaar = aadhaar || user.aadhaar;
    user.department = department || user.department;
    user.designation = designation || user.designation;
    user.dateOfJoining = dateOfJoining || user.dateOfJoining;
    user.employmentType = employmentType || user.employmentType;
    user.status = status || user.status;
    user.teachingExperience = teachingExperience || user.teachingExperience;
    user.subjectsTaught = subjectsTaught || user.subjectsTaught;
    user.classIncharge = classIncharge || user.classIncharge;
    user.researchPublications =
      researchPublications || user.researchPublications;
    user.technicalSkills = technicalSkills || user.technicalSkills;
    user.workExperience = workExperience || user.workExperience;

    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      employeeId: user.employeeId,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      mobile: user.mobile,
      address: user.address,
      aadhaar: user.aadhaar,
      department: user.department,
      designation: user.designation,
      dateOfJoining: user.dateOfJoining,
      employmentType: user.employmentType,
      status: user.status,
      teachingExperience: user.teachingExperience,
      subjectsTaught: user.subjectsTaught,
      classIncharge: user.classIncharge,
      researchPublications: user.researchPublications,
      technicalSkills: user.technicalSkills,
      workExperience: user.workExperience,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { registerUser, login, getUserProfile, updateUserProfile };
