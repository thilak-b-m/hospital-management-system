import mongoose from "mongoose";

const historyEntrySchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    title: { type: String, required: true, trim: true },
    type: { type: String, trim: true, default: "Diagnosis" },
    notes: { type: String, trim: true, default: "" },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    doctorName: { type: String, trim: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    medications: { type: [String], default: [] },
    vitals: {
      bloodPressure: { type: String, trim: true, default: "" },
      heartRate: { type: String, trim: true, default: "" },
      temperature: { type: String, trim: true, default: "" },
      respiratoryRate: { type: String, trim: true, default: "" },
    },
  },
  { _id: false }
);

const healthSummarySchema = new mongoose.Schema(
  {
    bloodGroup: { type: String, trim: true, default: "" },
    height: { type: String, trim: true, default: "" },
    weight: { type: String, trim: true, default: "" },
    allergies: { type: String, trim: true, default: "" },
    chronicConditions: { type: String, trim: true, default: "" },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    lastUpdatedAt: { type: Date },
  },
  { _id: false }
);

const medicalHistorySchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    healthSummary: { type: healthSummarySchema, default: () => ({}) },
    entries: { type: [historyEntrySchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("MedicalHistory", medicalHistorySchema);
