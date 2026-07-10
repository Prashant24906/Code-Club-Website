import { Navbar } from "@/components/navbar";
import { Members } from "@/components/members";
import { ParticleBackground } from "@/components/particle-background";
import { PageHero } from "@/components/page-hero";

export const metadata = {
  title: "Members | CoDE Club",
  description: "Meet the talented members of CoDE Club — the developers, designers, and tech enthusiasts driving innovation.",
};

export default function MembersPage() {
  return (
    <main className="relative min-h-screen">
      <ParticleBackground />
      <Navbar />
      <div className="pt-20">
        <PageHero
          title="Our"
          highlight="Members"
          subtitle="Meet the developers, designers, and tech enthusiasts driving innovation at CoDE Club."
          badge="The Team"
        />
        <Members />
      </div>
    </main>
  );
}

