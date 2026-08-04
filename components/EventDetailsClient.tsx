"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import {
  Calendar, Clock, MapPin, ChevronLeft, ChevronRight,
  ArrowLeft, CheckCircle2, Loader2, X, Phone, User2,
} from "lucide-react"
import { Markdown } from "@/components/ui/markdown"
import { useUser } from "@/hooks/use-user"

// ─── Types ────────────────────────────────────────────────────────────────────

type ClubEvent = {
  _id: string
  image?: string
  images?: string[]
  title: string
  date: string
  description?: string
  location?: string
  googleFormLink?: string
  time?: string
  minTeamSize?: number | null
  maxTeamSize?: number | null
  teamNameLabel?: string
}

function getImages(event: ClubEvent): string[] {
  if (event.images && event.images.length > 0) return event.images
  if (event.image) return [event.image]
  return []
}

// ─── Image Carousel ───────────────────────────────────────────────────────────

function ImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [idx, setIdx] = useState(0)
  const dragX = useRef<number | null>(null)
  const dragging = useRef(false)

  const goTo = useCallback(
    (n: number) => {
      if (images.length <= 1) return
      setIdx(((n % images.length) + images.length) % images.length)
    },
    [images.length]
  )
  const prev = useCallback(() => goTo(idx - 1), [goTo, idx])
  const next = useCallback(() => goTo(idx + 1), [goTo, idx])

  const onMouseDown = (e: React.MouseEvent) => { dragX.current = e.clientX; dragging.current = false }
  const onMouseMove = (e: React.MouseEvent) => { if (dragX.current !== null && Math.abs(e.clientX - dragX.current) > 5) dragging.current = true }
  const onMouseUp = (e: React.MouseEvent) => {
    if (dragX.current === null) return
    const d = e.clientX - dragX.current
    if (Math.abs(d) > 40) d < 0 ? next() : prev()
    dragX.current = null; dragging.current = false
  }
  const onTouchStart = (e: React.TouchEvent) => { dragX.current = e.touches[0].clientX }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (dragX.current === null) return
    const d = e.changedTouches[0].clientX - dragX.current
    if (Math.abs(d) > 40) d < 0 ? next() : prev()
    dragX.current = null
  }

  if (images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white/5 rounded-2xl">
        <Calendar className="h-16 w-16 text-white/10" />
      </div>
    )
  }

  return (
    <div
      className="relative w-full h-full group select-none cursor-grab active:cursor-grabbing rounded-2xl overflow-hidden"
      onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}
      onMouseLeave={() => { dragX.current = null }}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
    >
      {images.map((src, i) => (
        <img
          key={i} src={src} alt={`${alt} ${i + 1}`} draggable={false}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${i === idx ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        />
      ))}

      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); if (!dragging.current) prev() }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
            aria-label="Previous">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); if (!dragging.current) next() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
            aria-label="Next">
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {images.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); goTo(i) }}
                className={`rounded-full transition-all duration-200 ${i === idx ? "bg-white w-5 h-1.5" : "bg-white/50 w-1.5 h-1.5 hover:bg-white/80"}`}
                aria-label={`Image ${i + 1}`} />
            ))}
          </div>
          <div className="absolute top-3 right-3 z-10 rounded-full bg-black/60 text-white text-xs px-2.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {idx + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Thumbnail Strip ──────────────────────────────────────────────────────────

function ThumbnailStrip({ images, activeIdx, onSelect }: { images: string[]; activeIdx: number; onSelect: (i: number) => void }) {
  if (images.length <= 1) return null
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 mt-4" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,.15) transparent" }}>
      {images.map((src, i) => (
        <button key={i} onClick={() => onSelect(i)}
          className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${i === activeIdx ? "border-primary scale-105" : "border-white/10 opacity-60 hover:opacity-90 hover:border-white/30"}`}
        >
          <img src={src} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
        </button>
      ))}
    </div>
  )
}

// ─── Registration Modal ───────────────────────────────────────────────────────

const YEAR_OPTIONS = ["FY", "SY", "TY", "BE", "Passout", "Other"]
const DEPT_OPTIONS = ["IT", "CS", "MECH", "CIVIL", "EXTC", "ETRX", "AIDS", "AIML", "OTHER"]
const DIV_OPTIONS  = ["A", "B", "C", "D"]

type Teammate = { name: string; email: string; phone: string }

interface RegModalProps {
  eventId: string
  eventTitle: string
  minTeamSize: number | null
  maxTeamSize: number | null
  teamNameLabel: string
  prefill: { name: string; email: string; year: string; department: string; division: string }
  onClose: () => void
  onSuccess: () => void
}

function RegistrationModal({
  eventId, eventTitle,
  minTeamSize, maxTeamSize, teamNameLabel,
  prefill, onClose, onSuccess,
}: RegModalProps) {
  const isTeamEvent = minTeamSize != null && maxTeamSize != null
  // registrant counts as 1, so teammates = total - 1
  const minTeammates = isTeamEvent ? Math.max(0, minTeamSize! - 1) : 0
  const maxTeammates = isTeamEvent ? maxTeamSize! - 1 : 0

  const [form, setForm] = useState({
    name: prefill.name, email: prefill.email, phone: "",
    year: prefill.year, department: prefill.department, division: prefill.division,
  })
  const [teamName, setTeamName]   = useState("")
  const [teammates, setTeammates] = useState<Teammate[]>(
    isTeamEvent ? Array.from({ length: minTeammates }, () => ({ name: "", email: "", phone: "" })) : []
  )
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")
  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef   = useRef<HTMLDivElement>(null)

  const setField = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }))

  const setTM = (i: number, k: keyof Teammate, v: string) =>
    setTeammates(p => p.map((t, idx) => idx === i ? { ...t, [k]: v } : t))

  const addTeammate = () => {
    if (teammates.length < maxTeammates) setTeammates(p => [...p, { name: "", email: "", phone: "" }])
  }
  const removeTeammate = (i: number) => {
    if (teammates.length > minTeammates) setTeammates(p => p.filter((_, idx) => idx !== i))
  }

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 })
    gsap.fromTo(panelRef.current, { y: 40, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: "power3.out" })
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  const close = () => gsap.to(panelRef.current, { y: 20, opacity: 0, duration: 0.2, onComplete: onClose })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) { setError("Name and email are required."); return }
    setLoading(true); setError("")
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, teamName, teammates }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error ?? "Registration failed. Please try again.")
      else onSuccess()
    } catch { setError("Network error. Please try again.") }
    finally { setLoading(false) }
  }

  const inputCls = "w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
  const labelCls = "block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5"

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => { if (e.target === overlayRef.current) close() }}>
      <div ref={panelRef} className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-card shadow-2xl p-6 max-h-[90vh] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
        <button onClick={close} className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>

        <h2 className="text-xl font-bold mb-0.5">Register for Event</h2>
        <p className="text-sm text-muted-foreground mb-1 line-clamp-1">{eventTitle}</p>
        {isTeamEvent && (
          <p className="text-xs text-primary/80 mb-5">Team event · {minTeamSize}–{maxTeamSize} members</p>
        )}
        {!isTeamEvent && <div className="mb-5" />}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Your info ── */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Your Info</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={labelCls}>Full Name *</label>
                <input type="text" value={form.name} onChange={e => setField("name", e.target.value)} placeholder="Your name" className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Email *</label>
                <input type="email" value={form.email} onChange={e => setField("email", e.target.value)} placeholder="you@example.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input type="tel" value={form.phone} onChange={e => setField("phone", e.target.value)} placeholder="+91 XXXXX" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Year</label>
                <select value={form.year} onChange={e => setField("year", e.target.value)} className={inputCls + " appearance-none"}>
                  <option value="" className="bg-zinc-900 text-white">Year</option>
                  {YEAR_OPTIONS.map(o => <option key={o} value={o} className="bg-zinc-900 text-white">{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Dept.</label>
                <select value={form.department} onChange={e => setField("department", e.target.value)} className={inputCls + " appearance-none"}>
                  <option value="" className="bg-zinc-900 text-white">Dept.</option>
                  {DEPT_OPTIONS.map(o => <option key={o} value={o} className="bg-zinc-900 text-white">{o}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Division</label>
                <select value={form.division} onChange={e => setField("division", e.target.value)} className={inputCls + " appearance-none"}>
                  <option value="" className="bg-zinc-900 text-white">Div.</option>
                  {DIV_OPTIONS.map(o => <option key={o} value={o} className="bg-zinc-900 text-white">{o}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ── Team section (only for team events) ── */}
          {isTeamEvent && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {teamNameLabel || "Team"} · {1 + teammates.length}/{maxTeamSize} members
                </p>
              </div>

              {/* Team name */}
              <div>
                <label className={labelCls}>{teamNameLabel || "Team Name"}</label>
                <input type="text" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Enter team name" className={inputCls} />
              </div>

              {/* Teammate rows */}
              {teammates.map((tm, i) => (
                <div key={i} className="rounded-xl bg-white/[0.03] border border-white/8 p-4 space-y-2.5 relative">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Teammate {i + 1}</p>
                    {teammates.length > minTeammates && (
                      <button type="button" onClick={() => removeTeammate(i)}
                        className="p-1 rounded-full bg-white/5 hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <label className={labelCls}>Name *</label>
                      <input type="text" value={tm.name} onChange={e => setTM(i, "name", e.target.value)} placeholder="Teammate name" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Email</label>
                      <input type="email" value={tm.email} onChange={e => setTM(i, "email", e.target.value)} placeholder="email" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Phone</label>
                      <input type="tel" value={tm.phone} onChange={e => setTM(i, "phone", e.target.value)} placeholder="+91" className={inputCls} />
                    </div>
                  </div>
                </div>
              ))}

              {/* Add teammate button */}
              {teammates.length < maxTeammates && (
                <button type="button" onClick={addTeammate}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
                  <span className="text-base leading-none">+</span> Add Teammate
                </button>
              )}
            </div>
          )}

          {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Registering…" : "Confirm Registration"}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Registration Success Banner ──────────────────────────────────────────────

function SuccessBanner() {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-4 py-3">
      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-emerald-400">You&apos;re registered!</p>
        <p className="text-xs text-emerald-400/70">We look forward to seeing you at the event.</p>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  event: ClubEvent
  onBack?: () => void
  backHref?: string
}

export function EventDetailsClient({ event, onBack, backHref }: Props) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [thumbIdx, setThumbIdx] = useState(0)
  const { user } = useUser()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [regModalOpen, setRegModalOpen] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [checkingReg, setCheckingReg] = useState(true)
  const imgs = getImages(event)
  const isUpcoming = new Date(event.date) >= new Date()

  // Check existing registration on mount
  useEffect(() => {
    if (!user) { setCheckingReg(false); return }
    fetch(`/api/events/${event._id}/register`)
      .then((r) => r.json())
      .then((d) => { if (d.registered) setRegistered(true) })
      .catch(() => {})
      .finally(() => setCheckingReg(false))
  }, [user, event._id])

  const handleBack = () => {
    if (onBack) onBack()
    else if (backHref) router.push(backHref)
    else router.back()
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [event._id])

  useGSAP(() => {
    gsap.from(".ed-item", { y: 32, opacity: 0, duration: 0.65, stagger: 0.08, ease: "power3.out" })
  }, { scope: containerRef, dependencies: [event._id] })

  const handleRegisterClick = () => {
    setRegModalOpen(true)
  }

  return (
    <div ref={containerRef} className="min-h-screen w-full">

      {/* ── Hero banner ── */}
      <div className="ed-item relative w-full h-72 md:h-96 overflow-hidden">
        {imgs.length > 0 ? (
          <img src={imgs[0]} alt={event.title} className="absolute inset-0 w-full h-full object-cover opacity-40" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        <button
          onClick={handleBack}
          className="absolute top-6 left-6 z-20 group flex items-center gap-2 rounded-full border border-white/15 bg-black/40 backdrop-blur-md px-4 py-2 text-xs uppercase tracking-widest text-white/60 transition-all duration-200 hover:border-primary/50 hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
          All Events
        </button>

        <div className="absolute top-6 right-6 z-20">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${isUpcoming ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {isUpcoming ? "Upcoming" : "Completed"}
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-24 -mt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12 items-start">

          {/* LEFT */}
          <div className="space-y-8">
            <div className="ed-item">
              <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">{event.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" style={{ color: "var(--accent-blue)" }} />
                  {new Date(event.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </div>
                {event.time && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" style={{ color: "var(--accent-blue)" }} />
                    {event.time}
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" style={{ color: "var(--accent-blue)" }} />
                    {event.location}
                  </div>
                )}
              </div>
            </div>

            {imgs.length > 0 && (
              <div className="ed-item">
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black/20">
                  <ImageCarousel images={imgs} alt={event.title} />
                </div>
                <ThumbnailStrip images={imgs} activeIdx={thumbIdx} onSelect={setThumbIdx} />
              </div>
            )}

            {event.description && (
              <div className="ed-item glass-card rounded-2xl p-6 border border-white/10">
                <h2 className="text-lg font-semibold mb-4">About this Event</h2>
                <Markdown content={event.description} className="text-muted-foreground leading-relaxed" />
              </div>
            )}
          </div>

          {/* RIGHT — Sticky sidebar */}
          <div className="ed-item lg:sticky lg:top-8 space-y-4">
            <div className="glass-card rounded-2xl border border-white/10 p-6 space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-white/10 pb-4">Event Details</h3>

              <div className="space-y-4 text-sm">
                <div className="flex gap-3 items-start">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Calendar className="h-4 w-4" style={{ color: "var(--accent-blue)" }} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Date</p>
                    <p className="font-medium">
                      {new Date(event.date).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>

                {event.time && (
                  <div className="flex gap-3 items-start">
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4" style={{ color: "var(--accent-blue)" }} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Time</p>
                      <p className="font-medium">{event.time}</p>
                    </div>
                  </div>
                )}

                {event.location && (
                  <div className="flex gap-3 items-start">
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4" style={{ color: "var(--accent-blue)" }} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Location</p>
                      <p className="font-medium">{event.location}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA area */}
              {isUpcoming && (
                <div className="pt-4 border-t border-white/10 space-y-3">
                  {registered ? (
                    <SuccessBanner />
                  ) : (
                    <button
                      onClick={handleRegisterClick}
                      className="group w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20"
                    >
                      Register Now
                    </button>
                  )}
                </div>
              )}

              {!isUpcoming && (
                <div className="pt-4 border-t border-white/10 text-center">
                  <p className="text-sm text-muted-foreground">This event has concluded.</p>
                </div>
              )}
            </div>

            {imgs.length > 1 && (
              <p className="text-center text-xs text-muted-foreground">
                {imgs.length} photos · swipe or use arrows to browse
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Registration Modal */}
      {regModalOpen && (
        <RegistrationModal
          eventId={event._id}
          eventTitle={event.title}
          minTeamSize={event.minTeamSize ?? null}
          maxTeamSize={event.maxTeamSize ?? null}
          teamNameLabel={event.teamNameLabel ?? ""}
          prefill={{
            name:       user?.fullName ?? "",
            email:      user?.email ?? "",
            year:       user?.year ?? "",
            department: user?.department ?? "",
            division:   user?.division ?? "",
          }}
          onClose={() => setRegModalOpen(false)}
          onSuccess={() => {
            setRegModalOpen(false)
            setRegistered(true)
          }}
        />
      )}
    </div>
  )
}
