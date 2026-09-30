import Appointment from "../models/appointment.js";
import Doctor from "../models/doctor.js";
import Prescription from "../models/prescription.js";

const getDoctorForUser = async (userId) => Doctor.findOne({ user: userId });

export const getDoctorDashboard = async (req, res) => {
  try {
    const doctor = await getDoctorForUser(req.user.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const [todayAppointments, allAppointments, prescriptions] = await Promise.all([
      Appointment.find({ doctor: doctor._id, appointmentDate: { $gte: start, $lt: end } })
        .sort({ appointmentTime: 1 })
        .populate("patient", "name phone patientId gender dob"),
      Appointment.find({ doctor: doctor._id }).populate("patient", "name"),
      Prescription.countDocuments({ doctor: doctor._id }),
    ]);

    const uniquePatients = new Set(allAppointments.map((appointment) => String(appointment.patient?._id)));
    const pending = allAppointments.filter((appointment) => appointment.status === "Pending").length;

    return res.status(200).json({
      success: true,
      stats: {
        todayAppointments: todayAppointments.length,
        totalPatients: uniquePatients.size,
        pendingAppointments: pending,
        prescriptions,
      },
      todayAppointments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getDoctorPatients = async (req, res) => {
  try {
    const doctor = await getDoctorForUser(req.user.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    const appointments = await Appointment.find({ doctor: doctor._id, status: { $ne: "Cancelled" } })
      .sort({ appointmentDate: -1 })
      .populate("patient", "name email phone patientId gender dob status");

    const patientMap = new Map();
    appointments.forEach((appointment) => {
      if (!appointment.patient || appointment.patient.status !== "Active") return;
      const key = String(appointment.patient._id);
      if (!patientMap.has(key)) {
        patientMap.set(key, {
          ...appointment.patient.toObject(),
          lastVisit: appointment.appointmentDate,
        });
      }
    });

    return res.status(200).json({
      success: true,
      patients: Array.from(patientMap.values()),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const normalizeDateString = (date) => {
  if (!date) return null;
  let year;
  let month;
  let day;

  if (date instanceof Date) {
    year = date.getUTCFullYear();
    month = date.getUTCMonth() + 1;
    day = date.getUTCDate();
  } else if (typeof date === "string") {
    const parts = date.split("-");
    if (parts.length !== 3) return null;
    [year, month, day] = parts.map(Number);
  } else {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return null;
    year = d.getUTCFullYear();
    month = d.getUTCMonth() + 1;
    day = d.getUTCDate();
  }

  if ([year, month, day].some((value) => Number.isNaN(value))) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

const createUTCDateFromString = (dateString) => {
  const normalized = normalizeDateString(dateString);
  if (!normalized) return null;
  const [year, month, day] = normalized.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

export const addUnavailableDate = async (req, res) => {
  try {
    const { date, reason = "" } = req.body;
    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required" });
    }

    const doctor = await getDoctorForUser(req.user.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    const requestedDate = normalizeDateString(date);
    if (!requestedDate) {
      return res.status(400).json({ success: false, message: "Invalid date format" });
    }

    const alreadyUnavailable = (doctor.unavailableDates || []).some((entry) => {
      if (!entry?.date) return false;
      return normalizeDateString(entry.date) === requestedDate;
    });

    if (alreadyUnavailable) {
      return res.status(400).json({ success: false, message: "This date is already marked unavailable" });
    }

    const utcDate = createUTCDateFromString(requestedDate);
    doctor.unavailableDates.push({ date: utcDate, reason });
    await doctor.save();

    return res.status(200).json({
      success: true,
      message: "Date marked unavailable successfully",
      unavailableDates: doctor.unavailableDates.map((entry) => ({
        date: normalizeDateString(entry.date),
        reason: entry.reason || "",
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const removeUnavailableDate = async (req, res) => {
  try {
    const { date } = req.params;
    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required" });
    }

    const requestedDate = normalizeDateString(date);
    if (!requestedDate) {
      return res.status(400).json({ success: false, message: "Invalid date format" });
    }

    const doctor = await getDoctorForUser(req.user.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    doctor.unavailableDates = (doctor.unavailableDates || []).filter((entry) => {
      if (!entry?.date) return true;
      return normalizeDateString(entry.date) !== requestedDate;
    });
    await doctor.save();

    return res.status(200).json({
      success: true,
      message: "Unavailable date removed successfully",
      unavailableDates: doctor.unavailableDates.map((entry) => ({
        date: normalizeDateString(entry.date),
        reason: entry.reason || "",
      })),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getDoctorSchedule = async (req, res) => {
  try {
    const doctor = await getDoctorForUser(req.user.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const month = parseInt(req.query.month, 10) || new Date().getMonth() + 1;

    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));

    const appointments = await Appointment.find({
      doctor: doctor._id,
      appointmentDate: { $gte: start, $lt: end },
    })
      .populate("patient", "name phone patientId gender")
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .lean();

    const byDate = {};
    const daySummary = {};
    const now = new Date();

    const toDateKey = (dateObj) => {
      const date = new Date(dateObj);
      return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
    };

    appointments.forEach((appt) => {
      const key = toDateKey(appt.appointmentDate);
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push({
        _id: String(appt._id),
        patientName: appt.patient?.name || "Unknown",
        patientId: appt.patient?.patientId || "",
        phone: appt.patient?.phone || "",
        gender: appt.patient?.gender || "",
        time: appt.appointmentTime,
        symptoms: appt.symptoms || "",
        status: appt.status,
        appointmentDate: appt.appointmentDate,
      });

      if (!daySummary[key]) {
        daySummary[key] = { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
      }
      daySummary[key].total += 1;
      if (appt.status in daySummary[key]) {
        daySummary[key][appt.status.toLowerCase()] += 1;
      }
    });

    const total = appointments.length;
    const confirmed = appointments.filter((a) => a.status === "Confirmed").length;
    const pending = appointments.filter((a) => a.status === "Pending").length;
    const completed = appointments.filter((a) => a.status === "Completed").length;
    const cancelled = appointments.filter((a) => a.status === "Cancelled").length;

    return res.status(200).json({
      success: true,
      year,
      month,
      stats: { total, confirmed, pending, completed, cancelled },
      byDate,
      daySummary,
      availability: doctor.availability,
      unavailableDates: (doctor.unavailableDates || []).map((entry) => ({
        date: normalizeDateString(entry.date),
        reason: entry.reason || "",
      })),
      upcoming: appointments.filter((appt) => new Date(appt.appointmentDate) >= now).slice(0, 20),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
