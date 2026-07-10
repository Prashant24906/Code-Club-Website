import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
  return NextResponse.json({ authenticated: true, email: payload.email });
}

