import Appointment from "../models/appointment.js";
import Doctor from "../models/doctor.js";

const doctorPopulate = "name email phone role status";

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

    let doctor = null;
    if (doctorId) {
      doctor = await Doctor.findById(doctorId).populate("user", doctorPopulate);
    }
    // If the request is from a doctor and no doctorId provided, use the doctor's profile for the current user
    if (!doctor && req.user.role === "doctor") {
      const d = await getDoctorForUser(req.user.id);
      if (d) doctor = await Doctor.findById(d._id).populate("user", doctorPopulate);
    }

    if (!doctor || doctor.user?.status !== "Active") {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    let patient;
    if (req.user.role === "doctor") {
      if (!patientId) return res.status(400).json({ success: false, message: "patientId is required" });
      patient = patientId;
    } else if (req.user.role === "admin" && patientId) {
      patient = patientId;
    } else {
      patient = req.user.id;
    }

    const appointment = await Appointment.create({ patient, doctor: doctor._id, appointmentDate, appointmentTime, symptoms, status: "Pending" });
    const populated = await withAppointmentRelations(Appointment.findById(appointment._id));
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
    return res.status(200).json({ success: true, message: "Appointment updated successfully", appointment: populated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
