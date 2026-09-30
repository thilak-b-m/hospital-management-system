import express from "express";
import { getDoctorDashboard, getDoctorPatients, getDoctorSchedule, addUnavailableDate, removeUnavailableDate } from "../controllers/doctorController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("doctor"));

router.get("/dashboard", getDoctorDashboard);
router.get("/patients", getDoctorPatients);
router.get("/schedule", getDoctorSchedule);
router.post("/unavailable", addUnavailableDate);
router.delete("/unavailable/:date", removeUnavailableDate);

export default router;
