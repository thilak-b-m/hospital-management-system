import express from "express";
import { getDoctorDashboard, getDoctorPatients } from "../controllers/doctorController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("doctor"));

router.get("/dashboard", getDoctorDashboard);
router.get("/patients", getDoctorPatients);

export default router;
