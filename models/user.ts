import mongoose from "mongoose";

const YEAR_VALUES = ["FY", "SY", "TY", "BE", "Passout"] as const;
const DEPT_VALUES = ["IT", "CS", "MECH", "CIVIL", "EXTC", "ETRX", "AIDS", "AIML", "OTHER"] as const;
const DIV_VALUES = ["A", "B", "C", "D"] as const;

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    // Profile fields (optional — filled in on the profile page)
    fullName: { type: String, trim: true, default: "" },
    year: { type: String, enum: [...YEAR_VALUES, ""], default: "" },
    department: { type: String, enum: [...DEPT_VALUES, ""], default: "" },
    division: { type: String, enum: [...DIV_VALUES, ""], default: "" },
  },
  { timestamps: true }
);

// In development, hot-reload can leave a stale compiled model in Mongoose's
// model registry (mongoose.models) that doesn't have the latest schema fields.
// Deleting the cache here ensures schema changes are always picked up without
// requiring a full server restart.
if (process.env.NODE_ENV !== "production") {
  delete (mongoose as unknown as { models: Record<string, unknown> }).models.User;
}

export default mongoose.models.User || mongoose.model("User", userSchema);

