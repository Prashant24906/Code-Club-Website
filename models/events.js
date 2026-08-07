import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    image: String,               // legacy single-image (backward compat)
    images: { type: [String], default: [] }, // new multi-image array
    title: { type: String, required: true },
    date: { type: Date, index: true }, // indexed for fast range queries
    description: String,
    location: String,
    time: String,
    googleFormLink: String,
    // Team size (undefined = individual event)
    minTeamSize: { type: Number, default: null },
    maxTeamSize: { type: Number, default: null },
    teamNameLabel: { type: String, default: "" }, // e.g. "Team Name"
    prizePool: { 
      type: [{ position: String, amount: String }],
      default: []
    },
    registrationStartTime: { type: Date, default: null },
    registrationCloseTime: { type: Date, default: null },
    whatsappLink: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model("Event", eventSchema);
