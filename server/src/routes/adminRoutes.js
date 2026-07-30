import express from "express";
import {
  addDoctor,
  addPatient,
  createService,
  deleteAppointment,
  deleteDoctor,
  deletePatient,
  deleteService,
  deleteUser,
  getAllDoctors,
  getAllUsers,
  getAppointments,
  getDashboardStats,
  getDoctorById,
  getDoctorsByDepartment,
  getPatients,
  getServices,
  getUserByRole,
  updateAppointmentStatus,
  updateDoctor,
  updatePatient,
  updateService,
} from "../controllers/adminController.js";
import { authorize, protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/dashboard", getDashboardStats);

router.get("/users", getAllUsers);
router.get("/users/role/:role", getUserByRole);
router.delete("/users/:id", deleteUser);

router.post("/doctors", addDoctor);
router.get("/doctors", getAllDoctors);
router.get("/doctors/department/:department", getDoctorsByDepartment);
router.get("/doctors/:id", getDoctorById);
router.put("/doctors/:id", updateDoctor);
router.delete("/doctors/:id", deleteDoctor);

router.post("/patients", addPatient);
router.get("/patients", getPatients);
router.put("/patients/:id", updatePatient);
router.delete("/patients/:id", deletePatient);

router.post("/services", createService);
router.get("/services", getServices);
router.put("/services/:id", updateService);
router.delete("/services/:id", deleteService);

router.get("/appointments", getAppointments);
router.patch("/appointments/:id/status", updateAppointmentStatus);
router.delete("/appointments/:id", deleteAppointment);

export default router;
