const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    department: { type: String, required: true },
    subject: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["present", "absent", "leave"], required: true },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Prevent duplicate attendance entries for same student/subject/date
attendanceSchema.index({ student: 1, subject: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
