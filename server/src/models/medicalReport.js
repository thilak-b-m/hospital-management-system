import mongoose from "mongoose";

const medicalReportSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true,
    },
    diagnosis: {
      type: String,
      trim: true,
      required: true,
    },
    symptoms: {
      type: String,
      trim: true,
      default: "",
    },
    prescription: {
      type: String,
      trim: true,
      default: "",
    },
    doctorNotes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("MedicalReport", medicalReportSchema);
