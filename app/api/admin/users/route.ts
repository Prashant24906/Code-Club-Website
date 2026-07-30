import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";

function isAdminAuthed(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return false;
  return !!verifyToken(token);
}

// Admin-only: list all registered users
export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const users = await User.find().select("-passwordHash").sort({ createdAt: -1 }).lean();
  return NextResponse.json(users);
}

// Admin-only: delete a user
export async function DELETE(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const { _id } = await req.json();
  await User.findByIdAndDelete(_id);
  return NextResponse.json({ message: "User deleted" });
}
