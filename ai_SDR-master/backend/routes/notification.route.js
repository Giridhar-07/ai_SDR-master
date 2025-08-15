import { Router } from "express";
import { 
  getNotificationsController, 
  markNotificationReadController, 
  markAllNotificationsReadController,
  deleteNotificationController,
  createNotificationController
} from "../controllers/notification.controller.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = Router();

// Test endpoint to check if routes are working
router.get("/test", (req, res) => {
  res.status(200).json({ message: "Notification routes are working" });
});

// Get all notifications for the current admin
router.get("/", adminMiddleware, getNotificationsController);

// Mark a specific notification as read
router.patch("/:id/read", adminMiddleware, markNotificationReadController);

// Mark all notifications as read
router.patch("/mark-all-read", adminMiddleware, markAllNotificationsReadController);

// Delete a notification
router.delete("/:id", adminMiddleware, deleteNotificationController);

// Create a new notification (for system use)
router.post("/", adminMiddleware, createNotificationController);

export default router;
