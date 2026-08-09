import Appointment from "../models/appointment.js";
import Doctor from "../models/doctor.js";
import Prescription from "../models/prescription.js";

const getDoctorForUser = async (userId) => Doctor.findOne({ user: userId });

export const getDoctorPatients = async (req, res) => {
  try {
    const doctor = await getDoctorForUser(req.user.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor profile not found" });
    }

    const appointments = await Appointment.find({ doctor: doctor._id })
      .sort({ appointmentDate: -1 })
      .populate("patient", "name email phone patientId gender dob status");

    const patientMap = new Map();
    appointments.forEach((appointment) => {
      if (!appointment.patient) return;
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

export const getDoctorSchedule = async (req, res) => {
  try {
    const doctor = await getDoctorForUser(req.user.id);
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor profile not found" });

    const year  = parseInt(req.query.year)  || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1; // 1-based

    // Start and end of the requested month
    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month, 1);

    const appointments = await Appointment.find({
      doctor: doctor._id,
      appointmentDate: { $gte: start, $lt: end },
    })
      .populate("patient", "name phone patientId gender")
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .lean();

    // Group by date string YYYY-MM-DD
    const byDate = {};
    appointments.forEach((appt) => {
      const d = new Date(appt.appointmentDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
      });
    });

    // Summary stats for the month
    const total     = appointments.length;
    const confirmed = appointments.filter((a) => a.status === "Confirmed").length;
    const pending   = appointments.filter((a) => a.status === "Pending").length;
    const completed = appointments.filter((a) => a.status === "Completed").length;
    const cancelled = appointments.filter((a) => a.status === "Cancelled").length;

    return res.status(200).json({
      success: true,
      year,
      month,
      stats: { total, confirmed, pending, completed, cancelled },
      byDate,
      availability: doctor.availability,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

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
