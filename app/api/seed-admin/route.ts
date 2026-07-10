import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/admin";
import bcrypt from "bcryptjs";

// One-time seeder: POST /api/seed-admin
// Call this once to create the admin user, then remove/disable this route
export async function POST(req: NextRequest) {
  // Safety: only run in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const email = process.env.ADMIN_EMAIL ;
  const password = process.env.ADMIN_PASSWORD ;

  const existing = await Admin.findOne({ email });
  if (existing) {
    return NextResponse.json({ message: "Admin already exists", email }, { status: 200 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await Admin.create({ email, passwordHash });

  return NextResponse.json({ message: "Admin seeded", email }, { status: 201 });
}
