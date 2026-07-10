import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { Motivation } from "@/components/motivation";
import { Members } from "@/components/members";
import { Events } from "@/components/events";
import { Contact } from "@/components/contact";
import { ParticleBackground } from "@/components/particle-background";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <ParticleBackground />
      <Navbar />
      <Hero />
      <About />
      <Motivation />
      <Members /> 
      <Events />  
      <Contact />
    </main>
  );
}
