const mongoose = require("mongoose");

const hostelRoomSchema = new mongoose.Schema(
  {
    roomNumber: { type: String, required: true, unique: true, trim: true },
    block: { type: String, required: true, trim: true },
    capacity: { type: Number, default: 2, min: 1 },
    occupants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    roomType: { type: String, enum: ["single", "double", "dormitory"], default: "double" },
    status: { type: String, enum: ["available", "full", "maintenance"], default: "available" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HostelRoom", hostelRoomSchema);
