import Doctor from "../models/doctor.js";
import Service from "../models/services.js";
import { archiveExpiredUnavailableDates } from "../services/doctorAvailabilityService.js";

const doctorPopulate = "name email phone role status";

export const getPublicDoctors = async (req, res) => {
  try {
    await archiveExpiredUnavailableDates();
    const filter = {};
    if (req.query.department) {
      filter.department = req.query.department;
    }

    const doctors = await Doctor.find(filter)
      .populate("user", doctorPopulate)
      .sort({ department: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      doctors: doctors.filter((doctor) => doctor.user?.status === "Active"),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPublicDoctorById = async (req, res) => {
  try {
    await archiveExpiredUnavailableDates();
    const doctor = await Doctor.findById(req.params.id).populate("user", doctorPopulate);
    if (!doctor || doctor.user?.status !== "Active") {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    return res.status(200).json({ success: true, doctor });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPublicServices = async (req, res) => {
  try {
    const services = await Service.find({ status: "Active" }).sort({ department: 1, name: 1 });
    return res.status(200).json({ success: true, services });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
