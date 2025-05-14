

const express = require("express");
const router = express.Router();
const HOD = require("../models/HOD");
// const Faculty = require("../models/faculty");

// Set faculty as HOD, replacing existing HOD if present
router.post("/hod", async (req, res) => {
  const { facultyId, name, department } = req.body;

  try {
    // Verify faculty exists
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    // Check if department already has an HOD
    const existingHOD = await HOD.findOne({ department });
    if (existingHOD) {
      // Remove existing HOD
      await HOD.deleteOne({ department });
      // Update previous HOD's isHOD status
      await Faculty.findByIdAndUpdate(existingHOD.facultyId, { isHOD: false });
    }

    // Create new HOD
    const hod = new HOD({
      facultyId,
      name,
      department,
    });
    await hod.save();

    // Update new HOD's isHOD status
    await Faculty.findByIdAndUpdate(facultyId, { isHOD: true });

    res
      .status(201)
      .json({ message: `${name} set as HOD for ${department}`, hod });
  } catch (error) {
  console.error("Error setting HOD:", error.message);
  res.status(500).json({ message: "Server error" });
}
});

module.exports = router;