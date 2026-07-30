import express from "express";
import { getPublicDoctors, getPublicDoctorById, getPublicServices } from "../controllers/catalogController.js";

const router = express.Router();

router.get("/doctors", getPublicDoctors);
router.get("/doctors/:id", getPublicDoctorById);
router.get("/services", getPublicServices);

export default router;
