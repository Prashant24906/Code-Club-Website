"use client"

import Link from "next/link"
import Image from "next/image"
import { Linkedin, Instagram, Mail, MapPin, Phone, ExternalLink, ArrowRight } from "lucide-react"

const SOCIAL_LINKS = [
  {
    icon: Linkedin,
    href: "https://www.linkedin.com/company/codeclubaiml/",
    label: "LinkedIn",
    color: "#0a66c2",
    bg: "rgba(10,102,194,0.12)",
    border: "rgba(10,102,194,0.3)",
  },
  {
    icon: Instagram,
    href: "https://www.instagram.com/codeclub_pesmcoe",
    label: "Instagram",
    color: "#e1306c",
    bg: "rgba(225,48,108,0.12)",
    border: "rgba(225,48,108,0.3)",
  },
]

const NAV_LINKS = [
  { label: "Members", href: "/members" },
  { label: "Events", href: "/events" },
  { label: "Communities", href: "/communities" },
  { label: "Contact", href: "/contact" },
]

// Google Maps embed for PES Modern College of Engineering, Pune
const MAPS_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3782.765754080576!2d73.85005827504!3d18.52046968259!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2bf9b10d3417f%3A0xe7f2b14e39d6e5a9!2sPES%20Modern%20College%20of%20Engineering!5e0!3m2!1sen!2sin!4v1691000000000!5m2!1sen!2sin"

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-8 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
      {/* ── Contact CTA Banner ─────────────────────────────────────────── */}
      <div className="px-4 py-14">
        <div className="max-w-6xl mx-auto glass-card rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-black mb-2 text-foreground">
              Have a question?
            </h2>
            <p className="text-muted-foreground max-w-md">
              Reach out to us — we&apos;d love to hear from you and help you get started with CoDE Club.
            </p>
          </div>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-white font-bold text-sm transition-all duration-300 hover:scale-105 shrink-0"
            style={{ background: "linear-gradient(135deg,#38bdf8,#6366f1)", boxShadow: "0 8px 24px rgba(56,189,248,0.3)" }}
          >
            <Mail size={16} />
            Contact Us
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* ── Main Footer Grid ───────────────────────────────────────────── */}
      <div className="px-4 pb-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand column */}
          <div className="space-y-5">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div
                className="relative size-10 rounded-xl overflow-hidden border shrink-0"
                style={{ borderColor: "#38bdf840", background: "#38bdf815", boxShadow: "0 0 16px #38bdf830" }}
              >
                <Image src="/codeclub1.png" alt="CoDE Club" fill sizes="40px" className="object-contain p-1.5" />
              </div>
              <span
                className="text-lg font-black uppercase tracking-widest"
                style={{ color: "#38bdf8", textShadow: "0 0 20px #38bdf860" }}
              >
                CoDE Club
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              A student-driven tech community at PES Modern College of Engineering — building, learning, and innovating together.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="inline-flex items-center justify-center size-10 rounded-xl border transition-all duration-300 hover:scale-110 hover:-translate-y-0.5"
                  style={{ color: s.color, background: s.bg, borderColor: s.border }}
                >
                  <s.icon size={17} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links + contact column */}
          <div className="space-y-5">
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Quick Links</h3>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="pt-2 space-y-2">
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Contact</h3>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin size={14} className="mt-0.5 shrink-0 text-sky-400" />
                <span>PES Modern College of Engineering,<br />Shivajinagar, Pune – 411005, Maharashtra</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail size={14} className="shrink-0 text-sky-400" />
                <a href="mailto:codeclub@pesmcoe.ac.in" className="hover:text-foreground transition-colors">
                  codeclub@pesmcoe.ac.in
                </a>
              </div>
            </div>
          </div>

          {/* Google Map column */}
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Find Us</h3>
            <div className="mt-4 overflow-hidden rounded-lg border border-white/10">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3783.059432658117!2d73.84392477501309!3d18.52619818256863!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c088d031393d%3A0x3f92335c2e5c8400!2sP.E.S.%20Modern%20College%20of%20Engineering!5e0!3m2!1sen!2sin!4v1712001222416!5m2!1sen!2sin"
                  width="100%"
                  height="150"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="PES Modern College of Engineering Location"
                ></iframe>
              </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────────────────── */}
      <div className="border-t px-4 py-5" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {year} CoDE Club · PES Modern College of Engineering, Pune</span>
          <span className="flex items-center gap-1">
            Made with <span className="text-rose-400">♥</span> by students, for students
          </span>
        </div>
      </div>
    </footer>
  )
}
