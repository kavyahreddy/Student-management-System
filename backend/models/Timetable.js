const mongoose = require("mongoose");

const periodSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true, trim: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true }, // "10:00"
  },
  { _id: false }
);

const timetableSchema = new mongoose.Schema(
  {
    department: { type: String, required: true, trim: true },
    section: { type: String, trim: true, default: "A" },
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      required: true,
    },
    periods: [periodSchema],
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

timetableSchema.index({ department: 1, section: 1, day: 1 }, { unique: true });

module.exports = mongoose.model("Timetable", timetableSchema);
