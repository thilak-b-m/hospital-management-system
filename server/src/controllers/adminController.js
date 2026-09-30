import bcrypt from "bcrypt";
import mongoose from "mongoose";
import Appointment from "../models/appointment.js";
import Doctor from "../models/doctor.js";
import Prescription from "../models/prescription.js";
import Service from "../models/services.js";
import User from "../models/user.js";
import { isPasswordAcceptable } from "../utils/passwordPolicy.js";
import { notifyUser } from "../services/notificationService.js";

const nextPatientId = async () => {
  const count = await User.countDocuments({ role: "patient" });
  return `PT${String(count + 1).padStart(4, "0")}`;
};

const doctorPopulate = "name email phone role status";

export const getDashboardStats = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const [patients, doctors, appointmentsToday, appointments, services, recentAppointments, departmentStats, departmentActivity] =
      await Promise.all([
        User.countDocuments({ role: "patient" }),
        Doctor.countDocuments(),
        Appointment.countDocuments({ appointmentDate: { $gte: start, $lt: end } }),
        Appointment.countDocuments(),
        Service.countDocuments({ status: "Active" }),
        Appointment.find()
          .sort({ appointmentDate: -1, appointmentTime: -1 })
          .limit(5)
          .populate("patient", "name patientId")
          .populate({ path: "doctor", populate: { path: "user", select: doctorPopulate } }),
        Doctor.aggregate([{ $group: { _id: "$department", doctors: { $sum: 1 } } }]),
        Appointment.aggregate([
          { $lookup: { from: Doctor.collection.name, localField: "doctor", foreignField: "_id", as: "doctor" } },
          { $unwind: "$doctor" },
          { $group: {
            _id: "$doctor.department",
            appointments: { $sum: 1 },
            patients: { $addToSet: "$patient" },
          } },
          { $project: { appointments: 1, patients: { $size: "$patients" } } },
        ]),
      ]);

    const activityByDepartment = new Map(departmentActivity.map((department) => [department._id, department]));
    const departments = departmentStats.map((department) => ({
      ...department,
      appointments: activityByDepartment.get(department._id)?.appointments || 0,
      patients: activityByDepartment.get(department._id)?.patients || 0,
    }));

    return res.status(200).json({
      success: true,
      stats: {
        patients,
        doctors,
        appointmentsToday,
        appointments,
        services,
      },
      recentAppointments,
      departmentStats: departments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAdminReportAnalytics = async (req, res) => {
  try {
    const rangeEnd = new Date();
    rangeEnd.setUTCMonth(rangeEnd.getUTCMonth() + 1, 1);
    rangeEnd.setUTCHours(0, 0, 0, 0);
    const rangeStart = new Date(rangeEnd);
    rangeStart.setUTCMonth(rangeStart.getUTCMonth() - 12);

    const appointmentRange = { appointmentDate: { $gte: rangeStart, $lt: rangeEnd } };
    const [totalPatients, totalAppointments, activeServices, revenueResult, monthlyAppointments, monthlyPatients, departmentPerformance] = await Promise.all([
      User.countDocuments({ role: "patient" }),
      Appointment.countDocuments(),
      Service.countDocuments({ status: "Active" }),
      Appointment.aggregate([
        { $match: { status: "Completed" } },
        { $lookup: { from: Doctor.collection.name, localField: "doctor", foreignField: "_id", as: "doctor" } },
        { $unwind: "$doctor" },
        { $group: { _id: null, total: { $sum: { $ifNull: ["$doctor.consultationFee", 0] } } } },
      ]),
      Appointment.aggregate([
        { $match: appointmentRange },
        { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$appointmentDate", timezone: "UTC" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      User.aggregate([
        { $match: { role: "patient", createdAt: { $gte: rangeStart, $lt: rangeEnd } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt", timezone: "UTC" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Appointment.aggregate([
        { $match: appointmentRange },
        { $lookup: { from: Doctor.collection.name, localField: "doctor", foreignField: "_id", as: "doctor" } },
        { $unwind: "$doctor" },
        { $group: {
          _id: "$doctor.department",
          appointments: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
          patients: { $addToSet: "$patient" },
          revenue: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, { $ifNull: ["$doctor.consultationFee", 0] }, 0] } },
        } },
        { $project: { appointments: 1, completed: 1, revenue: 1, patients: { $size: "$patients" } } },
        { $sort: { appointments: -1 } },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      range: { from: rangeStart, to: rangeEnd },
      kpis: {
        totalPatients,
        totalAppointments,
        totalRevenue: revenueResult[0]?.total || 0,
        activeServices,
      },
      monthlyAppointments,
      monthlyPatients,
      departmentPerformance,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Unable to load report analytics" });
  }
};

export const getAdminRuntimeSettings = async (req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  return res.status(200).json({
    success: true,
    appName: "CityCare Hospital",
    environment: process.env.NODE_ENV || "development",
    databaseStatus: states[mongoose.connection.readyState] || "unknown",
    databaseReady: mongoose.connection.readyState === 1,
    port: Number(process.env.PORT || 5000),
    clientOrigins: process.env.CLIENT_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173",
    serverTime: new Date().toISOString(),
  });
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUserByRole = async (req, res) => {
  try {
    const role = req.params.role;
    if (!["admin", "doctor", "patient"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    if (role === "doctor") {
      const doctors = await Doctor.find()
        .populate("user", doctorPopulate)
        .sort({ createdAt: -1 });
      return res.status(200).json({ success: true, doctors });
    }

    const users = await User.find({ role }).select("-password").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (String(user._id) === req.user.id) {
      return res.status(400).json({ success: false, message: "You cannot delete your own account" });
    }

    if (user.role === "doctor") {
      const doctor = await Doctor.findOne({ user: user._id });
      if (doctor) {
        await Appointment.deleteMany({ doctor: doctor._id });
        await Prescription.deleteMany({ doctor: doctor._id });
        await doctor.deleteOne();
      }
    }

    if (user.role === "patient") {
      await Appointment.deleteMany({ patient: user._id });
      await Prescription.deleteMany({ patient: user._id });
    }

    await user.deleteOne();
    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      department,
      experience,
      qualification = "",
      consultationFee = 500,
      about = "",
      status = "Active",
    } = req.body;

    if (!name || !email || !phone || !password || !department || experience === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, phone, password, department and experience",
      });
    }
    if (!isPasswordAcceptable(password)) {
      return res.status(400).json({ success: false, message: "Password must be 8-72 characters." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "doctor",
      status,
    });

    const doctor = await Doctor.create({
      user: user._id,
      department,
      experience: Number(experience),
      qualification,
      consultationFee: Number(consultationFee),
      about,
    });

    const populatedDoctor = await Doctor.findById(doctor._id).populate("user", doctorPopulate);
    return res.status(201).json({
      success: true,
      message: "Doctor added successfully",
      doctor: populatedDoctor,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate("user", doctorPopulate)
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, doctors });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate("user", doctorPopulate);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    return res.status(200).json({ success: true, doctor });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const { name, email, phone, status, department, experience, qualification, consultationFee, about } = req.body;
    const userUpdates = {};
    if (name !== undefined) userUpdates.name = name;
    if (email !== undefined) userUpdates.email = email;
    if (phone !== undefined) userUpdates.phone = phone;
    if (status !== undefined) userUpdates.status = status;

    const doctorUpdates = {};
    if (department !== undefined) doctorUpdates.department = department;
    if (experience !== undefined) doctorUpdates.experience = Number(experience);
    if (qualification !== undefined) doctorUpdates.qualification = qualification;
    if (consultationFee !== undefined) doctorUpdates.consultationFee = Number(consultationFee);
    if (about !== undefined) doctorUpdates.about = about;

    await User.findByIdAndUpdate(doctor.user, userUpdates, { new: true, runValidators: true });
    await Doctor.findByIdAndUpdate(doctor._id, doctorUpdates, { new: true, runValidators: true });

    const updatedDoctor = await Doctor.findById(doctor._id).populate("user", doctorPopulate);
    return res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      doctor: updatedDoctor,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    await Appointment.deleteMany({ doctor: doctor._id });
    await Prescription.deleteMany({ doctor: doctor._id });
    await User.findByIdAndDelete(doctor.user);
    await doctor.deleteOne();

    return res.status(200).json({ success: true, message: "Doctor deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getDoctorsByDepartment = async (req, res) => {
  try {
    const doctors = await Doctor.find({ department: req.params.department })
      .populate("user", doctorPopulate)
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, doctors });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" }).select("-password").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, patients });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const addPatient = async (req, res) => {
  try {
    const { name, email, phone, password, dob, gender = "", address = "", emergencyContact = "", status = "Active" } =
      req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, phone and password",
      });
    }
    if (!isPasswordAcceptable(password)) {
      return res.status(400).json({ success: false, message: "Password must be 8-72 characters." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const patient = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      dob,
      gender,
      address,
      emergencyContact,
      role: "patient",
      status,
      patientId: await nextPatientId(),
    });

    const payload = patient.toObject();
    delete payload.password;

    return res.status(201).json({
      success: true,
      message: "Patient added successfully",
      patient: payload,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updatePatient = async (req, res) => {
  try {
    const patient = await User.findOneAndUpdate(
      { _id: req.params.id, role: "patient" },
      req.body,
      { new: true, runValidators: true }
    ).select("-password");

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      patient,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deletePatient = async (req, res) => {
  try {
    const patient = await User.findOne({ _id: req.params.id, role: "patient" });
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    await Appointment.deleteMany({ patient: patient._id });
    await Prescription.deleteMany({ patient: patient._id });
    await patient.deleteOne();

    return res.status(200).json({ success: true, message: "Patient deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, services });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createService = async (req, res) => {
  try {
    const { name, department, fee, duration, status = "Active" } = req.body;
    if (!name || !department || fee === undefined || !duration) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, department, fee and duration",
      });
    }

    const service = await Service.create({
      name,
      department,
      fee: Number(fee),
      duration,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Service added successfully",
      service,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateService = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.fee !== undefined) payload.fee = Number(payload.fee);

    const service = await Service.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Service updated successfully",
      service,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    await service.deleteOne();
    return res.status(200).json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .populate("patient", "name email phone patientId gender dob status")
      .populate({ path: "doctor", populate: { path: "user", select: doctorPopulate } });

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

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate("patient", "name email phone patientId gender dob status")
      .populate({ path: "doctor", populate: { path: "user", select: doctorPopulate } });

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.doctor?.user?._id) {
      emitToUser(String(appointment.doctor.user._id), "doctor_schedule_update", {
        type: "appointment_status_updated",
        appointment,
      });
    }

    await notifyUser(appointment.patient?._id, {
      type: "appointment",
      title: `Appointment ${status.toLowerCase()}`,
      message: `Your appointment status was changed to ${status.toLowerCase()}.`,
      link: "/patient/appointments",
      metadata: { appointmentId: String(appointment._id), status },
    });
    if (appointment.doctor?.user?._id) {
      await notifyUser(appointment.doctor.user._id, {
        type: "appointment",
        title: `Appointment ${status.toLowerCase()}`,
        message: `${appointment.patient?.name || "A patient"}'s appointment status was changed by an admin.`,
        link: "/doctor/appointments",
        metadata: { appointmentId: String(appointment._id), status },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      appointment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    await Prescription.deleteMany({ appointment: appointment._id });
    await appointment.deleteOne();
    return res.status(200).json({ success: true, message: "Appointment deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
