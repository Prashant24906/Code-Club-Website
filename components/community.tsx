"use client"

import { useRef, useEffect, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import {
  MessageCircle, Users, Code2, Cpu, Globe, Layers,
  Zap, Shield, BookOpen, Rocket, ExternalLink, Sparkles,
  type LucideIcon,
} from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

// ── Icon registry ──────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  MessageCircle, Code2, Cpu, Globe, Layers, Zap, Shield, BookOpen, Rocket, Users,
}
function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? MessageCircle
}

// ── Types ──────────────────────────────────────────────────────────────────────
type Community = {
  _id: string
  id: string
  name: string
  description: string
  color: string
  members: string
  tags: string[]
  whatsappLink: string
  isMain: boolean
  iconName: string
}

// ── Helper: parse "80+" → 80 ──────────────────────────────────────────────────
function parseMemberCount(s: string): number {
  return parseInt(s.replace(/[^0-9]/g, ""), 10) || 0
}

// ── WhatsApp icon ─────────────────────────────────────────────────────────────
function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
export function Community() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [eventsCount, setEventsCount] = useState<number | null>(null)
  const [clubMembersCount, setClubMembersCount] = useState<number | null>(null)

  // Fetch communities + supporting stats in parallel
  useEffect(() => {
    Promise.all([
      fetch("/api/communities").then((r) => r.json()),
      fetch("/api/events").then((r) => r.json()),
      fetch("/api/members").then((r) => r.json()),
    ])
      .then(([comData, evData, mbData]) => {
        setCommunities(Array.isArray(comData) ? comData : [])
        setEventsCount(Array.isArray(evData) ? evData.length : (evData?.total ?? 0))
        setClubMembersCount(Array.isArray(mbData) ? mbData.length : 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Derived stats (computed once communities load)
  const totalWhatsAppMembers = communities.reduce((acc, c) => acc + parseMemberCount(c.members), 0)
  const stats = [
    { value: communities.length > 0 ? String(communities.length) : "—", label: "Active Communities" },
    { value: totalWhatsAppMembers > 0 ? `${totalWhatsAppMembers}+` : "—", label: "WhatsApp Members" },
    { value: eventsCount != null ? String(eventsCount) : "—", label: "Events Hosted" },
    { value: clubMembersCount != null ? String(clubMembersCount) : "—", label: "Club Members" },
  ]

  // GSAP animations
  useEffect(() => {
    if (loading) return
    const ctx = gsap.context(() => {
      gsap.fromTo(headingRef.current, { opacity: 0, y: 60 }, {
        opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: headingRef.current, start: "top 80%" },
      })
      gsap.fromTo(Array.from(statsRef.current?.children ?? []), { opacity: 0, y: 30, scale: 0.9 }, {
        opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.5)",
        scrollTrigger: { trigger: statsRef.current, start: "top 85%" },
      })
      gsap.fromTo(Array.from(cardsRef.current?.children ?? []), { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power3.out",
        scrollTrigger: { trigger: cardsRef.current, start: "top 80%" },
      })
      gsap.fromTo(ctaRef.current, { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ctaRef.current, start: "top 85%" },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [loading])

  const mainCommunity = communities.find((c) => c.isMain)

  return (
    <section id="community" ref={sectionRef} className="py-20 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div ref={headingRef} className="text-center mb-14">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-5 border"
            style={{ color: "#38bdf8", borderColor: "#38bdf840", background: "#38bdf812" }}
          >
            <Sparkles size={12} />
            Join The Conversation
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-5">
            Our <span className="gradient-text">Communities</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Pick your niche, join the group, and start building alongside passionate developers
            from our campus.
          </p>
        </div>

        {/* Stats bar */}
        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {stats.map((s) => (
            <div key={s.label} className="glass-card rounded-2xl p-5 text-center">
              <div className="text-3xl font-black mb-1" style={{ background: "linear-gradient(135deg, #38bdf8, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {s.value}
              </div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Community cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card rounded-3xl p-6 h-52 animate-pulse" />
            ))}
          </div>
        ) : (
          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {communities.map((community) => {
              const Icon = getIcon(community.iconName)
              const isHovered = hoveredId === community.id
              return (
                <div
                  key={community._id}
                  onMouseEnter={() => setHoveredId(community.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="relative glass-card rounded-3xl p-6 flex flex-col"
                  style={{
                    transition: "all 0.3s ease",
                    border: isHovered ? `1px solid ${community.color}50` : undefined,
                    boxShadow: isHovered ? `0 8px 40px ${community.color}20` : undefined,
                    transform: isHovered ? "translateY(-6px)" : "translateY(0)",
                  }}
                >
                  {community.isMain && (
                    <span className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full" style={{ background: `${community.color}20`, color: community.color }}>
                      Main
                    </span>
                  )}

                  {/* Icon + name */}
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="size-12 rounded-2xl flex items-center justify-center shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${community.color}30, ${community.color}10)`,
                        border: `1px solid ${community.color}30`,
                        transition: "transform 0.3s ease",
                        transform: isHovered ? "scale(1.12) rotate(-4deg)" : "scale(1)",
                      }}
                    >
                      <Icon size={22} style={{ color: community.color }} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground leading-snug">{community.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Users size={11} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-medium">{community.members} members</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4 flex-1">
                    <p
                      className="text-sm text-muted-foreground leading-relaxed"
                      style={{
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: expandedId === community.id ? "unset" : 2,
                        overflow: "hidden",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {community.description}
                    </p>
                    <button
                      onClick={() =>
                        setExpandedId((prev) =>
                          prev === community.id ? null : community.id
                        )
                      }
                      className="mt-1 text-xs font-semibold transition-colors duration-200"
                      style={{ color: community.color }}
                    >
                      {expandedId === community.id ? "See less ↑" : "See more ↓"}
                    </button>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {community.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: `${community.color}15`, color: community.color, border: `1px solid ${community.color}25` }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* WhatsApp join button */}
                  <a
                    href={community.whatsappLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold"
                    style={{
                      transition: "all 0.3s ease",
                      background: isHovered ? "linear-gradient(135deg, #25D366, #128C7E)" : "rgba(37,211,102,0.12)",
                      color: isHovered ? "#fff" : "#25D366",
                      border: isHovered ? "1px solid transparent" : "1px solid rgba(37,211,102,0.3)",
                      boxShadow: isHovered ? "0 4px 20px rgba(37,211,102,0.35)" : undefined,
                    }}
                  >
                    <WhatsAppIcon size={16} />
                    Join on WhatsApp
                    <ExternalLink size={13} />
                  </a>
                </div>
              )
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div ref={ctaRef} className="mt-16 glass-card rounded-3xl p-8 md:p-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-5 border" style={{ color: "#25D366", borderColor: "rgba(37,211,102,0.4)", background: "rgba(37,211,102,0.08)" }}>
            <WhatsAppIcon size={12} />
            Get Connected
          </div>
          <h3 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            {"Don't know where to start?"}
          </h3>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
            Join the <span className="font-bold text-foreground">CoDE Club General</span> group
            first — our welcoming community will help you find the right niche.
          </p>
          <a
            href={mainCommunity?.whatsappLink || "https://chat.whatsapp.com/"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-3.5 rounded-2xl text-white font-bold text-base transition-all duration-300 hover:scale-105"
            style={{ background: "linear-gradient(135deg, #25D366, #128C7E)", boxShadow: "0 6px 30px rgba(37,211,102,0.35)" }}
          >
            <WhatsAppIcon size={20} />
            Join General Community
          </a>
        </div>

      </div>
    </section>
  )
}
