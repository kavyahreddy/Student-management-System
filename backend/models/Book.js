const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, unique: true, sparse: true, trim: true },
    category: { type: String, trim: true },
    totalCopies: { type: Number, default: 1, min: 0 },
    availableCopies: { type: Number, default: 1, min: 0 },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
