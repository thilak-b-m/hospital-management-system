import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import medicalHistoryRoutes from "./routes/medicalHistoryRoutes.js";
import medicalReportRoutes from "./routes/medicalReportRoutes.js";
import catalogRoutes from "./routes/catalogRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { clientOrigins } from "./config/cors.js";
import mongoose from "mongoose";

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: clientOrigins, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb", parameterLimit: 100 }));
app.use(cookieParser());

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ success: false, message: "Too many login attempts. Try again later." }),
});
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ success: false, message: "Too many registration attempts. Try again later." }),
});

app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/register", registrationLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/medical-history", medicalHistoryRoutes);
app.use("/api/medical-reports", medicalReportRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/messages", messageRoutes);
app.use('/api/reports', reportRoutes);
app.use("/api/notifications", notificationRoutes);

// Serve uploaded files
app.get("/health/live", (req, res) => {
  res.status(200).json({ success: true, status: "alive" });
});

app.get("/health/ready", (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ success: ready, status: ready ? "ready" : "not ready" });
});

app.get("/", (req, res) => {
  res.json({ success: true, message: "Hospital Management API Running" });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  console.error("Request failed:", error.message);
  const isUploadError = error.name === "MulterError" || error.code?.startsWith("LIMIT_");
  const status = isUploadError && error.code === "LIMIT_FILE_SIZE"
    ? 413
    : error.statusCode || error.status || (isUploadError ? 400 : 500);
  const message = status < 500 ? error.message : "Server error";
  return res.status(status).json({ success: false, message });
});

export default app;
