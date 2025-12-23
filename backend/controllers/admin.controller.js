import User from "../models/User.js";

// Only these roles are visible in this panel
const STAFF_ROLES = ["admin", "verification_officer"];

export const getAllUsers = async (req, res) => {
  // Query Filter: Exclude students immediately from DB
  const users = await User.find({ 
    role: { $in: STAFF_ROLES } 
  }).sort({ createdAt: -1 });

  res.json(
    users.map((u) => ({
      id: u._id,
      email: u.email,
      role: u.role,
    }))
  );
};

export const createUser = async (req, res) => {
  const { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ error: "Email & role required" });
  }

  // Strict check: Only allow creating Staff
  if (!STAFF_ROLES.includes(role)) {
    return res.status(400).json({ error: "Invalid role selected" });
  }

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(409).json({ error: "User already exists" });
  }

  const user = await User.create({ email, role });

  res.status(201).json({
    success: true,
    message: "Staff user created",
    user,
  });
};

export const updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!STAFF_ROLES.includes(role)) {
    return res.status(400).json({ error: "Invalid role update" });
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.role = role;
  await user.save();

  res.json({ success: true });
};

// NEW: Delete Controller
export const deleteUser = async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  // Security: Prevent deleting Admins via API
  if (user.role === 'admin') {
     return res.status(403).json({ error: "Cannot delete admin users." });
  }

  await User.findByIdAndDelete(userId);
  res.json({ success: true, message: "User deleted successfully" });
};