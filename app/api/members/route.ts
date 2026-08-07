import { connectDB } from "@/lib/mongodb";
import Member from "@/models/members";
import { checkAuth } from "@/lib/auth-check";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  await connectDB();
  const { searchParams } = request.nextUrl;
  const department = searchParams.get("department");
  const isHead = searchParams.get("isHead");

  // Build filter: caller can ask for a specific department and/or only heads
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};
  if (department) filter.department = department;
  if (isHead === "true") filter.isHead = true;

  const members = await Member.find(filter).select("-__v").lean();
  return new Response(JSON.stringify(members), { status: 200 });
}

export async function POST(request: Request) {
  const authErr = await checkAuth();
  if (authErr) return authErr;

  await connectDB();
  const data = await request.json();
  const member = await Member.create(data);
  return new Response(JSON.stringify(member), { status: 201 });
}

export async function PUT(request: Request) {
  const authErr = await checkAuth();
  if (authErr) return authErr;

  await connectDB();
  const { id, ...data } = await request.json();
  const updated = await Member.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
  return new Response(JSON.stringify(updated), { status: 200 });
}

export async function DELETE(request: Request) {
  const authErr = await checkAuth();
  if (authErr) return authErr;

  await connectDB();
  const { id } = await request.json();
  await Member.findByIdAndDelete(id);
  return new Response(JSON.stringify({ message: "Deleted" }), { status: 200 });
}
