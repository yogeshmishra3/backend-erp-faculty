const mongoose = require("mongoose");

// Task Schema
const taskSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  designation: { type: String, required: true },
  department: { type: String, required: true },
  reportingManager: { type: String, required: true },
  handoverStartDate: { type: Date, required: true },
  handoverEndDate: { type: Date, required: true },
  reason: { type: String, required: true },
  receiverName: { type: String, required: true },
  receiverDesignation: { type: String, required: true },
  documents: [{ type: String }], // Array of document names/URLs
  assets: [{ type: String }], // Array of asset names/IDs
  pendingTasks: [{ type: String }], // Array of task descriptions
  remarks: { type: String },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  date: { type: Date, default: Date.now },
  actionDate: { type: Date },
});

const Task = mongoose.model("Task", taskSchema);

// Create Task
exports.createTask = async (data) => {
  try {
    console.log("createTask input:", data);
    const requiredFields = [
      "employeeId",
      "designation",
      "department",
      "reportingManager",
      "handoverStartDate",
      "handoverEndDate",
      "reason",
      "receiverName",
      "receiverDesignation",
    ];
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`${field} is required`);
      }
    }
    // Validate dates
    const startDate = new Date(data.handoverStartDate);
    const endDate = new Date(data.handoverEndDate);
    if (isNaN(startDate) || isNaN(endDate)) {
      throw new Error("Invalid handoverStartDate or handoverEndDate");
    }
    if (startDate > endDate) {
      throw new Error("handoverStartDate must be before handoverEndDate");
    }
    const task = new Task({
      employeeId: data.employeeId,
      designation: data.designation,
      department: data.department,
      reportingManager: data.reportingManager,
      handoverStartDate: startDate,
      handoverEndDate: endDate,
      reason: data.reason,
      receiverName: data.receiverName,
      receiverDesignation: data.receiverDesignation,
      documents: Array.isArray(data.documents) ? data.documents : [],
      assets: Array.isArray(data.assets) ? data.assets : [],
      pendingTasks: Array.isArray(data.pendingTasks) ? data.pendingTasks : [],
      remarks: data.remarks,
    });
    const savedTask = await task.save();
    return savedTask;
  } catch (error) {
    throw new Error(`Failed to create task: ${error.message}`);
  }
};

// Get All Tasks
exports.getAllTasks = async () => {
  try {
    const tasks = await Task.find().sort({ date: -1 });
    return tasks;
  } catch (error) {
    throw new Error(`Failed to fetch tasks: ${error.message}`);
  }
};

// Get Pending Tasks for Receiver
exports.getPendingTasks = async (receiverName) => {
  try {
    const tasks = await Task.find({ receiverName, status: "pending" }).sort({
      date: -1,
    });
    return tasks;
  } catch (error) {
    throw new Error(`Failed to fetch pending tasks: ${error.message}`);
  }
};

// Get Tasks Sent by Employee
exports.getSentTasks = async (employeeId) => {
  try {
    const tasks = await Task.find({ employeeId }).sort({ date: -1 });
    return tasks;
  } catch (error) {
    throw new Error(`Failed to fetch sent tasks: ${error.message}`);
  }
};

// Get Task by ID
exports.getTaskById = async (id) => {
  try {
    const task = await Task.findById(id);
    if (!task) {
      throw new Error("Task not found");
    }
    return task;
  } catch (error) {
    throw new Error(`Failed to fetch task: ${error.message}`);
  }
};

// Update Task Status
exports.updateTask = async (id, data) => {
  try {
    const task = await Task.findByIdAndUpdate(
      id,
      {
        status: data.status,
        remarks: data.remarks,
        actionDate: Date.now(),
      },
      { new: true }
    );
    if (!task) {
      throw new Error("Task not found");
    }
    return task;
  } catch (error) {
    throw new Error(`Failed to update task: ${error.message}`);
  }
};
