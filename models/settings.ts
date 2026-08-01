import mongoose from "mongoose"

const settingsSchema = new mongoose.Schema(
  {
    // Use a fixed singleton key so there is always exactly one document
    key: { type: String, default: "global", unique: true },
    quizEnabled: { type: Boolean, default: false },
    eventsEnabled: { type: Boolean, default: true },
    // Fallback display count shown before real user count loads
    registeredUsersDisplayCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default mongoose.models.Settings ||
  mongoose.model("Settings", settingsSchema)
