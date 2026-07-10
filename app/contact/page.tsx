import { Navbar } from "@/components/navbar";
import { Contact } from "@/components/contact";
import { ParticleBackground } from "@/components/particle-background";

export const metadata = {
  title: "Contact | CoDE Club",
  description: "Get in touch with CoDE Club — ask questions, join the community, or stay connected on social media.",
};

export default function ContactPage() {
  return (
    <main className="relative min-h-screen">
      <ParticleBackground />
      <Navbar />
      <div className="pt-24">
        <Contact />
      </div>
    </main>
  );
}
