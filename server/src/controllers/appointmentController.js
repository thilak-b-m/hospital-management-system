import Appointment from "../models/appointment.js";
import Doctor from "../models/doctor.js";
import User from "../models/user.js";
import { emitToUser } from "../socketServer.js";
import { canAccessPatient } from "../utils/patientAccess.js";
import { notifyAdmins, notifyUser } from "../services/notificationService.js";

const doctorPopulate = "name email phone role status";
const WEEK_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const withAppointmentRelations = (query) =>
  query
    .populate("patient", "name email phone patientId gender dob status")
    .populate({ path: "doctor", populate: { path: "user", select: doctorPopulate } });

const getDoctorForUser = async (userId) => Doctor.findOne({ user: userId });

const buildRoleFilter = async (user) => {
  if (user.role === "admin") return {};
  if (user.role === "patient") return { patient: user.id };
  const doctor = await getDoctorForUser(user.id);
  if (!doctor) return { _id: null };
  return { doctor: doctor._id };
};

export const createAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime, symptoms = "", patientId } = req.body;

    if (!appointmentDate || !appointmentTime) {
      return res.status(400).json({ success: false, message: "Please provide appointment date and appointment time" });
    }

    if (!['patient', 'doctor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "You cannot create appointments." });
    }

    let doctor = null;
    if (req.user.role === "doctor") {
      const ownDoctor = await getDoctorForUser(req.user.id);
      if (!ownDoctor) return res.status(404).json({ success: false, message: "Doctor profile not found" });
      if (doctorId && String(doctorId) !== String(ownDoctor._id)) {
        return res.status(403).json({ success: false, message: "Doctors can only create appointments for themselves." });
      }
      doctor = await Doctor.findById(ownDoctor._id).populate("user", doctorPopulate);
    } else if (doctorId) {
      doctor = await Doctor.findById(doctorId).populate("user", doctorPopulate);
    }

    if (!doctor || doctor.user?.status !== "Active") {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const appointmentDateObj = new Date(`${appointmentDate}T00:00:00Z`);
    if (Number.isNaN(appointmentDateObj.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid appointment date" });
    }
    const appointmentDateKey = appointmentDateObj.toISOString().split("T")[0];

    const unavailableMatch = (doctor.unavailableDates || []).some((entry) => {
      if (!entry?.date) return false;
      const entryDate = new Date(entry.date);
      const entryKey = new Date(Date.UTC(entryDate.getUTCFullYear(), entryDate.getUTCMonth(), entryDate.getUTCDate())).toISOString().split("T")[0];
      return entryKey === appointmentDateKey;
    });

    if (unavailableMatch) {
      return res.status(400).json({ success: false, message: "Doctor is unavailable on the selected day" });
    }

    const dayName = WEEK_DAYS[appointmentDateObj.getUTCDay()];
    const dayAvailability = doctor.availability?.find((slot) => slot.day === dayName);
    if (!dayAvailability || !dayAvailability.available) {
      return res.status(400).json({ success: false, message: "Doctor is unavailable on the selected day" });
    }

    let patient;
    if (req.user.role === "patient") {
      patient = req.user.id;
    } else {
      if (!patientId) return res.status(400).json({ success: false, message: "patientId is required" });
      patient = await User.findOne({ _id: patientId, role: "patient", status: "Active" }).select("_id");
      if (!patient) return res.status(404).json({ success: false, message: "Active patient not found" });
      patient = patient._id;
      if (req.user.role === "doctor" && !await canAccessPatient(req.user, patient)) {
        return res.status(403).json({ success: false, message: "You can only book follow-up appointments for your own patients." });
      }
    }

    const existingSlot = await Appointment.exists({
      doctor: doctor._id,
      appointmentDate: appointmentDateObj,
      appointmentTime,
      status: { $ne: "Cancelled" },
    });
    if (existingSlot) {
      return res.status(409).json({ success: false, message: "This appointment slot is already booked." });
    }

    const appointment = await Appointment.create({ patient, doctor: doctor._id, appointmentDate: appointmentDateObj, appointmentTime, symptoms, status: "Pending" });
    const populated = await withAppointmentRelations(Appointment.findById(appointment._id));

    if (doctor.user?._id) {
      emitToUser(String(doctor.user._id), "doctor_schedule_update", {
        type: "appointment_created",
        appointment: populated,
      });
    }

    await notifyUser(patient, {
      type: "appointment",
      title: "Appointment request submitted",
      message: `Your appointment request for ${appointmentDateKey} at ${appointmentTime} is pending.`,
      link: "/patient/appointments",
      metadata: { appointmentId: String(appointment._id) },
    });
    if (doctor.user?._id && String(doctor.user._id) !== String(req.user.id)) {
      await notifyUser(doctor.user._id, {
        type: "appointment",
        title: "New appointment request",
        message: `${populated.patient?.name || "A patient"} requested ${appointmentDateKey} at ${appointmentTime}.`,
        link: "/doctor/appointments",
        metadata: { appointmentId: String(appointment._id) },
      });
    }
    await notifyAdmins({
      type: "appointment",
      title: "New appointment request",
      message: `${populated.patient?.name || "A patient"} requested an appointment with ${doctor.user?.name || "a doctor"}.`,
      link: "/admin/appointments",
      metadata: { appointmentId: String(appointment._id) },
    }, req.user.role === "admin" ? [req.user.id] : []);

    return res.status(201).json({ success: true, message: "Appointment booked successfully", appointment: populated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const filter = await buildRoleFilter(req.user);
    const appointments = await withAppointmentRelations(
      Appointment.find(filter).sort({ appointmentDate: -1, appointmentTime: -1 })
    );
    return res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!await canAccessPatient(req.user, patientId)) {
      return res.status(403).json({ success: false, message: "You do not have access to this patient's appointments." });
    }
    const appointments = await withAppointmentRelations(
      Appointment.find({ patient: patientId }).sort({ appointmentDate: -1 })
    );
    return res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Pending", "Confirmed", "Completed", "Cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid appointment status" });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

    if (req.user.role === "patient") {
      if (String(appointment.patient) !== req.user.id || status !== "Cancelled") {
        return res.status(403).json({ success: false, message: "Patients can only cancel their own appointments" });
      }
    }

    if (req.user.role === "doctor") {
      const doctor = await getDoctorForUser(req.user.id);
      if (!doctor || String(appointment.doctor) !== String(doctor._id)) {
        return res.status(403).json({ success: false, message: "You cannot update this appointment" });
      }
    }

    appointment.status = status;
    await appointment.save();

    const populated = await withAppointmentRelations(Appointment.findById(appointment._id));

    const appointmentDoctor = await Doctor.findById(appointment.doctor).populate("user", "_id");
    if (appointmentDoctor?.user?._id) {
      emitToUser(String(appointmentDoctor.user._id), "doctor_schedule_update", {
        type: "appointment_status_updated",
        appointment: populated,
      });
    }

    const changedAt = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    await notifyUser(populated.patient?._id, {
      type: "appointment",
      title: `Appointment ${status.toLowerCase()}`,
      message: `Your appointment on ${changedAt} is now ${status.toLowerCase()}.`,
      link: "/patient/appointments",
      metadata: { appointmentId: String(appointment._id), status },
    });
    const doctorUserId = populated.doctor?.user?._id;
    if (doctorUserId && String(doctorUserId) !== String(req.user.id)) {
      await notifyUser(doctorUserId, {
        type: "appointment",
        title: `Appointment ${status.toLowerCase()}`,
        message: `${populated.patient?.name || "A patient"}'s appointment is now ${status.toLowerCase()}.`,
        link: "/doctor/appointments",
        metadata: { appointmentId: String(appointment._id), status },
      });
    }
    await notifyAdmins({
      type: "appointment",
      title: `Appointment ${status.toLowerCase()}`,
      message: `${populated.patient?.name || "A patient"}'s appointment status changed to ${status.toLowerCase()}.`,
      link: "/admin/appointments",
      metadata: { appointmentId: String(appointment._id), status },
    }, req.user.role === "admin" ? [req.user.id] : []);

    return res.status(200).json({ success: true, message: "Appointment updated successfully", appointment: populated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
