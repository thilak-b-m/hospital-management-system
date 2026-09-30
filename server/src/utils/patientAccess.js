import mongoose from "mongoose";
import Appointment from "../models/appointment.js";
import Doctor from "../models/doctor.js";

export const canAccessPatient = async (user, patientId) => {
  if (!user?.id || !mongoose.isValidObjectId(patientId)) return false;

  if (user.role === "admin") return true;
  if (user.role === "patient") return String(user.id) === String(patientId);
  if (user.role !== "doctor") return false;

  const doctor = await Doctor.findOne({ user: user.id }).select("_id");
  if (!doctor) return false;

  return Boolean(await Appointment.exists({
    doctor: doctor._id,
    patient: patientId,
    status: { $ne: "Cancelled" },
  }));
};