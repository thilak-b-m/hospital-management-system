import Notification from "../models/notification.js";
import User from "../models/user.js";
import { emitToUser } from "../socketServer.js";

export const notifyUser = async (recipient, details) => {
  try {
    if (!recipient) return null;

    const notification = await Notification.create({ recipient, ...details });
    const payload = notification.toObject();
    payload._id = String(payload._id);
    payload.recipient = String(payload.recipient);
    emitToUser(payload.recipient, "notification:new", payload);
    return payload;
  } catch (error) {
    console.error("Notification creation failed:", error.message);
    return null;
  }
};

export const notifyAdmins = async (details, excludedUserIds = []) => {
  try {
    const exclusions = new Set(excludedUserIds.filter(Boolean).map(String));
    const admins = await User.find({ role: "admin", status: "Active" }).select("_id").lean();
    await Promise.all(admins
      .filter((admin) => !exclusions.has(String(admin._id)))
      .map((admin) => notifyUser(admin._id, details)));
  } catch (error) {
    console.error("Admin notifications failed:", error.message);
  }
};