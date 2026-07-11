import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import { signUserToken } from "@/lib/user-jwt";

export async function POST(req: NextRequest) {
  try {
    const { email, username, password } = await req.json();

    if (!email || !username || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    await connectDB();

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const existingUsername = await User.findOne({ username: username.trim() });
    if (existingUsername) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email: email.toLowerCase(), username: username.trim(), passwordHash });

    const token = signUserToken({ id: user._id.toString(), email: user.email, username: user.username });

    const res = NextResponse.json({ ok: true, user: { id: user._id, email: user.email, username: user.username } });
    res.cookies.set("user_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
