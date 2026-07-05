import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    user: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },

    department: {
        type: String,
        required: true,
    },

    experience: {
        type: Number,
        required: true,
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Doctor", doctorSchema);