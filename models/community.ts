import mongoose from "mongoose";

const communitySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    color: { type: String, default: "#38bdf8" },
    members: { type: String, default: "0+" },
    tags: { type: [String], default: [] },
    whatsappLink: { type: String, default: "" },
    isMain: { type: Boolean, default: false },
    iconName: { type: String, default: "MessageCircle" },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production") {
  delete (mongoose as unknown as { models: Record<string, unknown> }).models.Community;
}

export default mongoose.models.Community || mongoose.model("Community", communitySchema);
