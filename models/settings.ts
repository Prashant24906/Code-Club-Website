import mongoose from "mongoose"

const settingsSchema = new mongoose.Schema(
  {
    // Use a fixed singleton key so there is always exactly one document
    key: { type: String, default: "global", unique: true },
    quizEnabled: { type: Boolean, default: false },
    eventsEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default mongoose.models.Settings ||
  mongoose.model("Settings", settingsSchema)
