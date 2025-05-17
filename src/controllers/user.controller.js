const User = require("../models/user.model");
const Notification = require("../models/notification.model");

const getUser = async (req, res) => {
  try {
    const id = req.user._id;
    const user = await User.findById(id);
    res.status(200).json({ status: "success", data: user });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const id = req.user._id;
    const user = await User.findByIdAndUpdate(id, req.body, { new: true });
    const userWithoutPassword = {
      _id: user._id,
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      profileImage: user.profileImage || "",
      isPremium: user.isPremium,
      joinedDate: user.createdAt,
    };
    res.status(200).json({ status: "success", user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = req.user._id;
    await User.findByIdAndDelete(id);
    res
      .status(200)
      .json({ status: "success", message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Register or update Expo push token for the user
const registerExpoPushToken = async (req, res) => {
  try {
    const { expoPushToken } = req.body;
    if (!expoPushToken) {
      return res.status(400).json({ status: "error", message: "Expo push token is required" });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { expoPushToken },
      { new: true }
    );
    res.status(200).json({ status: "success", data: user });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// ADMIN: List all users
const listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ status: "success", data: users });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// ADMIN: Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }
    res.status(200).json({ status: "success", data: user });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// ADMIN: Update user by ID (role, isActive, etc.)
const updateUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }
    res.status(200).json({ status: "success", data: user });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// ADMIN: Delete user by ID
const deleteUserById = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }
    res.status(200).json({ status: "success", message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Handle screenshot detection and ban logic
const handleScreenshot = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }
    if (!user.isActive) {
      return res.status(403).json({ status: "error", message: "User is already banned" });
    }
    user.screenshotCount = (user.screenshotCount || 0) + 1;
    let shotsLeft = 5 - user.screenshotCount;
    let banned = false;
    if (user.screenshotCount >= 5) {
      user.isActive = false;
      banned = true;
      shotsLeft = 0;
    }
    await user.save();
    // Send personal notification
    const notificationMsg = banned
      ? `You have been banned for suspiciously attempting piracy by taking screenshots on restricted pages.`
      : `Screenshot detected on a restricted page. ${shotsLeft} screenshot${shotsLeft === 1 ? '' : 's'} left before ban.`;
    await Notification.create({
      title: banned ? "Account Banned" : "Screenshot Detected",
      message: notificationMsg,
      type: banned ? "error" : "warning",
      createdBy: req.user ? req.user._id : user._id, // fallback if no req.user
      readBy: [user._id],
    });
    res.status(200).json({
      status: "success",
      message: banned ? "User banned and notified." : `Screenshot detected. ${shotsLeft} left before ban.`,
      banned,
      shotsLeft,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = { getUser, updateUser, deleteUser, listUsers, getUserById, updateUserById, deleteUserById, registerExpoPushToken, handleScreenshot };
