import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    eventId:    { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // null for guests
    // Registrant info
    name:       { type: String, required: true, trim: true },
    email:      { type: String, required: true, trim: true, lowercase: true },
    phone:      { type: String, trim: true, default: "" },
    year:       { type: String, default: "" },
    department: { type: String, default: "" },
    division:   { type: String, default: "" },
    // Team fields (only for team events)
    teamName:   { type: String, trim: true, default: "" },
    teammates:  {
      type: [{
        name:  { type: String, trim: true, default: "" },
        email: { type: String, trim: true, lowercase: true, default: "" },
        phone: { type: String, trim: true, default: "" },
      }],
      default: [],
    },
  },
  { timestamps: true }
);

// Prevent the same logged-in user registering twice for the same event
registrationSchema.index(
  { eventId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { userId: { $type: "objectId" } } }
);

export default mongoose.models.Registration ||
  mongoose.model("Registration", registrationSchema);
