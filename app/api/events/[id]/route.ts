import { connectDB } from "@/lib/mongodb";
import Event from "@/models/events";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  const event = await Event.findById(id);
  if (!event) {
    return new Response(JSON.stringify({ error: "Event not found" }), { status: 404 });
  }
  return new Response(JSON.stringify(event), { status: 200 });
}
