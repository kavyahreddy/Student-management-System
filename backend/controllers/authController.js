const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @route POST /api/auth/login
// Students may log in with their admissionNo instead of email.
// Body: { identifier, password }  -- identifier = email OR admissionNo
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ message: "Identifier and password are required" });
    }

    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { admissionNo: identifier }],
    });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    if (!user.isActive) return res.status(403).json({ message: "Account has been deactivated" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: req.user });
};

// @route PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ message: "Current password is incorrect" });
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to change password", error: err.message });
  }
};

module.exports = { login, getMe, changePassword };
