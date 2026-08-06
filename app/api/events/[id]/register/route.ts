import { NextRequest, NextResponse } from "next/server";
import { verifyUserToken } from "@/lib/user-jwt";
import { connectDB } from "@/lib/mongodb";
import Registration from "@/models/registration";
import Event from "@/models/events";

// ── Helpers ────────────────────────────────────────────────────────────────────

function tryGetUserId(req: NextRequest): string | null {
  const token = req.cookies.get("user_token")?.value;
  if (!token) return null;
  try {
    const payload = verifyUserToken(token);
    return payload?.id ?? null;
  } catch {
    return null;
  }
}

// ── GET — check registration status (logged-in only) ─────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = tryGetUserId(req);
  if (!userId) return NextResponse.json({ registered: false });

  await connectDB();
  const { id: eventId } = await params;
  const existing = await Registration.findOne({ eventId, userId }).lean();
  
  if (existing) {
    const event = await Event.findById(eventId).select("whatsappLink").lean() as { whatsappLink?: string } | null;
    return NextResponse.json({ registered: true, whatsappLink: event?.whatsappLink });
  }
  return NextResponse.json({ registered: false });
}

// ── POST — register (login required) ────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id: eventId } = await params;

  // Fetch event to get team size constraints
  const event = await Event.findById(eventId).lean() as {
    minTeamSize?: number | null;
    maxTeamSize?: number | null;
    registrationStartTime?: string | Date | null;
  } | null;

  if (!event) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  // Check if registration is open
  if (event.registrationStartTime && new Date(event.registrationStartTime) > new Date()) {
    return NextResponse.json({ error: "Registration has not opened yet." }, { status: 403 });
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
    const totalMembers = 1 + teammates.length; // registrant + teammates
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

  // Optional logged-in user
  const userId = tryGetUserId(req);

  // Prevent duplicate registration
  if (userId) {
    const existing = await Registration.findOne({ eventId, userId });
    if (existing) {
      return NextResponse.json({ error: "You are already registered for this event." }, { status: 409 });
    }
  } else {
    // For guests, check by email to prevent obvious duplicates
    const existing = await Registration.findOne({ eventId, email });
    if (existing) {
      return NextResponse.json({ error: "This email is already registered for this event." }, { status: 409 });
    }
  }

  const registration = await Registration.create({
    eventId,
    userId,
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
