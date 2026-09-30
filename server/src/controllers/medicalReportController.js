import MedicalReport from "../models/medicalReport.js";
import Appointment from "../models/appointment.js";
import Doctor from "../models/doctor.js";
import User from "../models/user.js";

const getDoctorForUser = async (userId) => Doctor.findOne({ user: userId });

export const createMedicalReport = async (req, res) => {
  try {
    const { patientId, appointmentId } = req.params;
    const { diagnosis, symptoms = "", prescription = "", doctorNotes = "" } = req.body;

    if (!diagnosis || !appointmentId || !patientId) {
      return res.status(400).json({ success: false, message: "Patient, appointment and diagnosis are required." });
    }

    const appointment = await Appointment.findById(appointmentId).populate("doctor");
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found." });
    }

    if (String(appointment.patient) !== String(patientId)) {
      return res.status(400).json({ success: false, message: "Appointment does not belong to the provided patient." });
    }

    if (appointment.status !== "Completed") {
      return res.status(400).json({ success: false, message: "Medical reports can only be created for completed appointments." });
    }

    const doctor = await getDoctorForUser(req.user.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor profile not found." });
    }

    if (String(appointment.doctor._id) !== String(doctor._id)) {
      return res.status(403).json({ success: false, message: "You are not the doctor assigned to this appointment." });
    }

    const existingReport = await MedicalReport.findOne({ appointment: appointmentId });
    if (existingReport) {
      return res.status(409).json({ success: false, message: "A medical report already exists for this appointment." });
    }

    const report = await MedicalReport.create({
      patient: patientId,
      doctor: doctor._id,
      appointment: appointmentId,
      diagnosis,
      symptoms,
      prescription,
      doctorNotes,
    });

    return res.status(201).json({ success: true, report });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getMedicalReports = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (req.user.role === "patient" && String(req.user.id) !== String(patientId)) {
      return res.status(403).json({ success: false, message: "Forbidden. You can only view your own reports." });
    }

    if (req.user.role === "doctor") {
      const doctor = await getDoctorForUser(req.user.id);
      if (!doctor) {
        return res.status(404).json({ success: false, message: "Doctor profile not found." });
      }
      const reports = await MedicalReport.find({ patient: patientId, doctor: doctor._id })
        .populate("patient", "name email patientId")
        .populate("doctor", "user department")
        .populate({ path: "doctor", populate: { path: "user", select: "name email" } })
        .populate("appointment")
        .sort({ createdAt: -1 })
        .lean();
      return res.status(200).json({ success: true, reports });
    }

    if (req.user.role === "admin") {
      const reports = await MedicalReport.find({ patient: patientId })
        .populate("patient", "name email patientId")
        .populate("doctor", "user department")
        .populate({ path: "doctor", populate: { path: "user", select: "name email" } })
        .populate("appointment")
        .sort({ createdAt: -1 })
        .lean();
      return res.status(200).json({ success: true, reports });
    }

    return res.status(403).json({ success: false, message: "Forbidden. You do not have permission to view reports." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getMedicalReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await MedicalReport.findById(id)
      .populate("patient", "name email patientId")
      .populate("doctor", "user department")
      .populate({ path: "doctor", populate: { path: "user", select: "name email" } })
      .populate("appointment")
      .lean();

    if (!report) {
      return res.status(404).json({ success: false, message: "Medical report not found." });
    }

    if (req.user.role === "patient" && String(report.patient._id) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Forbidden. You can only view your own reports." });
    }

    if (req.user.role === "doctor") {
      const doctor = await getDoctorForUser(req.user.id);
      if (!doctor) {
        return res.status(404).json({ success: false, message: "Doctor profile not found." });
      }
      if (String(report.doctor._id) !== String(doctor._id)) {
        return res.status(403).json({ success: false, message: "Forbidden. You can only view your own patient reports." });
      }
    }

    return res.status(200).json({ success: true, report });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateMedicalReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnosis, symptoms, prescription, doctorNotes } = req.body;

    const report = await MedicalReport.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: "Medical report not found." });
    }

    const doctor = await getDoctorForUser(req.user.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor profile not found." });
    }

    if (String(report.doctor) !== String(doctor._id)) {
      return res.status(403).json({ success: false, message: "Forbidden. You can only update your own reports." });
    }

    if (diagnosis !== undefined) report.diagnosis = diagnosis;
    if (symptoms !== undefined) report.symptoms = symptoms;
    if (prescription !== undefined) report.prescription = prescription;
    if (doctorNotes !== undefined) report.doctorNotes = doctorNotes;

    await report.save();
    return res.status(200).json({ success: true, report });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
