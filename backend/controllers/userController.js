const User = require("../models/User");

/**
 * Role creation hierarchy enforced here:
 *  - superadmin   -> can create: sectionadmin, faculty, student, parent
 *  - sectionadmin -> can create: faculty, student, parent (only within their own section/department)
 */
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, admissionNo, section, department, phone, children } = req.body;

    if (req.user.role === "sectionadmin") {
      if (role === "superadmin" || role === "sectionadmin") {
        return res.status(403).json({ message: "Section admins cannot create admin accounts" });
      }
      if (department && department !== req.user.section) {
        return res.status(403).json({ message: "You can only add users to your own section" });
      }
    }

    const exists = await User.findOne({ $or: [{ email }, ...(admissionNo ? [{ admissionNo }] : [])] });
    if (exists) return res.status(400).json({ message: "Email or admission number already in use" });

    const user = await User.create({
      name,
      email,
      password,
      role,
      admissionNo: role === "student" ? admissionNo : undefined,
      section: role === "sectionadmin" ? section : undefined,
      department: ["faculty", "student"].includes(role) ? department || req.user.section : undefined,
      phone,
      children: role === "parent" ? children : undefined,
      createdBy: req.user._id,
    });

    res.status(201).json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: "Failed to create user", error: err.message });
  }
};

// List users - superadmin sees all, sectionadmin sees only their section/department
const listUsers = async (req, res) => {
  try {
    const { role, department } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;

    if (req.user.role === "sectionadmin") {
      filter.department = req.user.section;
      filter.role = { $in: ["faculty", "student", "parent"] };
    }

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user", error: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password; // password changes go through changePassword
    delete updates.role; // role changes restricted to superadmin via dedicated route if needed

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user", error: err.message });
  }
};

// Deactivate rather than hard-delete, to preserve academic history/records
const deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deactivated", user });
  } catch (err) {
    res.status(500).json({ message: "Failed to deactivate user", error: err.message });
  }
};

module.exports = { createUser, listUsers, getUserById, updateUser, deactivateUser };
