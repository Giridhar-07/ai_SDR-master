import { NotificationModel } from "../models/notification.model.js";

export const getNotificationsController = async (req, res) => {
  try {
    const adminId = req.admin._id;
    
    const notifications = await NotificationModel.find({ 
      adminId: adminId 
    })
    .sort({ createdAt: -1 })
    .limit(50); // Limit to last 50 notifications

    res.status(200).json({ 
      message: "Notifications fetched successfully", 
      notifications 
    });
  } catch (error) {
    return res.status(500).json({ 
      message: error.message || "Internal server error" 
    });
  }
};

export const markNotificationReadController = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin._id;

    if (!id) {
      return res.status(400).json({ error: "Notification ID is required" });
    }

    const notification = await NotificationModel.findOneAndUpdate(
      { _id: id, adminId: adminId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.status(200).json({ 
      message: "Notification marked as read", 
      notification 
    });
  } catch (error) {
    return res.status(500).json({ 
      message: error.message || "Internal server error" 
    });
  }
};

export const markAllNotificationsReadController = async (req, res) => {
  try {
    const adminId = req.admin._id;

    const result = await NotificationModel.updateMany(
      { adminId: adminId, read: false },
      { read: true }
    );

    res.status(200).json({ 
      message: "All notifications marked as read", 
      updatedCount: result.modifiedCount 
    });
  } catch (error) {
    return res.status(500).json({ 
      message: error.message || "Internal server error" 
    });
  }
};

export const deleteNotificationController = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.admin._id;

    if (!id) {
      return res.status(400).json({ error: "Notification ID is required" });
    }

    const notification = await NotificationModel.findOneAndDelete({
      _id: id,
      adminId: adminId
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.status(200).json({ 
      message: "Notification deleted successfully", 
      notification 
    });
  } catch (error) {
    return res.status(500).json({ 
      message: error.message || "Internal server error" 
    });
  }
};

export const createNotificationController = async (req, res) => {
  try {
    const { type, title, message, data } = req.body;
    const adminId = req.admin._id;

    if (!type || !title || !message) {
      return res.status(400).json({ 
        error: "Type, title, and message are required" 
      });
    }

    const notification = await NotificationModel.create({
      adminId,
      type,
      title,
      message,
      data: data || {},
      read: false
    });

    res.status(201).json({ 
      message: "Notification created successfully", 
      notification 
    });
  } catch (error) {
    return res.status(500).json({ 
      message: error.message || "Internal server error" 
    });
  }
};

// Utility function to create notifications for other controllers
export const createNotification = async (adminId, type, title, message, data = {}) => {
  try {
    const notification = await NotificationModel.create({
      adminId,
      type,
      title,
      message,
      data,
      read: false
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

