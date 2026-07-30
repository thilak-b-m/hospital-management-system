import express from "express";
import { getPrescriptions, createPrescription } from "../controllers/prescriptionController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getPrescriptions);
router.post("/", createPrescription);

export default router;
