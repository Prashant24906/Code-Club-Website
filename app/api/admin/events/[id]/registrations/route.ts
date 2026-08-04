import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Registration from "@/models/registration";
import Event from "@/models/events";
import { checkAuth } from "@/lib/auth-check";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResponse = await checkAuth();
  if (authResponse) return authResponse;

  await connectDB();
  const { id: eventId } = await params;

  try {
    const event = await Event.findById(eventId).select("title").lean();
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const registrations = await Registration.find({ eventId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      eventTitle: event.title,
      registrations,
    });
  } catch (error) {
    console.error("Failed to fetch registrations:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
