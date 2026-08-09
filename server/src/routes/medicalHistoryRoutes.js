import express from "express";
import { getMedicalHistory, addHistoryEntry, updateHealthSummary } from "../controllers/medicalHistoryController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/:patientId", getMedicalHistory);
router.put("/:patientId/health-summary", updateHealthSummary);
router.post("/:patientId/entries", addHistoryEntry);

export default router;
