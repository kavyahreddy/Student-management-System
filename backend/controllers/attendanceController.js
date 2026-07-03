const Attendance = require("../models/Attendance");

// Faculty marks attendance for one or more students at once
const markAttendance = async (req, res) => {
  try {
    const { records } = req.body;
    // records: [{ student, department, subject, date, status }]
    const docs = records.map((r) => ({ ...r, markedBy: req.user._id }));

    const results = await Promise.allSettled(
      docs.map((d) =>
        Attendance.findOneAndUpdate(
          { student: d.student, subject: d.subject, date: d.date },
          d,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
      )
    );

    res.status(201).json({ message: "Attendance recorded", count: results.length });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark attendance", error: err.message });
  }
};

// Student/Parent view: attendance summary + records
const getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.user._id;
    const records = await Attendance.find({ student: studentId }).sort({ date: -1 });

    const total = records.length;
    const present = records.filter((r) => r.status === "present").length;
    const percentage = total ? ((present / total) * 100).toFixed(1) : "0.0";

    res.json({ records, summary: { total, present, absent: total - present, percentage } });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch attendance", error: err.message });
  }
};

// Faculty/Admin view: attendance for a whole department/subject on a date
const getClassAttendance = async (req, res) => {
  try {
    const { department, subject, date } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (subject) filter.subject = subject;
    if (date) filter.date = new Date(date);

    const records = await Attendance.find(filter).populate("student", "name admissionNo");
    res.json({ records });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch class attendance", error: err.message });
  }
};

module.exports = { markAttendance, getStudentAttendance, getClassAttendance };
