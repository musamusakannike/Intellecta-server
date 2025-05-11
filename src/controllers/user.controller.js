const User = require("../models/user.model");

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

module.exports = { getUser, updateUser, deleteUser };
