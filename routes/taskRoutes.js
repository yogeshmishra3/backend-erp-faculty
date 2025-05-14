const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

// Define routes
router.post("/", taskController.createTask);
router.get("/", taskController.getAllTasks);
router.get("/pending/:receiverName", taskController.getPendingTasks);
router.get("/sent/:employeeId", taskController.getSentTasks);
router.get("/:id", taskController.getTaskById);
router.put("/:id", taskController.updateTask);

module.exports = router;
