import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    department: {
      type: String,
      required: true,
      trim: true,
    },

    experience: {
      type: Number,
      required: true,
      min: 0,
    },

    qualification: {
      type: String,
      trim: true,
      default: "",
    },

    consultationFee: {
      type: Number,
      min: 0,
      default: 500,
    },

    about: {
      type: String,
      trim: true,
      default: "",
    },

    availability: {
      type: [
        {
          day: String,
          startTime: String,
          endTime: String,
          available: {
            type: Boolean,
            default: true,
          },
        },
      ],
      default: [
        { day: "Monday", startTime: "10:00 AM", endTime: "05:00 PM", available: true },
        { day: "Tuesday", startTime: "10:00 AM", endTime: "05:00 PM", available: true },
        { day: "Wednesday", startTime: "10:00 AM", endTime: "05:00 PM", available: true },
        { day: "Thursday", startTime: "10:00 AM", endTime: "05:00 PM", available: true },
        { day: "Friday", startTime: "10:00 AM", endTime: "05:00 PM", available: true },
        { day: "Saturday", startTime: "10:00 AM", endTime: "02:00 PM", available: true },
        { day: "Sunday", startTime: "", endTime: "", available: false },
      ],
    },
    unavailableDates: {
      type: [
        {
          date: Date,
          reason: {
            type: String,
            trim: true,
            default: "",
          },
        },
      ],
      default: [],
    },
    unavailableDateHistory: {
      type: [
        {
          date: Date,
          reason: {
            type: String,
            trim: true,
            default: "",
          },
          archivedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Doctor", doctorSchema);
