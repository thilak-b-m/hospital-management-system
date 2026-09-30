import mongoose from "mongoose";
import Notification from "../models/notification.js";
import { emitToUser } from "../socketServer.js";

export const getNotifications = async (req, res) => {
  try {
    const recipient = req.user.id;
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ recipient }).sort({ createdAt: -1 }).limit(50).lean(),
      Notification.countDocuments({ recipient, readAt: null }),
    ]);
    return res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Unable to load notifications" });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id, readAt: null },
      { $set: { readAt: new Date() } },
      { returnDocument: "after" }
    ).lean();
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    emitToUser(req.user.id, "notification:changed", { notification });
    return res.status(200).json({ success: true, notification });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Unable to update notification" });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, readAt: null },
      { $set: { readAt: new Date() } }
    );
    emitToUser(req.user.id, "notification:changed", { allRead: true });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Unable to update notifications" });
  }
};