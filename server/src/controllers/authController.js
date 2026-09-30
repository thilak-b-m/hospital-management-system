import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Doctor from "../models/doctor.js";
import { isPasswordAcceptable } from "../utils/passwordPolicy.js";
import { notifyAdmins } from "../services/notificationService.js";

const createToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "2d" }
  );

const nextPatientId = async () => {
  const count = await User.countDocuments({ role: "patient" });
  return `PT${String(count + 1).padStart(4, "0")}`;
};

const buildUserPayload = async (user) => {
  const payload = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    patientId: user.patientId,
    dob: user.dob,
    gender: user.gender,
    address: user.address,
    emergencyContact: user.emergencyContact,
  };

  if (user.role === "doctor") {
    const doctor = await Doctor.findOne({ user: user._id });
    if (doctor) {
      payload.doctorId = doctor._id;
      payload.department = doctor.department;
      payload.experience = doctor.experience;
      payload.qualification = doctor.qualification;
      payload.consultationFee = doctor.consultationFee;
      payload.about = doctor.about;
      payload.availability = doctor.availability;
    }
  }

  return payload;
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, dob, gender, address, emergencyContact } = req.body;

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
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const patientId = await nextPatientId();
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "patient",
      patientId,
      dob,
      gender,
      address,
      emergencyContact,
    });

    await notifyAdmins({
      type: "system",
      title: "New patient registered",
      message: `${user.name} created a patient account.`,
      link: "/admin/patients",
      metadata: { patientId: String(user._id) },
    });

    const token = createToken(user);
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: await buildUserPayload(user),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `This account is registered as ${user.role}`,
      });
    }

    if (user.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: "This account is inactive. Please contact the hospital admin.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = createToken(user);
    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token,
      user: await buildUserPayload(user),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  return res.status(200).json({
    success: true,
    user: await buildUserPayload(user),
  });
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Please provide current and new password" });
    }
    if (!isPasswordAcceptable(newPassword)) {
      return res.status(400).json({ success: false, message: "New password must be 8-72 characters." });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) return res.status(400).json({ success: false, message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userFields = ["name", "email", "phone", "dob", "gender", "address", "emergencyContact"];
    userFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });
    await user.save();

    if (user.role === "doctor") {
      const doctor = await Doctor.findOne({ user: user._id });
      if (doctor) {
        const doctorFields = [
          "department",
          "experience",
          "qualification",
          "consultationFee",
          "about",
          "availability",
        ];
        doctorFields.forEach((field) => {
          if (req.body[field] !== undefined) {
            doctor[field] = req.body[field];
          }
        });
        await doctor.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: await buildUserPayload(user),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
