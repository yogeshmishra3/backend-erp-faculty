require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const cron = require("node-cron");
const path = require("path");
const facultyRoutes = require("./routes/facultyRoutes");
const salaryRoutes = require("./routes/salaryRoutes");
const hodRoutes = require("./routes/hod");
const leaveRoutes = require("./routes/leave");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/taskRoutes");
const attendanceRoutes = require("./routes/attendancelogRoutes");
const announcementRoutes = require("./routes/Announcement");

// Mongoose Model
const Announcement = require("./models/Announcement");
const Counter = require("./models/Counter");

// Custom Error Handler
const { errorHandler } = require("./utils/errorHandler");

// Create Express App
const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

// Root Route
app.get("/", (req, res) => {
  res.send("Hello to College ERP API");
});

// Route Middlewares
app.use("/api/faculty", facultyRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/hod", hodRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/announcements", announcementRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI || process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to MongoDB");
    await initializeCounters(); // Initialize counters after DB connection
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Initialize Counters (for teaching/non-teaching ID generation)
async function initializeCounters() {
  try {
    const teachingCounter = await Counter.findOne({ id: "teaching" });
    if (!teachingCounter) {
      await new Counter({ id: "teaching", seq: 1000 }).save();
      console.log("Teaching counter initialized");
    }

    const nonTeachingCounter = await Counter.findOne({ id: "nonTeaching" });
    if (!nonTeachingCounter) {
      await new Counter({ id: "nonTeaching", seq: 1000 }).save();
      console.log("Non-teaching counter initialized");
    }
  } catch (error) {
    console.error("Error initializing counters:", error);
  }
}

// Cron job to delete expired announcements daily at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    await Announcement.deleteMany({ endDate: { $lt: new Date() } });
    console.log("Deleted expired announcements");
  } catch (err) {
    console.error("Error deleting expired announcements:", err);
  }
});

// Global Error Handler (fallback)
app.use((err, req, res, next) => {
  console.error("Global error:", err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Optional custom error middleware
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
