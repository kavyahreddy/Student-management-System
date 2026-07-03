const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true, trim: true },
    examType: { type: String, enum: ["assignment", "midterm", "final", "quiz"], required: true },
    marksObtained: { type: Number, required: true, min: 0 },
    maxMarks: { type: Number, required: true, min: 1 },
    grade: { type: String }, // computed: A+, A, B, C, D, F
    remarks: { type: String, trim: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

function computeGrade(percentage) {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C";
  if (percentage >= 50) return "D";
  return "F";
}

gradeSchema.pre("save", function (next) {
  const percentage = (this.marksObtained / this.maxMarks) * 100;
  this.grade = computeGrade(percentage);
  next();
});

module.exports = mongoose.model("Grade", gradeSchema);
