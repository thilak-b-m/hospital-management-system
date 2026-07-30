import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import catalogRoutes from "./routes/catalogRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.json({ success: true, message: "Hospital Management API Running" });
});

export default app;
