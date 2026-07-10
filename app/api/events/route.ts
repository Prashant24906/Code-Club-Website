import { connectDB } from "@/lib/mongodb";
import Event from "@/models/events";
import { checkAuth } from "@/lib/auth-check";

export async function GET() {
  await connectDB();
  const events = await Event.find();
  return new Response(JSON.stringify(events), { status: 200 });
}

export async function POST(request: Request) {
  const authErr = await checkAuth();
  if (authErr) return authErr;

  await connectDB();
  const data = await request.json();
  const event = await Event.create(data);
  return new Response(JSON.stringify(event), { status: 201 });
}

export async function PUT(request: Request) {
  const authErr = await checkAuth();
  if (authErr) return authErr;

  await connectDB();
  const { id, ...data } = await request.json();
  const updated = await Event.findByIdAndUpdate(id, data, { new: true });
  return new Response(JSON.stringify(updated), { status: 200 });
}

export async function DELETE(request: Request) {
  const authErr = await checkAuth();
  if (authErr) return authErr;

  await connectDB();
  const { id } = await request.json();
  await Event.findByIdAndDelete(id);
  return new Response(JSON.stringify({ message: "Deleted" }), { status: 200 });
}
