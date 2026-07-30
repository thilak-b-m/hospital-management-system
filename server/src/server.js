import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./config/db.js";
import Message from "./models/message.js";
import jwt from "jsonwebtoken";
import User from "./models/user.js";

connectDB();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "http://localhost:5173", credentials: true },
});

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
  // Join a private room with a contact
  socket.on("join_room", (contactId) => {
    const roomId = [socket.user.id, contactId].sort().join("_");
    socket.join(roomId);
  });

  // Send message
  socket.on("send_message", async ({ contactId, text }) => {
    if (!text?.trim()) return;
    const roomId = [socket.user.id, contactId].sort().join("_");
    try {
      const msg = await Message.create({
        roomId,
        sender: socket.user.id,
        senderName: socket.user.name,
        senderRole: socket.user.role,
        text: text.trim(),
      });
      io.to(roomId).emit("receive_message", {
        _id: msg._id,
        sender: msg.sender,
        senderName: msg.senderName,
        senderRole: msg.senderRole,
        text: msg.text,
        createdAt: msg.createdAt,
      });
    } catch (err) {
      console.error("Message save error:", err);
    }
  });

  socket.on("disconnect", () => {});
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
