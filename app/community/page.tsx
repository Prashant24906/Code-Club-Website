import { Navbar } from "@/components/navbar";
import { Community } from "@/components/community";
import { ParticleBackground } from "@/components/particle-background";
import { PageHero } from "@/components/page-hero";

export const metadata = {
  title: "Community | CoDE Club",
  description:
    "Explore and join CoDE Club's WhatsApp communities — Web Dev, DSA, AI/ML, App Dev, Cybersecurity, and more.",
};

export default function CommunityPage() {
  return (
    <main className="relative min-h-screen">
      <ParticleBackground />
      <Navbar />
      <div className="pt-20">
        <PageHero
          title="Our"
          highlight="Communities"
          subtitle="9 active WhatsApp groups covering every tech domain — pick your niche and join the conversation."
          badge="WhatsApp Groups"
        />
        <Community />
      </div>
    </main>
  );
}
