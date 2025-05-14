const TaskModel = require("../models/taskModel");

// Create Task
exports.createTask = async (req, res) => {
  try {
    console.log("createTask request body:", req.body);
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Request body is empty" });
    }
    const result = await TaskModel.createTask(req.body);
    res.status(201).json({ message: "Task created successfully", result });
  } catch (error) {
    console.error("Error in createTask:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get All Tasks
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await TaskModel.getAllTasks();
    res.json(tasks);
  } catch (error) {
    console.error("Error in getAllTasks:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get Pending Tasks for Receiver
exports.getPendingTasks = async (req, res) => {
  try {
    const tasks = await TaskModel.getPendingTasks(req.params.receiverName);
    res.json(tasks);
  } catch (error) {
    console.error("Error in getPendingTasks:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get Tasks Sent by Employee
exports.getSentTasks = async (req, res) => {
  try {
    const tasks = await TaskModel.getSentTasks(req.params.employeeId);
    res.json(tasks);
  } catch (error) {
    console.error("Error in getSentTasks:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get Task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await TaskModel.getTaskById(req.params.id);
    res.json(task);
  } catch (error) {
    console.error("Error in getTaskById:", error);
    if (error.message === "Task not found") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

// Update Task Status
exports.updateTask = async (req, res) => {
  try {
    console.log("updateTask request body:", req.body);
    if (
      !req.body.status ||
      !["approved", "rejected"].includes(req.body.status)
    ) {
      return res
        .status(400)
        .json({ error: "Valid status (approved or rejected) is required" });
    }
    const task = await TaskModel.updateTask(req.params.id, req.body);
    res.json({ message: "Task updated successfully", task });
  } catch (error) {
    console.error("Error in updateTask:", error);
    if (error.message === "Task not found") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};
