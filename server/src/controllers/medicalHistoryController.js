import MedicalHistory from "../models/medicalHistory.js";
import User from "../models/user.js";
import Doctor from "../models/doctor.js";
import Appointment from "../models/appointment.js";
import { canAccessPatient } from "../utils/patientAccess.js";

const getOrCreate = async (patientId) => {
  let history = await MedicalHistory.findOne({ patient: patientId });
  if (!history) history = await MedicalHistory.create({ patient: patientId, entries: [], healthSummary: {} });
  return history;
};

export const getMedicalHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await User.findOne({ _id: patientId, role: "patient" });
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });
    if (!await canAccessPatient(req.user, patientId)) {
      return res.status(403).json({ success: false, message: "You do not have access to this patient's records." });
    }
    const history = await MedicalHistory.findOne({ patient: patientId }).lean();
    return res.status(200).json({ success: true, history: history || { patient: patientId, entries: [], healthSummary: {} } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateHealthSummary = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { bloodGroup, height, weight, allergies, chronicConditions } = req.body;
    if (!await canAccessPatient(req.user, patientId)) {
      return res.status(403).json({ success: false, message: "You do not have access to this patient's records." });
    }

    let doctorRef = null;
    if (req.user.role === "doctor") {
      const d = await Doctor.findOne({ user: req.user.id });
      if (d) doctorRef = d._id;
    }

    const history = await getOrCreate(patientId);
    history.healthSummary = {
      bloodGroup: bloodGroup || "",
      height: height || "",
      weight: weight || "",
      allergies: allergies || "",
      chronicConditions: chronicConditions || "",
      lastUpdatedBy: doctorRef,
      lastUpdatedAt: new Date(),
    };
    await history.save();
    return res.status(200).json({ success: true, healthSummary: history.healthSummary });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const addHistoryEntry = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { title, type = "Diagnosis", notes = "", medications = [], appointmentId, vitals } = req.body;

    if (!title) return res.status(400).json({ success: false, message: "Title is required" });
    if (!await canAccessPatient(req.user, patientId)) {
      return res.status(403).json({ success: false, message: "You do not have access to this patient's records." });
    }

    if (appointmentId) {
      const appointmentFilter = { _id: appointmentId, patient: patientId };
      if (req.user.role === "doctor") {
        const doctor = await Doctor.findOne({ user: req.user.id }).select("_id");
        if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found" });
        appointmentFilter.doctor = doctor._id;
      }
      if (!await Appointment.exists(appointmentFilter)) {
        return res.status(403).json({ success: false, message: "Appointment does not belong to this patient and care team." });
      }
    }

    const history = await getOrCreate(patientId);

    let doctorRef = null;
    let doctorName = "";
    if (req.user.role === "doctor") {
      const d = await Doctor.findOne({ user: req.user.id }).populate("user", "name");
      if (d) { doctorRef = d._id; doctorName = d.user?.name || ""; }
    }

    const entry = {
      date: new Date(),
      title,
      type,
      notes,
      doctor: doctorRef,
      doctorName,
      appointment: appointmentId || undefined,
      medications: Array.isArray(medications) ? medications : [],
      vitals: vitals || { bloodPressure: "", heartRate: "", temperature: "", respiratoryRate: "" },
    };

    history.entries.unshift(entry);
    await history.save();
    return res.status(201).json({ success: true, entry });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
