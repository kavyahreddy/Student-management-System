const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    docType: {
      type: String,
      enum: ["id_proof", "marksheet", "certificate", "fee_receipt", "other"],
      default: "other",
    },
    originalFileName: { type: String, required: true },
    filePath: { type: String, required: true },
    extractedText: { type: String, default: "" },
    ocrStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    verified: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
