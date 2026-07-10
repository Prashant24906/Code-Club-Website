import { Navbar } from "@/components/navbar";
import { Events } from "@/components/events";
import { ParticleBackground } from "@/components/particle-background";

export const metadata = {
  title: "Events | CoDE Club",
  description: "Explore upcoming and past events from CoDE Club — workshops, hackathons, and tech talks.",
};

export default function EventsPage() {
  return (
    <main className="relative min-h-screen">
      <ParticleBackground />
      <Navbar />
      <div className="pt-24">
        <Events />
      </div>
    </main>
  );
}
