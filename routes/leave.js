const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Leave = require("../models/Leave");
const Principal = require("../models/Principal");
const LeaveSummary = require("../models/LeaveSummary");
const hodSchema = require("../models/HOD");

// Sanitize department name for collection
const sanitizeCollectionName = (department) => {
  return department
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toLowerCase();
};

// Calculate leave days
const calculateLeaveDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

// Apply for leave
router.post("/apply", async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason } = req.body;

    // Validate faculty
    const faculty = await Faculty.findOne({ employeeId });
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    // Calculate leave days
    const leaveDays = calculateLeaveDays(startDate, endDate);

    // Create leave request
    const leave = new Leave({
      employeeId,
      name: faculty.name,
      department: faculty.department,
      leaveType,
      startDate,
      endDate,
      reason,
      leaveDays,
    });
    await leave.save();

    res
      .status(201)
      .json({ message: "Leave request submitted", leaveId: leave._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// HOD view and decide on leave requests
router.get("/hod/:department", async (req, res) => {
  try {
    const { department } = req.params;
    const leaves = await Leave.find({
      department,
      status: "Pending",
    }).select("employeeId name leaveType startDate endDate reason leaveDays");
    res.status(200).json(leaves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/hod/:leaveId", async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { decision, comment, hodEmployeeId } = req.body;

    // Validate leave
    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // Validate HOD
    const collectionName = sanitizeCollectionName(leave.department);
    const DepartmentHOD = mongoose.model(
      collectionName,
      hodSchema,
      collectionName
    );
    const hod = await DepartmentHOD.findOne({ employeeId: hodEmployeeId });
    if (!hod) {
      return res.status(403).json({ message: "Not authorized as HOD" });
    }

    // Update leave decision
    leave.hodDecision = {
      employeeId: hodEmployeeId,
      decision,
      comment,
      decidedAt: new Date(),
    };
    leave.status = decision === "Approved" ? "HOD Approved" : "HOD Rejected";
    await leave.save();

    res
      .status(200)
      .json({ message: `Leave request ${decision.toLowerCase()} by HOD` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Principal view and decide on leave requests
router.get("/principal", async (req, res) => {
  try {
    const leaves = await Leave.find({ status: "HOD Approved" }).select(
      "employeeId name department leaveType startDate endDate reason leaveDays"
    );
    res.status(200).json(leaves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/principal/:leaveId", async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { decision, comment, principalEmployeeId } = req.body;

    // Validate leave
    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // Validate principal
    const principal = await Principal.findOne({
      employeeId: principalEmployeeId,
    });
    if (!principal) {
      return res.status(403).json({ message: "Not authorized as Principal" });
    }

    // Update leave decision
    leave.principalDecision = {
      employeeId: principalEmployeeId,
      decision,
      comment,
      decidedAt: new Date(),
    };
    leave.status =
      decision === "Approved" ? "Principal Approved" : "Principal Rejected";
    await leave.save();

    // Update leave summary if approved
    if (decision === "Approved") {
      const year = new Date(leave.startDate).getFullYear();
      const month = new Date(leave.startDate).getMonth() + 1;

      let summary = await LeaveSummary.findOne({
        employeeId: leave.employeeId,
      });
      if (!summary) {
        summary = new LeaveSummary({
          employeeId: leave.employeeId,
          monthlyLeaves: [],
          yearlyLeaves: [],
        });
      }

      // Update monthly leaves
      let monthly = summary.monthlyLeaves.find(
        (m) => m.year === year && m.month === month
      );
      if (!monthly) {
        summary.monthlyLeaves.push({ year, month, days: leave.leaveDays });
      } else {
        monthly.days += leave.leaveDays;
      }

      // Update yearly leaves
      let yearly = summary.yearlyLeaves.find((y) => y.year === year);
      if (!yearly) {
        summary.yearlyLeaves.push({ year, days: leave.leaveDays });
      } else {
        yearly.days += leave.leaveDays;
      }

      await summary.save();
    }

    res.status(200).json({
      message: `Leave request ${decision.toLowerCase()} by Principal`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get leave summary for a faculty
router.get("/summary/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    const summary = await LeaveSummary.findOne({ employeeId });
    if (!summary) {
      return res.status(404).json({ message: "No leave summary found" });
    }
    res.status(200).json(summary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create or update principal
router.post("/principal/create", async (req, res) => {
  try {
    const { employeeId, name } = req.body;

    // Validate input
    if (!employeeId || !name) {
      return res
        .status(400)
        .json({ message: "employeeId and name are required" });
    }

    // Check if principal already exists
    let principal = await Principal.findOne({ employeeId });
    if (principal) {
      // Update existing principal
      principal.name = name;
      await principal.save();
      return res
        .status(200)
        .json({ message: "Principal updated successfully", principal });
    }

    // Create new principal
    principal = new Principal({ employeeId, name });
    await principal.save();

    res
      .status(201)
      .json({ message: "Principal created successfully", principal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
