const HostelRoom = require("../models/HostelRoom");
const HostelAllocation = require("../models/HostelAllocation");

const addRoom = async (req, res) => {
  try {
    const { roomNumber, block, capacity, roomType } = req.body;
    const room = await HostelRoom.create({ roomNumber, block, capacity, roomType });
    res.status(201).json({ room });
  } catch (err) {
    res.status(500).json({ message: "Failed to add room", error: err.message });
  }
};

const listRooms = async (req, res) => {
  const rooms = await HostelRoom.find().populate("occupants", "name admissionNo").sort({ block: 1, roomNumber: 1 });
  res.json({ rooms });
};

const allocateRoom = async (req, res) => {
  try {
    const { roomId, studentId } = req.body;
    const room = await HostelRoom.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (room.occupants.length >= room.capacity) {
      return res.status(400).json({ message: "Room is already full" });
    }

    room.occupants.push(studentId);
    room.status = room.occupants.length >= room.capacity ? "full" : "available";
    await room.save();

    const allocation = await HostelAllocation.create({
      student: studentId,
      room: roomId,
      allocatedBy: req.user._id,
    });

    res.status(201).json({ allocation });
  } catch (err) {
    res.status(500).json({ message: "Failed to allocate room", error: err.message });
  }
};

const vacateRoom = async (req, res) => {
  try {
    const allocation = await HostelAllocation.findById(req.params.id).populate("room");
    if (!allocation) return res.status(404).json({ message: "Allocation not found" });

    allocation.status = "vacated";
    allocation.vacatedDate = new Date();
    await allocation.save();

    const room = allocation.room;
    room.occupants = room.occupants.filter((o) => o.toString() !== allocation.student.toString());
    room.status = "available";
    await room.save();

    res.json({ message: "Room vacated", allocation });
  } catch (err) {
    res.status(500).json({ message: "Failed to vacate room", error: err.message });
  }
};

const myAllocation = async (req, res) => {
  const allocation = await HostelAllocation.findOne({ student: req.user._id, status: "active" }).populate("room");
  res.json({ allocation });
};

module.exports = { addRoom, listRooms, allocateRoom, vacateRoom, myAllocation };
