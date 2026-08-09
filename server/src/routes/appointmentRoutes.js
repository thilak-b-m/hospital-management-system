import express from "express";
import { createAppointment, getAppointments, updateAppointmentStatus, getPatientAppointments } from "../controllers/appointmentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.post("/", createAppointment);
router.get("/", getAppointments);
router.get("/patient/:patientId", getPatientAppointments);
router.patch("/:id/status", updateAppointmentStatus);

export default router;
