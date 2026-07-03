const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: { type: String, enum: ["event", "holiday"], required: true },
    date: { type: Date, required: true },
    department: { type: String, default: "All" }, // "All" = college-wide
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
