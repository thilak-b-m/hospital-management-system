import Appointment from "../models/appointment.js";
import Doctor from "../models/doctor.js";
import Prescription from "../models/prescription.js";
import User from "../models/user.js";
import { canAccessPatient } from "../utils/patientAccess.js";
import { emitToUser } from "../socketServer.js";
import { notifyUser } from "../services/notificationService.js";

const doctorPopulate = "name email phone role status";

const withPrescriptionRelations = (query) =>
  query
    .populate("patient", "name email phone patientId gender dob status")
    .populate({ path: "doctor", populate: { path: "user", select: doctorPopulate } })
    .populate("appointment", "appointmentDate appointmentTime symptoms status");

const getDoctorForUser = async (userId) => Doctor.findOne({ user: userId });

const buildRoleFilter = async (user) => {
  if (user.role === "admin") return {};
  if (user.role === "patient") return { patient: user.id };

  const doctor = await getDoctorForUser(user.id);
  if (!doctor) return { _id: null };
  return { doctor: doctor._id };
};

export const getPrescriptions = async (req, res) => {
  try {
    const filter = await buildRoleFilter(req.user);
    // Allow doctor/admin to query prescriptions for a specific patient
    const { patientId } = req.query;
    if (patientId && (req.user.role === "doctor" || req.user.role === "admin")) {
      filter.patient = patientId;
    }
    const prescriptions = await withPrescriptionRelations(
      Prescription.find(filter).sort({ createdAt: -1 })
    );

    return res.status(200).json({ success: true, prescriptions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createPrescription = async (req, res) => {
  try {
    const { patientId, doctorId, appointmentId, diagnosis, medications, notes = "" } = req.body;

    if (!patientId || !diagnosis || !Array.isArray(medications) || medications.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide patient, diagnosis and at least one medication",
      });
    }

    const patient = await User.findOne({ _id: patientId, role: "patient" });
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    let doctor;
    if (req.user.role === "doctor") {
      doctor = await getDoctorForUser(req.user.id);
      if (doctorId && String(doctorId) !== String(doctor?._id)) {
        return res.status(403).json({ success: false, message: "Doctors can only prescribe for themselves." });
      }
      if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found" });
      if (!await canAccessPatient(req.user, patient._id)) {
        return res.status(403).json({ success: false, message: "You can only prescribe for your own patients." });
      }
    } else if (doctorId) {
      doctor = await Doctor.findById(doctorId);
    }

    if (!doctor) {
      return res.status(400).json({ success: false, message: "Doctor is required" });
    }

    let appointment;
    if (appointmentId) {
      const appointmentFilter = { _id: appointmentId, patient: patient._id, doctor: doctor._id };
      appointment = await Appointment.findOne(appointmentFilter);
      if (!appointment) {
        return res.status(403).json({ success: false, message: "Appointment does not belong to this patient and doctor." });
      }
    }

    const prescription = await Prescription.create({
      patient: patient._id,
      doctor: doctor._id,
      appointment: appointmentId || undefined,
      diagnosis,
      medications,
      notes,
    });

    if (appointment) {
      appointment.status = "Completed";
      await appointment.save();
      const populatedAppointment = await Appointment.findById(appointment._id)
        .populate({ path: "doctor", populate: { path: "user", select: "_id" } });
      if (populatedAppointment?.doctor?.user?._id) {
        emitToUser(String(populatedAppointment.doctor.user._id), "doctor_schedule_update", {
          type: "appointment_completed",
          appointment: populatedAppointment,
        });
      }
    }

    const populated = await withPrescriptionRelations(Prescription.findById(prescription._id));
    await notifyUser(patient._id, {
      type: "system",
      title: "New prescription available",
      message: `A prescription for ${diagnosis} is available in your account.`,
      link: "/patient/prescriptions",
      metadata: { prescriptionId: String(prescription._id) },
    });
    return res.status(201).json({
      success: true,
      message: "Prescription saved successfully",
      prescription: populated,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
