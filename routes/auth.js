const express = require("express");
const router = express.Router();
const {
  registerUser,
  login,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/authController");
// const authMiddleware = require("../middleware/authMiddleware");
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

router.post("/register", registerUser);
router.post("/login", login);
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);

module.exports = router;

