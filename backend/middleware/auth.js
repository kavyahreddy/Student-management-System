const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verifies the JWT and attaches the user to req.user
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User not found or deactivated" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, invalid or expired token" });
  }
};

// Restricts a route to specific roles. Usage: authorize("superadmin", "sectionadmin")
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient role privileges" });
    }
    next();
  };
};

// Ensures a sectionadmin can only act within their own section (department/module)
// superadmin bypasses this check entirely.
const scopeToSection = (sectionField = "section") => {
  return (req, res, next) => {
    if (req.user.role === "superadmin") return next();
    if (req.user.role === "sectionadmin") {
      const targetSection = req.body[sectionField] || req.query[sectionField] || req.params[sectionField];
      if (targetSection && targetSection !== req.user.section) {
        return res.status(403).json({ message: "Access denied: outside your assigned section" });
      }
      return next();
    }
    return res.status(403).json({ message: "Access denied" });
  };
};

module.exports = { protect, authorize, scopeToSection };
