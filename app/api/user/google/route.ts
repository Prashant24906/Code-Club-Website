import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import { signUserToken } from "@/lib/user-jwt";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 400 });
    }

    // Fetch user profile from Google using the access token
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!userInfoRes.ok) {
      return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });
    }

    const payload = await userInfoRes.json();
    if (!payload || !payload.email) {
      return NextResponse.json({ error: "Could not retrieve email from Google" }, { status: 401 });
    }

    await connectDB();

    const email = payload.email.toLowerCase();
    
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user for Google login
      const baseUsername = (payload.name || email.split("@")[0]).replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      let username = baseUsername;
      let counter = 1;
      
      // Ensure unique username
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      user = await User.create({
        email,
        username,
        fullName: payload.name || "",
        authProvider: "google",
      });
    }

    const jwtToken = signUserToken({ id: user._id.toString(), email: user.email, username: user.username });

    const res = NextResponse.json({ ok: true, user: { id: user._id, email: user.email, username: user.username } });
    res.cookies.set("user_token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("Google auth error:", err);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
