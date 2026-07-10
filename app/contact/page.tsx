import { Navbar } from "@/components/navbar";
import { Contact } from "@/components/contact";
import { ParticleBackground } from "@/components/particle-background";
import { PageHero } from "@/components/page-hero";

export const metadata = {
  title: "Contact | CoDE Club",
  description: "Get in touch with CoDE Club — ask questions, join the community, or stay connected on social media.",
};

export default function ContactPage() {
  return (
    <main className="relative min-h-screen">
      <ParticleBackground />
      <Navbar />
      <div className="pt-20">
        <PageHero
          title="Get in"
          highlight="Touch"
          subtitle="Have questions? Want to join our community? We'd love to hear from you!"
          badge="Contact Us"
        />
        <Contact />
      </div>
    </main>
  );
}

