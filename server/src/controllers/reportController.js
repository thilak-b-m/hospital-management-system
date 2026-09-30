import Report from "../models/report.js";
import mongoose from "mongoose";
import path from "path";
import { unlink } from "fs/promises";
import { fileTypeFromFile } from "file-type";
import User from "../models/user.js";
import Doctor from "../models/doctor.js";
import Appointment from "../models/appointment.js";
import { emitToUser } from "../socketServer.js";
import { canAccessPatient } from "../utils/patientAccess.js";
import { notifyAdmins, notifyUser } from "../services/notificationService.js";

const getDoctorForUser = async (userId) => Doctor.findOne({ user: userId });
const discardUpload = async (file) => {
  if (file?.path) await unlink(file.path).catch(() => {});
};

const populateReportQuery = (query) => query
  .populate('patient', 'name email patientId')
  .populate('doctor', 'user department')
  .populate({ path: 'doctor', populate: { path: 'user', select: 'name email' } })
  .populate('appointment')
  .sort({ createdAt: -1 })
  .lean();

export const downloadReportFile = async (req, res) => {
  try {
    const { reportId } = req.params;
    if (!mongoose.isValidObjectId(reportId)) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    const report = await Report.findById(reportId).select("patient fileUrl");
    if (!report) return res.status(404).json({ success: false, message: "Report not found" });
    if (!await canAccessPatient(req.user, report.patient)) {
      return res.status(403).json({ success: false, message: "You do not have access to this patient's reports." });
    }

    const storedPath = new URL(report.fileUrl, "http://localhost").pathname;
    const filename = path.basename(storedPath);
    const uploadsPath = path.resolve(process.cwd(), "uploads");
    const filePath = path.resolve(uploadsPath, filename);
    if (!filename || !filePath.startsWith(`${uploadsPath}${path.sep}`)) {
      return res.status(404).json({ success: false, message: "Report file not found" });
    }

    res.set({
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    });
    return res.sendFile(filePath, (error) => {
      if (error && !res.headersSent) {
        res.status(error.statusCode === 404 ? 404 : 500).json({ success: false, message: "Unable to retrieve report file" });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getReports = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await User.findOne({ _id: patientId, role: "patient" });
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });
    if (!await canAccessPatient(req.user, patientId)) {
      return res.status(403).json({ success: false, message: "You do not have access to this patient's reports." });
    }

    const reports = await populateReportQuery(Report.find({ patient: patientId }));

    return res.status(200).json({ success: true, reports });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getDoctorReports = async (req, res) => {
  try {
    const doctor = await getDoctorForUser(req.user.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    let reports = await populateReportQuery(Report.find({ doctor: doctor._id }));
    if (reports.length === 0) {
      reports = await populateReportQuery(Report.find({ doctor: req.user.id }));
    }

    return res.status(200).json({ success: true, reports });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const uploadReport = async (req, res) => {
  let reportSaved = false;
  try {
    const { patientId } = req.params;
    const { title = '', notes = '', appointmentId } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const detectedType = await fileTypeFromFile(req.file.path);
    if (!detectedType || detectedType.mime !== req.file.mimetype) {
      await discardUpload(req.file);
      return res.status(400).json({ success: false, message: 'File content does not match an accepted report type.' });
    }
    if (!await canAccessPatient(req.user, patientId)) {
      await discardUpload(req.file);
      return res.status(403).json({ success: false, message: "You do not have access to this patient's reports." });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    let doctorId = undefined;
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (!doctor) {
        await discardUpload(req.file);
        return res.status(404).json({ success: false, message: 'Doctor profile not found' });
      }
      doctorId = doctor._id;
    }

    if (appointmentId) {
      const appointmentFilter = { _id: appointmentId, patient: patientId };
      if (doctorId) appointmentFilter.doctor = doctorId;
      if (!await Appointment.exists(appointmentFilter)) {
        await discardUpload(req.file);
        return res.status(403).json({ success: false, message: 'Appointment does not belong to this patient and care team.' });
      }
    }

    const report = await Report.create({
      patient: patientId,
      doctor: doctorId,
      appointment: appointmentId || undefined,
      title,
      notes,
      fileUrl,
    });
    reportSaved = true;

    const notificationDetails = {
      type: "report",
      title: "New medical report uploaded",
      message: `${title || "A medical report"} is available in your reports.`,
      link: req.user.role === "doctor" ? "/patient/reports" : "/doctor/reports",
      metadata: { reportId: String(report._id), patientId: String(patientId) },
    };
    if (req.user.role === "doctor") {
      await notifyUser(patientId, notificationDetails);
    } else if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId).populate({ path: "doctor", populate: { path: "user", select: "_id" } });
      if (appointment?.doctor?.user?._id) await notifyUser(appointment.doctor.user._id, notificationDetails);
    }
    await notifyAdmins({ ...notificationDetails, link: "/admin/reports" });

    if (doctorId) {
      emitToUser(String(req.user.id), 'report_update', {
        reportId: String(report._id),
        patientId,
        doctorId: String(doctorId),
        action: 'created',
      });
    }

    const patient = await User.findById(patientId).select('_id');
    if (patient) {
      emitToUser(String(patient._id), 'report_update', {
        reportId: String(report._id),
        patientId,
        doctorId: doctorId ? String(doctorId) : undefined,
        action: 'created',
      });
    }

    return res.status(201).json({ success: true, report });
  } catch (error) {
    if (!reportSaved) await discardUpload(req.file);
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
