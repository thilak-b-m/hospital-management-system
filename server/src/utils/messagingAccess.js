import mongoose from "mongoose";
import Appointment from "../models/appointment.js";
import Doctor from "../models/doctor.js";
import User from "../models/user.js";

export const canMessageContact = async (user, contactId) => {
  if (!user?.id || !mongoose.isValidObjectId(contactId) || String(user.id) === String(contactId)) {
    return false;
  }

  const contact = await User.findOne({ _id: contactId, status: "Active" }).select("_id role");
  if (!contact) return false;

  if (user.role === "admin") return ["doctor", "patient"].includes(contact.role);

  const doctorUserId = user.role === "doctor" ? user.id : contact._id;
  const patientUserId = user.role === "patient" ? user.id : contact._id;
  if (!(["patient", "doctor"].includes(user.role) && ["patient", "doctor"].includes(contact.role))) {
    return false;
  }

  const doctor = await Doctor.findOne({ user: doctorUserId }).select("_id");
  if (!doctor) return false;

  return Boolean(await Appointment.exists({
    doctor: doctor._id,
    patient: patientUserId,
    status: { $ne: "Cancelled" },
  }));
};