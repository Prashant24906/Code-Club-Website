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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResponse = await checkAuth();
  if (authResponse) return authResponse;

  await connectDB();
  // `id` here is eventId, but we need regId from searchParams
  const searchParams = req.nextUrl.searchParams;
  const regId = searchParams.get("regId");

  if (!regId) {
    return NextResponse.json({ error: "Missing regId" }, { status: 400 });
  }

  try {
    const deleted = await Registration.findByIdAndDelete(regId);
    if (!deleted) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete registration:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
