const Grade = require("../models/Grade");

const addGrade = async (req, res) => {
  try {
    const { student, subject, examType, marksObtained, maxMarks, remarks } = req.body;
    const grade = await Grade.create({
      student,
      subject,
      examType,
      marksObtained,
      maxMarks,
      remarks,
      recordedBy: req.user._id,
    });
    res.status(201).json({ grade });
  } catch (err) {
    res.status(500).json({ message: "Failed to add grade", error: err.message });
  }
};

const getStudentGrades = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.user._id;
    const grades = await Grade.find({ student: studentId }).sort({ createdAt: -1 });

    const totalObtained = grades.reduce((sum, g) => sum + g.marksObtained, 0);
    const totalMax = grades.reduce((sum, g) => sum + g.maxMarks, 0);
    const overallPercentage = totalMax ? ((totalObtained / totalMax) * 100).toFixed(1) : "0.0";

    res.json({ grades, summary: { overallPercentage, subjectsRecorded: grades.length } });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch grades", error: err.message });
  }
};

const updateGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    if (!grade) return res.status(404).json({ message: "Grade record not found" });
    Object.assign(grade, req.body);
    await grade.save(); // triggers pre-save grade recomputation
    res.json({ grade });
  } catch (err) {
    res.status(500).json({ message: "Failed to update grade", error: err.message });
  }
};

module.exports = { addGrade, getStudentGrades, updateGrade };
