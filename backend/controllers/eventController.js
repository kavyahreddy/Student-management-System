const Event = require("../models/Event");

const createEvent = async (req, res) => {
  try {
    const { title, description, type, date, department } = req.body;
    const event = await Event.create({ title, description, type, date, department, createdBy: req.user._id });
    res.status(201).json({ event });
  } catch (err) {
    res.status(500).json({ message: "Failed to create event", error: err.message });
  }
};

const listEvents = async (req, res) => {
  const { type, upcoming } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (upcoming === "true") filter.date = { $gte: new Date() };

  const events = await Event.find(filter).sort({ date: 1 });
  res.json({ events });
};

const deleteEvent = async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found" });
  res.json({ message: "Event removed" });
};

module.exports = { createEvent, listEvents, deleteEvent };
