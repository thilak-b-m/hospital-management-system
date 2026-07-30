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
