import { notFound } from "next/navigation";
import { cache } from "react";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/events";
import { Navbar } from "@/components/navbar";
import { ParticleBackground } from "@/components/particle-background";
import { EventDetailsClient } from "@/components/EventDetailsClient";

interface Props {
  params: Promise<{ id: string }>;
}

const getEvent = cache(async (id: string) => {
  await connectDB();
  const event = await Event.findById(id).lean();
  return event;
});

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const event = await getEvent(id) as any;
  if (!event) return { title: "Event Not Found | CoDE Club" };
  return {
    title: `${event.title} | CoDE Club`,
    description: event.description ?? "Event details from CoDE Club.",
  };
}

export default async function EventPage({ params }: Props) {
  const { id } = await params;
  const raw = await getEvent(id) as any;

  if (!raw) notFound();

  // Serialize MongoDB document to a plain object
  const event = {
    _id: raw._id.toString(),
    title: raw.title ?? "",
    date: raw.date instanceof Date ? raw.date.toISOString() : String(raw.date ?? ""),
    description: raw.description ?? "",
    location: raw.location ?? "",
    time: raw.time ?? "",
    googleFormLink: raw.googleFormLink ?? "",
    image: raw.image ?? "",
    images: (raw.images ?? []).map(String),
    minTeamSize: raw.minTeamSize ?? null,
    maxTeamSize: raw.maxTeamSize ?? null,
    teamNameLabel: raw.teamNameLabel ?? "",
    prizePool: Array.isArray(raw.prizePool) 
      ? raw.prizePool.map((p: any) => ({ position: String(p.position || ""), amount: String(p.amount || "") })) 
      : [],
  };

  return (
    <main className="relative min-h-screen">
      <ParticleBackground />
      <Navbar />
      <div className="pt-20">
        <EventDetailsClient event={event} backHref="/events" />
      </div>
    </main>
  );
}
