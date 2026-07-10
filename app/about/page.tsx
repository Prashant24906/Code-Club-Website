import { Navbar } from "@/components/navbar";
import { About } from "@/components/about";
import { ParticleBackground } from "@/components/particle-background";

export const metadata = {
  title: "About | CoDE Club",
  description: "Learn about CoDE Club — our mission, values, and why you should join our community of developers and innovators.",
};

export default function AboutPage() {
  return (
    <main className="relative min-h-screen">
      <ParticleBackground />
      <Navbar />
      <div className="pt-24">
        <About />
      </div>
    </main>
  );
}
