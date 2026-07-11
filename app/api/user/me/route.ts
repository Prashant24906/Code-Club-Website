import { NextRequest, NextResponse } from "next/server";
import { verifyUserToken } from "@/lib/user-jwt";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("user_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const payload = verifyUserToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findById(payload.id)
    .select("-passwordHash")
    .lean() as Record<string, unknown> | null;

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: payload.id,
      email: user.email as string,
      username: user.username as string,
      fullName: (user.fullName as string) || "",
      year: (user.year as string) || "",
      department: (user.department as string) || "",
      division: (user.division as string) || "",
    },
  });
}

