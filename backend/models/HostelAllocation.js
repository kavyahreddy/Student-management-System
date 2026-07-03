const mongoose = require("mongoose");

const hostelAllocationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "HostelRoom", required: true },
    allocatedDate: { type: Date, default: Date.now },
    vacatedDate: { type: Date, default: null },
    status: { type: String, enum: ["active", "vacated"], default: "active" },
    allocatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HostelAllocation", hostelAllocationSchema);
