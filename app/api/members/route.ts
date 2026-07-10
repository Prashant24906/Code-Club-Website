import { connectDB } from "@/lib/mongodb";
import Member from "@/models/members";
import { checkAuth } from "@/lib/auth-check";

export async function GET() {
  await connectDB();
  const members = await Member.find();
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
  const updated = await Member.findByIdAndUpdate(id, data, { new: true });
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
