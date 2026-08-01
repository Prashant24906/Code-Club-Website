"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Image from "next/image"
import Link from "next/link"
import {
  Calendar, MapPin, Clock, Users, ArrowRight, MessageCircle,
  Code2, Cpu, Globe, Zap, Shield, BookOpen, Rocket, Layers,
  type LucideIcon,
} from "lucide-react"
import { useCachedMembers, useCachedEvents, useCachedCommunities } from "@/lib/data-cache"

gsap.registerPlugin(ScrollTrigger)

// ── Icon registry ──────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  MessageCircle, Code2, Cpu, Globe, Layers, Zap, Shield, BookOpen, Rocket, Users,
}
function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? MessageCircle
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  } catch {
    return dateStr
  }
}

// ─── Events Preview ────────────────────────────────────────────────────────────
function EventsPreview() {
  const sectionRef = useRef<HTMLElement>(null)
  const cachedEvents = useCachedEvents()
  const [events, setEvents] = useState<{ _id: string; title: string; date: string; image?: string; images?: string[]; location?: string; time?: string }[]>(
    cachedEvents.upcoming?.events ?? []
  )
  const [loading, setLoading] = useState(!cachedEvents.upcoming)

  // Read directly from the cache — DataCacheProvider fetches this on mount
  useEffect(() => {
    if (cachedEvents.upcoming) {
      setEvents(cachedEvents.upcoming.events.slice(0, 3))
      setLoading(false)
    }
  }, [cachedEvents.upcoming])

  useEffect(() => {
    if (loading) return
    const ctx = gsap.context(() => {
      gsap.fromTo(".ep-heading", { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ".ep-heading", start: "top 80%" },
      })
      gsap.fromTo(".ep-card", { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.65, stagger: 0.12, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [loading])

  return (
    <section ref={sectionRef} id="home-events" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="ep-heading flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4 border"
              style={{ color: "#38bdf8", borderColor: "#38bdf840", background: "#38bdf812" }}
            >
              <Calendar size={12} />
              Upcoming
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              Our <span className="gradient-text">Events</span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl">
              Workshops, hackathons, and tech talks — stay ahead of the curve.
            </p>
          </div>
          <Link
            href="/events"
            className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold border transition-all duration-300 hover:scale-105 shrink-0"
            style={{ color: "#38bdf8", borderColor: "#38bdf840", background: "#38bdf810" }}
          >
            See All Events <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-2xl h-56 animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center text-muted-foreground">
            No upcoming events right now — check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((ev) => {
              const imgs = ev.images?.length ? ev.images : ev.image ? [ev.image] : []
              return (
                <div
                  key={ev._id}
                  className="ep-card glass-card rounded-2xl overflow-hidden flex flex-col group hover:-translate-y-2 transition-transform duration-300"
                >
                  {imgs[0] ? (
                    <div className="relative h-40 w-full overflow-hidden">
                      <Image
                        src={imgs[0]}
                        alt={ev.title}
                        fill
                        sizes="(max-width:768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  ) : (
                    <div className="h-40 flex items-center justify-center" style={{ background: "linear-gradient(135deg,#38bdf820,#6366f120)" }}>
                      <Calendar size={36} className="text-sky-400 opacity-60" />
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-foreground text-base leading-snug mb-2 line-clamp-2">{ev.title}</h3>
                    <div className="space-y-1 text-xs text-muted-foreground mt-auto">
                      {ev.date && (
                        <div className="flex items-center gap-1.5">
                          <Calendar size={11} /> {formatDate(ev.date)}
                        </div>
                      )}
                      {ev.time && (
                        <div className="flex items-center gap-1.5">
                          <Clock size={11} /> {ev.time}
                        </div>
                      )}
                      {ev.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={11} /> {ev.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Members Preview ──────────────────────────────────────────────────────────
function MembersPreview() {
  const sectionRef = useRef<HTMLElement>(null)
  const cachedMembers = useCachedMembers()

  // Filter: Core Leadership (executive team) + isHead leads from every other dept
  const filteredMembers = (cachedMembers ?? []).filter(
    (m) => m.department === "Core Leadership" || m.isHead
  )

  const [members, setMembers] = useState(filteredMembers)
  const [loading, setLoading] = useState(!cachedMembers)

  // Read directly from the cache — DataCacheProvider fetches this on mount
  useEffect(() => {
    if (cachedMembers) {
      setMembers(
        cachedMembers.filter(
          (m) => m.department === "Core Leadership" || m.isHead
        )
      )
      setLoading(false)
    }
  }, [cachedMembers])

  useEffect(() => {
    if (loading || !members.length) return
    const ctx = gsap.context(() => {
      gsap.fromTo(".mp-heading", { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ".mp-heading", start: "top 80%" },
      })
      gsap.fromTo(".mp-card", { opacity: 0, y: 40, scale: 0.95 }, {
        opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.07, ease: "back.out(1.5)",
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [loading, members])

  return (
    <section ref={sectionRef} id="home-members" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="mp-heading flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4 border"
              style={{ color: "#a78bfa", borderColor: "#a78bfa40", background: "#a78bfa12" }}
            >
              <Users size={12} />
              The Team
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              Meet the <span className="gradient-text">Members</span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl">
              Talented developers, designers, and innovators driving CoDE Club forward.
            </p>
          </div>
          <Link
            href="/members"
            className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold border transition-all duration-300 hover:scale-105 shrink-0"
            style={{ color: "#a78bfa", borderColor: "#a78bfa40", background: "#a78bfa10" }}
          >
            See All Members <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl h-52 animate-pulse" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center text-muted-foreground">No members found.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {members.map((m) => (
              <div
                key={m._id}
                className="mp-card glass-card rounded-2xl p-4 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="relative w-16 h-16 rounded-full overflow-hidden mb-3 border-2 group-hover:scale-110 transition-transform duration-300"
                  style={{ borderColor: m.isHead ? "#38bdf8" : "#a78bfa40" }}
                >
                  {m.image ? (
                    <Image src={m.image} alt={m.name} fill sizes="64px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold" style={{ background: "linear-gradient(135deg,#38bdf830,#a78bfa30)", color: "#a78bfa" }}>
                      {m.name[0]}
                    </div>
                  )}
                </div>
                {m.isHead && (
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-1" style={{ background: "#38bdf820", color: "#38bdf8" }}>Head</span>
                )}
                <p className="text-sm font-bold text-foreground leading-snug">{m.name}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{m.role}</p>
                <p className="text-[10px] text-muted-foreground opacity-70">{m.department}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Communities Preview ───────────────────────────────────────────────────────
function WhatsAppIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function CommunitiesPreview() {
  const sectionRef = useRef<HTMLElement>(null)
  const cachedCommunities = useCachedCommunities()
  const [communities, setCommunities] = useState<{ _id: string; id: string; name: string; description: string; color: string; members: string; iconName: string; whatsappLink: string; isMain: boolean }[]>(
    cachedCommunities ?? []
  )
  const [loading, setLoading] = useState(!cachedCommunities)

  // Read directly from the cache — DataCacheProvider fetches this on mount
  useEffect(() => {
    if (cachedCommunities) {
      setCommunities(cachedCommunities.slice(0, 6))
      setLoading(false)
    }
  }, [cachedCommunities])

  useEffect(() => {
    if (loading) return
    const ctx = gsap.context(() => {
      gsap.fromTo(".cp-heading", { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ".cp-heading", start: "top 80%" },
      })
      gsap.fromTo(".cp-card", { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.6, stagger: 0.09, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [loading])

  return (
    <section ref={sectionRef} id="home-communities" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="cp-heading flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4 border"
              style={{ color: "#34d399", borderColor: "#34d39940", background: "#34d39912" }}
            >
              <WhatsAppIcon size={12} />
              WhatsApp Groups
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              Our <span className="gradient-text">Communities</span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl">
              Pick your niche and join the conversation with like-minded developers.
            </p>
          </div>
          <Link
            href="/communities"
            className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold border transition-all duration-300 hover:scale-105 shrink-0"
            style={{ color: "#34d399", borderColor: "#34d39940", background: "#34d39910" }}
          >
            Explore All <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <div key={i} className="glass-card rounded-2xl h-36 animate-pulse" />)}
          </div>
        ) : communities.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center text-muted-foreground">No communities yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {communities.slice(0, 6).map((c) => {
              const Icon = getIcon(c.iconName)
              return (
                <a
                  key={c._id}
                  href={c.whatsappLink || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cp-card glass-card rounded-2xl p-5 flex items-start gap-4 group hover:-translate-y-1.5 transition-transform duration-300 cursor-pointer"
                  style={{ border: `1px solid ${c.color}25` }}
                >
                  <div
                    className="size-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300"
                    style={{ background: `linear-gradient(135deg,${c.color}30,${c.color}10)`, border: `1px solid ${c.color}30` }}
                  >
                    <Icon size={20} style={{ color: c.color }} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-foreground text-sm mb-0.5 truncate">{c.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{c.description}</p>
                    <div className="flex items-center gap-1 mt-2 text-[11px] font-semibold" style={{ color: "#25D366" }}>
                      <WhatsAppIcon size={11} />
                      {c.members} members
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function HomePreview() {
  return (
    <>
      <EventsPreview />
      <MembersPreview />
      <CommunitiesPreview />
    </>
  )
}
