import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  createMedicalReport,
  getMedicalReports,
  getMedicalReportById,
  updateMedicalReport,
} from "../controllers/medicalReportController.js";

const router = express.Router();

router.use(protect);

router.post("/patient/:patientId/appointment/:appointmentId", authorize("doctor"), createMedicalReport);
router.get("/patient/:patientId", authorize("doctor", "patient", "admin"), getMedicalReports);
router.get("/:id", authorize("doctor", "patient", "admin"), getMedicalReportById);
router.put("/:id", authorize("doctor"), updateMedicalReport);

export default router;
