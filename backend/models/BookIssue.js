const mongoose = require("mongoose");

const bookIssueSchema = new mongoose.Schema(
  {
    book: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ["issued", "returned", "overdue"],
      default: "issued",
    },
    fine: { type: Number, default: 0 },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BookIssue", bookIssueSchema);
