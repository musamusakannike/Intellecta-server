const Notification = require("../models/notification.model");

// Create a new notification (Admin only)
const createNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        status: "error",
        message: "Title and message are required",
      });
    }

    const notification = await Notification.create({
      title,
      message,
      type,
      createdBy: req.user._id,
    });

    res.status(201).json({
      status: "success",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get all notifications (Admin only)
const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    const responseNotifications = notifications.map((notification) => ({
      _id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
    }));

    res.status(200).json({
      status: "success",
      count: notifications.length,
      notifications: responseNotifications,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get single notification (Admin only)
const getNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!notification) {
      return res.status(404).json({
        status: "error",
        message: "Notification not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Update notification (Admin only)
const updateNotification = async (req, res) => {
  try {
    const { title, message, type, isActive } = req.body;

    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        status: "error",
        message: "Notification not found",
      });
    }

    notification.title = title || notification.title;
    notification.message = message || notification.message;
    notification.type = type || notification.type;
    notification.isActive =
      isActive !== undefined ? isActive : notification.isActive;

    await notification.save();

    res.status(200).json({
      status: "success",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Delete notification (Admin only)
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        status: "error",
        message: "Notification not found",
      });
    }

    await notification.deleteOne();

    res.status(200).json({
      status: "success",
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Mark notification as read for a user
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        status: "error",
        message: "Notification not found",
      });
    }

    // Add user to readBy array if not already present
    if (!notification.readBy.includes(req.user._id)) {
      notification.readBy.push(req.user._id);
      await notification.save();
    }

    res.status(200).json({
      status: "success",
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const notifications = await Notification.updateMany(
      { isActive: true, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );

    res.status(200).json({
      status: "success",
      message: "All notifications marked as read",
      modifiedCount: notifications.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}

// Get unread notifications for a user
const getUnreadNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      isActive: true,
      readBy: { $ne: req.user._id },
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    const responseNotifications = notifications.map((notification) => ({
      _id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
    }));

    res.status(200).json({
      status: "success",
      count: notifications.length,
      notifications: responseNotifications,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  createNotification,
  getAllNotifications,
  getNotification,
  updateNotification,
  deleteNotification,
  markAsRead,
  getUnreadNotifications,
  markAllAsRead,
};
