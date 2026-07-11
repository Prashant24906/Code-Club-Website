import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    image: String,               // legacy single-image (backward compat)
    images: { type: [String], default: [] }, // new multi-image array
    title: { type: String, required: true },
    date: Date,
    description: String,
    location: String,
    googleFormLink: String,
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model("Event", eventSchema);
