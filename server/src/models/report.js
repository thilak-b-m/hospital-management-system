import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    title: { type: String, trim: true },
    notes: { type: String, trim: true },
    fileUrl: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
