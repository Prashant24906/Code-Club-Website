import { Navbar } from "@/components/navbar";
import { About } from "@/components/about";
import { ParticleBackground } from "@/components/particle-background";
import { PageHero } from "@/components/page-hero";

export const metadata = {
  title: "About | CoDE Club",
  description: "Learn about CoDE Club — our mission, values, and why you should join our community of developers and innovators.",
};

export default function AboutPage() {
  return (
    <main className="relative min-h-screen">
      <ParticleBackground />
      <Navbar />
      <div className="pt-20">
        <PageHero
          title="About"
          highlight="CoDE Club"
          subtitle="A passionate community of students dedicated to learning, building, and sharing knowledge in tech."
          badge="Who We Are"
        />
        <About />
      </div>
    </main>
  );
}

