import Report from "../models/report.js";
import User from "../models/user.js";
import Doctor from "../models/doctor.js";

export const getReports = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await User.findById(patientId);
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

    const reports = await Report.find({ patient: patientId }).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, reports });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const uploadReport = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { title = '', notes = '', appointmentId } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const host = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
    const fileUrl = `${host}/uploads/${req.file.filename}`;

    let doctorRef = undefined;
    if (req.user.role === 'doctor') {
      const d = await Doctor.findOne({ user: req.user.id });
      if (d) doctorRef = d._id;
    }

    const report = await Report.create({
      patient: patientId,
      doctor: doctorRef,
      appointment: appointmentId || undefined,
      title,
      notes,
      fileUrl,
    });

    return res.status(201).json({ success: true, report });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
