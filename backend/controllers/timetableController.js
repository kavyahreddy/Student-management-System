const Timetable = require("../models/Timetable");

const upsertDayTimetable = async (req, res) => {
  try {
    const { department, section, day, periods } = req.body;
    const timetable = await Timetable.findOneAndUpdate(
      { department, section: section || "A", day },
      { periods, updatedBy: req.user._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ timetable });
  } catch (err) {
    res.status(500).json({ message: "Failed to save timetable", error: err.message });
  }
};

const getWeeklyTimetable = async (req, res) => {
  try {
    const { department, section } = req.query;
    const filter = { department };
    if (section) filter.section = section;
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const entries = await Timetable.find(filter).populate("periods.faculty", "name");
    const byDay = days.map((day) => entries.find((e) => e.day === day) || { day, periods: [] });

    res.json({ timetable: byDay });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch timetable", error: err.message });
  }
};

module.exports = { upsertDayTimetable, getWeeklyTimetable };
