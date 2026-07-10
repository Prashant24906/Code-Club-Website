import { Navbar } from "@/components/navbar";
import { Events } from "@/components/events";
import { ParticleBackground } from "@/components/particle-background";
import { PageHero } from "@/components/page-hero";

export const metadata = {
  title: "Events | CoDE Club",
  description: "Explore upcoming and past events from CoDE Club — workshops, hackathons, and tech talks.",
};

export default function EventsPage() {
  return (
    <main className="relative min-h-screen">
      <ParticleBackground />
      <Navbar />
      <div className="pt-20">
        <PageHero
          title="Our"
          highlight="Events"
          subtitle="Join us for workshops, hackathons, tech talks, and networking events."
          badge="What's Happening"
        />
        <Events />
      </div>
    </main>
  );
}

