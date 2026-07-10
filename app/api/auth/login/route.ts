import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/admin";
import { signToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: "Missing password" }, { status: 400 });
    }

    await connectDB();

    // Grab the first admin document in the database
    const admin = await Admin.findOne();
    if (!admin) {
      return NextResponse.json({ error: "Admin account not found" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const token = signToken({ id: admin._id.toString(), email: admin.email });

    const res = NextResponse.json({ ok: true });
    res.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
