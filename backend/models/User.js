const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * Roles:
 *  - superadmin   : full control over every account & module
 *  - sectionadmin : controls one section only (e.g. a department like "CSE",
 *                   or a module like "Library" / "Hostel") - assigned by superadmin
 *  - faculty      : belongs to a department, marks attendance & grades
 *  - student      : logs in using admissionNo, read-only dashboard access
 *  - parent       : linked to one or more students (view-only)
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["superadmin", "sectionadmin", "faculty", "student", "parent"],
      required: true,
    },

    // Students log in with admission number (unique, sparse so other roles can omit it)
    admissionNo: { type: String, unique: true, sparse: true, trim: true },

    // For sectionadmin: which section they control e.g. "CSE", "Library", "Hostel"
    section: { type: String, trim: true },

    // For faculty/student: department they belong to e.g. "CSE", "ECE"
    department: { type: String, trim: true },

    // For parent: linked children (User refs with role student)
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    phone: { type: String, trim: true },
    avatar: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
