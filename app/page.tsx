import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";

import { ParticleBackground } from "@/components/particle-background";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <ParticleBackground />
      <Navbar />
      <Hero />

    </main>
  );
}
