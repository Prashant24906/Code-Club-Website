import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Registration from "@/models/registration";
import Event from "@/models/events";

// ── POST — register (no auth required) ──────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id: eventId } = await params;

  // Fetch event to validate constraints
  const event = await Event.findById(eventId).lean() as {
    minTeamSize?: number | null;
    maxTeamSize?: number | null;
    registrationStartTime?: string | Date | null;
    registrationCloseTime?: string | Date | null;
    whatsappLink?: string;
  } | null;

  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  // Check if registration has opened yet
  if (event.registrationStartTime && new Date(event.registrationStartTime) > new Date()) {
    return NextResponse.json({ error: "Registration has not opened yet." }, { status: 403 });
  }

  // Check if registration is closed
  if (event.registrationCloseTime && new Date(event.registrationCloseTime) < new Date()) {
    return NextResponse.json({ error: "Registration is closed for this event." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;

  // Registrant fields
  const name       = (body.name as string | undefined)?.trim();
  const email      = (body.email as string | undefined)?.trim().toLowerCase();
  const phone      = (body.phone as string | undefined)?.trim() ?? "";
  const year       = (body.year as string | undefined)?.trim() ?? "";
  const department = (body.department as string | undefined)?.trim() ?? "";
  const division   = (body.division as string | undefined)?.trim() ?? "";

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  // Team fields
  const teamName = (body.teamName as string | undefined)?.trim() ?? "";
  const rawTeammates = Array.isArray(body.teammates) ? body.teammates : [];
  const teammates = rawTeammates.map((t: Record<string, string>) => ({
    name:  (t.name ?? "").trim(),
    email: (t.email ?? "").trim().toLowerCase(),
    phone: (t.phone ?? "").trim(),
  }));

  // Validate team size
  const isTeamEvent = event.minTeamSize != null && event.maxTeamSize != null;
  if (isTeamEvent) {
    const totalMembers = 1 + teammates.length;
    const min = event.minTeamSize!;
    const max = event.maxTeamSize!;
    if (totalMembers < min) {
      return NextResponse.json(
        { error: `Minimum team size is ${min}. Add at least ${min - totalMembers} more teammate(s).` },
        { status: 400 }
      );
    }
    if (totalMembers > max) {
      return NextResponse.json(
        { error: `Maximum team size is ${max}. Remove ${totalMembers - max} teammate(s).` },
        { status: 400 }
      );
    }
  }

  // Prevent duplicate registration by email
  const existing = await Registration.findOne({ eventId, email });
  if (existing) {
    return NextResponse.json({ error: "This email is already registered for this event." }, { status: 409 });
  }

  const registration = await Registration.create({
    eventId,
    name, email, phone, year, department, division,
    teamName,
    teammates,
  });

  return NextResponse.json({
    success: true,
    registration,
    whatsappLink: event.whatsappLink
  }, { status: 201 });
}
