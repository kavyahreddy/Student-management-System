require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const libraryRoutes = require("./routes/libraryRoutes");
const hostelRoutes = require("./routes/hostelRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const gradeRoutes = require("./routes/gradeRoutes");
const documentRoutes = require("./routes/documentRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const eventRoutes = require("./routes/eventRoutes");

const app = express();

connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/hostel", hostelRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/events", eventRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
