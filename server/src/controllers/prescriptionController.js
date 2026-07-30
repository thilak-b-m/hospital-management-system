import Appointment from "../models/appointment.js";
import Doctor from "../models/doctor.js";
import Prescription from "../models/prescription.js";
import User from "../models/user.js";

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
    } else if (doctorId) {
      doctor = await Doctor.findById(doctorId);
    }

    if (!doctor) {
      return res.status(400).json({ success: false, message: "Doctor is required" });
    }

    const prescription = await Prescription.create({
      patient: patient._id,
      doctor: doctor._id,
      appointment: appointmentId || undefined,
      diagnosis,
      medications,
      notes,
    });

    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, { status: "Completed" });
    }

    const populated = await withPrescriptionRelations(Prescription.findById(prescription._id));
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
