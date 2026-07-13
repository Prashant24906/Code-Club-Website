import { connectDB } from "@/lib/mongodb";
import Event from "@/models/events";
import { checkAuth } from "@/lib/auth-check";

export async function GET(request: Request) {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const pageParam = searchParams.get("page");
  const limitParam = searchParams.get("limit");
  const type = searchParams.get("type"); // "upcoming" | "past" | null (all)
  // Client can pass the total from a previous fetch to skip countDocuments
  const knownTotalParam = searchParams.get("knownTotal");

  // If no page param, return all events as a plain array (admin page compat)
  if (!pageParam) {
    const events = await Event.find().sort({ date: -1 });
    return new Response(JSON.stringify(events), { status: 200 });
  }

  const page = Math.max(1, parseInt(pageParam, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(limitParam ?? "8", 10)));
  const skip = (page - 1) * limit;

  // Use a proper Date object so MongoDB can use the index correctly.
  // Comparing a Date-typed field against an ISO string bypasses the index.
  const now = new Date();
  const dateFilter =
    type === "upcoming"
      ? { date: { $gte: now } }
      : type === "past"
      ? { date: { $lt: now } }
      : {};

  // Only run countDocuments on the first page load or when total is unknown
  const knownTotal = knownTotalParam ? parseInt(knownTotalParam, 10) : null;
  const shouldCount = knownTotal === null || isNaN(knownTotal);

  const [events, total] = await Promise.all([
    Event.find(dateFilter)
      .sort({ date: type === "past" ? -1 : 1 })
      .skip(skip)
      .limit(limit),
    shouldCount ? Event.countDocuments(dateFilter) : Promise.resolve(knownTotal as number),
  ]);

  const totalPages = Math.ceil(total / limit);

  return new Response(
    JSON.stringify({ events, total, totalPages, currentPage: page }),
    { status: 200 }
  );
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
