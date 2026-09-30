import Message from "../models/message.js";
import User from "../models/user.js";
import Doctor from "../models/doctor.js";
import Appointment from "../models/appointment.js";
import { canMessageContact } from "../utils/messagingAccess.js";

// GET /api/messages/contacts — list of people this user has chatted with or can chat with
export const getContacts = async (req, res) => {
  try {
    const { id, role } = req.user;

    let contacts = [];

    if (role === "patient") {
      const appointments = await Appointment.find({ patient: id, status: { $ne: "Cancelled" } })
        .populate({ path: "doctor", populate: { path: "user", select: "name email role status" } })
        .sort({ appointmentDate: -1 });
      const seen = new Set();
      contacts = appointments
        .filter((appointment) => {
          const doctorUser = appointment.doctor?.user;
          if (!doctorUser || doctorUser.status !== "Active" || seen.has(String(doctorUser._id))) return false;
          seen.add(String(doctorUser._id));
          return true;
        })
        .map((appointment) => ({
          _id: appointment.doctor.user._id,
          name: appointment.doctor.user.name,
          role: "doctor",
          sub: appointment.doctor.department,
          doctorId: appointment.doctor._id,
        }));
    } else if (role === "doctor") {
      // Show all patients who have appointments with this doctor
      const doctor = await Doctor.findOne({ user: id });
      if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

      const appts = await Appointment.find({ doctor: doctor._id })
        .populate("patient", "name email role status patientId")
        .sort({ appointmentDate: -1 });

      const seen = new Set();
      contacts = appts
        .filter((a) => a.status !== "Cancelled" && a.patient?.status === "Active" && !seen.has(String(a.patient._id)) && seen.add(String(a.patient._id)))
        .map((a) => ({
          _id: a.patient._id,
          name: a.patient.name,
          role: "patient",
          sub: a.patient.patientId || "Patient",
        }));
    } else if (role === "admin") {
      // Admin can chat with all doctors and patients
      const users = await User.find({ role: { $in: ["doctor", "patient"] }, status: "Active" })
        .select("name role")
        .sort({ role: 1, name: 1 });
      contacts = users.map((u) => ({ _id: u._id, name: u.name, role: u.role, sub: u.role }));
    }

    return res.status(200).json({ success: true, contacts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/messages/:contactId — fetch message history
export const getMessages = async (req, res) => {
  try {
    const { id } = req.user;
    const { contactId } = req.params;
    if (!await canMessageContact(req.user, contactId)) {
      return res.status(403).json({ success: false, message: "You do not have access to this conversation." });
    }
    const roomId = [id, contactId].sort().join("_");

    const messages = await Message.find({ roomId }).sort({ createdAt: 1 }).limit(100).lean();
    const normalized = messages.map(m => ({ ...m, _id: String(m._id), sender: String(m.sender) }));
    return res.status(200).json({ success: true, messages: normalized });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
