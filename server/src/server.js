import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./config/db.js";
import Message from "./models/message.js";
import jwt from "jsonwebtoken";
import User from "./models/user.js";
import fs from "fs";
import path from "path";

connectDB();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "http://localhost:5173", credentials: true },
});

// Map userId -> Set of socketIds (a user can have multiple tabs open)
const userSockets = new Map();

// Auth middleware for socket
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token"));
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("name role");
    if (!user) return next(new Error("User not found"));
    socket.user = { id: String(user._id), name: user.name, role: user.role };
    next();
  } catch {
    next(new Error("Auth failed"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.user.id;

  // Track this socket under the user's id
  if (!userSockets.has(userId)) userSockets.set(userId, new Set());
  userSockets.get(userId).add(socket.id);

  // Auto-join all rooms this user is part of (rejoin on reconnect)
  // We do this lazily when join_room is called

  socket.on("join_room", (contactId) => {
    const contactIdStr = String(contactId);
    const roomId = [userId, contactIdStr].sort().join("_");

    // Join the room
    socket.join(roomId);

    // If the contact is also online, make all their sockets join this room too
    const contactSocketIds = userSockets.get(contactIdStr);
    if (contactSocketIds) {
      contactSocketIds.forEach((sid) => {
        const contactSocket = io.sockets.sockets.get(sid);
        if (contactSocket) {
          contactSocket.join(roomId);
        }
      });
    }
  });

  socket.on("send_message", async ({ contactId, text }) => {
    if (!text?.trim()) return;
    const contactIdStr = String(contactId);
    const roomId = [userId, contactIdStr].sort().join("_");

    try {
      const msg = await Message.create({
        roomId,
        sender: userId,
        senderName: socket.user.name,
        senderRole: socket.user.role,
        text: text.trim(),
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

      // Also directly emit to all sockets of the contact in case they haven't joined the room yet
      const contactSocketIds = userSockets.get(contactIdStr);
      if (contactSocketIds) {
        contactSocketIds.forEach((sid) => {
          const contactSocket = io.sockets.sockets.get(sid);
          if (contactSocket && !contactSocket.rooms.has(roomId)) {
            contactSocket.join(roomId);
            contactSocket.emit("receive_message", payload);
          }
        });
      }
    } catch (err) {
      console.error("Message save error:", err);
    }
  });

  socket.on("disconnect", () => {
    const sockets = userSockets.get(userId);
    if (sockets) {
      sockets.delete(socket.id);
      if (sockets.size === 0) userSockets.delete(userId);
    }
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
