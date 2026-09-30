import express from "express";
import { getMedicalHistory, addHistoryEntry, updateHealthSummary } from "../controllers/medicalHistoryController.js";
import { authorize, protect } from "../middlewares/authMiddleware.js";
import { authorizePatientAccess } from "../middlewares/patientAccessMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/:patientId", authorizePatientAccess, getMedicalHistory);
router.put("/:patientId/health-summary", authorize("doctor", "admin"), authorizePatientAccess, updateHealthSummary);
router.post("/:patientId/entries", authorize("doctor", "admin"), authorizePatientAccess, addHistoryEntry);

export default router;
