import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    image: String,
    name: { type: String, required: true },
    role: String,
    department: String,
    isHead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Member || mongoose.model("Member", memberSchema);
