import { NextRequest, NextResponse } from "next/server";
import { verifyUserToken } from "@/lib/user-jwt";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";

// GET — return full profile for current user
export async function GET(req: NextRequest) {
  const token = req.cookies.get("user_token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const payload = verifyUserToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });

  await connectDB();
  const user = await User.findById(payload.id).select("-passwordHash").lean();
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ user });
}

// PUT — update profile fields
export async function PUT(req: NextRequest) {
  const token = req.cookies.get("user_token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const payload = verifyUserToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });

  const body = await req.json();
  const { fullName, year, department, division } = body;

  const YEAR_VALUES = ["FY", "SY", "TY", "BE", "Passout", ""];
  const DEPT_VALUES = ["IT", "CS", "MECH", "CIVIL", "EXTC", "ETRX", "AIDS", "AIML", "OTHER", ""];
  const DIV_VALUES = ["A", "B", "C", "D", ""];

  if (year !== undefined && !YEAR_VALUES.includes(year)) {
    return NextResponse.json({ error: "Invalid year value" }, { status: 400 });
  }
  if (department !== undefined && !DEPT_VALUES.includes(department)) {
    return NextResponse.json({ error: "Invalid department value" }, { status: 400 });
  }
  if (division !== undefined && !DIV_VALUES.includes(division)) {
    return NextResponse.json({ error: "Invalid division value" }, { status: 400 });
  }

  await connectDB();
  const updated = await User.findByIdAndUpdate(
    payload.id,
    {
      $set: {
        ...(fullName !== undefined && { fullName: fullName.trim() }),
        ...(year !== undefined && { year }),
        ...(department !== undefined && { department }),
        ...(division !== undefined && { division }),
      },
    },
    { returnDocument: "after" }
  )
    .select("-passwordHash")
    .lean();

  if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ ok: true, user: updated });
}
