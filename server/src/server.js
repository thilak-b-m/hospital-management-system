import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./config/db.js";
import Message from "./models/message.js";
import jwt from "jsonwebtoken";
import User from "./models/user.js";
import { canMessageContact } from "./utils/messagingAccess.js";
import { notifyUser } from "./services/notificationService.js";
import fs from "fs";
import path from "path";
import { setSocketServer, addUserSocket, removeUserSocket, getUserSocketIds } from "./socketServer.js";
import { clientOrigins } from "./config/cors.js";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: clientOrigins, credentials: true },
});

setSocketServer(io);

// Auth middleware for socket
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("name role status");
    if (!user || user.status !== "Active") return next(new Error("User not found or inactive"));
    socket.user = { id: String(user._id), name: user.name, role: user.role };
    next();
  } catch {
    next(new Error("Auth failed"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.user.id;

  addUserSocket(userId, socket.id);

  // Auto-join all rooms this user is part of (rejoin on reconnect)
  // We do this lazily when join_room is called

  socket.on("join_room", async (contactId) => {
    try {
      if (!await canMessageContact(socket.user, contactId)) {
        socket.emit("chat_error", { message: "You do not have access to this conversation." });
        return;
      }

      const contactIdStr = String(contactId);
      const roomId = [userId, contactIdStr].sort().join("_");
      socket.join(roomId);

      const contactSocketIds = getUserSocketIds(contactIdStr);
      contactSocketIds.forEach((sid) => io.sockets.sockets.get(sid)?.join(roomId));
    } catch (error) {
      console.error("Chat room authorization failed:", error.message);
      socket.emit("chat_error", { message: "Unable to join this conversation." });
    }
  });

  socket.on("send_message", async ({ contactId, text } = {}) => {
    try {
      const trimmedText = typeof text === "string" ? text.trim() : "";
      if (!trimmedText || trimmedText.length > 5000 || !await canMessageContact(socket.user, contactId)) {
        socket.emit("chat_error", { message: "Message is invalid or this conversation is not available." });
        return;
      }

      const now = Date.now();
      const recentMessages = (socket.data.messageTimestamps || []).filter((timestamp) => now - timestamp < 10_000);
      if (recentMessages.length >= 20) {
        socket.emit("chat_error", { message: "Message limit reached. Try again shortly." });
        return;
      }
      socket.data.messageTimestamps = [...recentMessages, now];

      const contactIdStr = String(contactId);
      const roomId = [userId, contactIdStr].sort().join("_");
      socket.join(roomId);
      const msg = await Message.create({
        roomId,
        sender: userId,
        senderName: socket.user.name,
        senderRole: socket.user.role,
        text: trimmedText,
      });

      const payload = {
        _id: String(msg._id),
        roomId: msg.roomId,
        sender: String(msg.sender),
        senderName: msg.senderName,
        senderRole: msg.senderRole,
        text: msg.text,
        createdAt: msg.createdAt,
      };

      // Emit to everyone in the room (both sender and receiver)
      io.to(roomId).emit("receive_message", payload);

      const recipient = await User.findById(contactIdStr).select("role").lean();
      const recipientLink = recipient?.role === "patient" ? "/patient/messages" : recipient?.role === "doctor" ? "/doctor/messages" : "/admin/messages";
      await notifyUser(contactIdStr, {
        type: "message",
        title: `New message from ${socket.user.name}`,
        message: "Open Messages to view the new message.",
        link: recipientLink,
        metadata: { senderId: userId, roomId },
      });

      // Also directly emit to all sockets of the contact in case they haven't joined the room yet
      const contactSocketIds = getUserSocketIds(contactIdStr);
      if (contactSocketIds.size > 0) {
        contactSocketIds.forEach((sid) => {
          const contactSocket = io.sockets.sockets.get(sid);
          if (contactSocket && !contactSocket.rooms.has(roomId)) {
            contactSocket.join(roomId);
            contactSocket.emit("receive_message", payload);
          }
        });
      }
    } catch (error) {
      console.error("Message handling failed:", error.message);
      socket.emit("chat_error", { message: "Unable to send this message." });
    }
  });

  socket.on("disconnect", () => {
    removeUserSocket(userId, socket.id);
  });
});

const PORT = Number(process.env.PORT || 5000);

const startServer = async () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required to start the API");
  }
  if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    throw new Error("PORT must be a valid TCP port number");
  }

  await connectDB();
  await new Promise((resolve, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(PORT, resolve);
  });
  console.log(`Server running on port ${PORT}`);
};

const shutdown = async (signal) => {
  console.log(`${signal} received; shutting down`);
  await new Promise((resolve) => io.close(resolve));
  await mongoose.disconnect();
};

process.once("SIGINT", () => shutdown("SIGINT").catch((error) => {
  console.error("Shutdown failed:", error.message);
  process.exitCode = 1;
}));
process.once("SIGTERM", () => shutdown("SIGTERM").catch((error) => {
  console.error("Shutdown failed:", error.message);
  process.exitCode = 1;
}));

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exitCode = 1;
});
