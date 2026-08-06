"use client"

import React, { useRef, useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"
import {
  Calendar, Clock, MapPin, ChevronLeft, ChevronRight,
  ArrowLeft, CheckCircle2, Loader2, X, Info, Users, Trophy,
} from "lucide-react"
import { FiChevronRight } from "react-icons/fi"
import ReactMarkdown from "react-markdown"
import { useUser } from "@/hooks/use-user"
import { AuthModal } from "@/components/auth-modal"

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
  prizePool?: { position: string, amount: string }[] | null
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



// ─── Registration Modal ───────────────────────────────────────────────────────

const YEAR_OPTIONS = ["FY", "SY", "TY", "BE", "Passout", "Other"]
const DEPT_OPTIONS = ["IT", "CS", "MECH", "CIVIL", "EXTC", "ETRX", "AIDS", "AIML", "OTHER"]
const DIV_OPTIONS  = ["A", "B", "C", "D"]

type Teammate = { name: string; email: string; phone: string; year: string; department: string; division: string }

interface RegModalProps {
  eventId: string
  eventTitle: string
  minTeamSize: number | null
  maxTeamSize: number | null
  teamNameLabel: string
  prefill: { name: string; email: string; year: string; department: string; division: string }
  onClose: () => void
  onSuccess: (whatsappLink?: string) => void
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
    isTeamEvent ? Array.from({ length: minTeammates }, () => ({ name: "", email: "", phone: "", year: "", department: "", division: "" })) : []
  )
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")
  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef   = useRef<HTMLDivElement>(null)

  const setField = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }))

  const setTM = (i: number, k: keyof Teammate, v: string) =>
    setTeammates(p => p.map((t, idx) => idx === i ? { ...t, [k]: v } : t))

  const addTeammate = () => {
    if (teammates.length < maxTeammates) setTeammates(p => [...p, { name: "", email: "", phone: "", year: "", department: "", division: "" }])
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
    if (isTeamEvent) {
      if (teammates.length < minTeammates) {
        setError(`Please add at least ${minTeammates} teammate${minTeammates > 1 ? "s" : ""}.`); return
      }
      if (!teamName.trim()) {
        setError(`${teamNameLabel || "Team Name"} is required.`); return
      }
      for (let i = 0; i < teammates.length; i++) {
        if (!teammates[i].name.trim() || !teammates[i].email.trim()) {
          setError(`Teammate ${i + 2}'s name and email are required.`); return
        }
      }
    }
    setLoading(true); setError("")
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, teamName, teammates }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error ?? "Registration failed. Please try again.")
      else onSuccess(data.whatsappLink)
    } catch { setError("Network error. Please try again.") }
    finally { setLoading(false) }
  }

  const inputCls = "w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/8 text-sm placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all text-white"
  const labelCls = "block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5"

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={e => { if (e.target === overlayRef.current) close() }}>
      <div ref={panelRef} className="relative w-full max-w-lg rounded-[28px] border border-white/8 bg-[#0b1220] shadow-[0_0_80px_rgba(0,0,0,0.8)] p-7 md:p-8 max-h-[90vh] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
        
        {/* Decorative glow inside modal */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[150px] bg-primary/10 blur-[80px] rounded-full pointer-events-none" />

        <button onClick={close} className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 transition-colors z-10">
          <X className="h-4 w-4" />
        </button>

        <div className="relative z-10">
          <h2 className="text-2xl font-black mb-1 text-white tracking-tight">Register for Event</h2>
          <p className="text-sm text-white/40 mb-1 line-clamp-1">{eventTitle}</p>
          {isTeamEvent && (
            <p className="text-xs text-primary/80 mb-6 font-semibold">Team event · {minTeamSize}–{maxTeamSize} members</p>
          )}
          {!isTeamEvent && <div className="mb-6" />}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Team Name (only for team events) ── */}
            {isTeamEvent && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/6 pb-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                    {teamNameLabel || "Team"} · {1 + teammates.length}/{maxTeamSize} members
                  </p>
                </div>

                {/* Team name */}
                <div>
                  <label className={labelCls}>{teamNameLabel || "Team Name"} *</label>
                  <input type="text" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="Enter team name" className={inputCls} />
                </div>
              </div>
            )}

            {/* ── Your info / Team leader info ── */}
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 border-b border-white/6 pb-2">
                {isTeamEvent ? "Team Leader Info" : "Your Info"}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelCls}>Full Name *</label>
                  <input type="text" value={form.name} onChange={e => setField("name", e.target.value)} placeholder="Name" className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Email *</label>
                  <input type="email" value={form.email} onChange={e => setField("email", e.target.value)} placeholder="Email" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input type="tel" value={form.phone} onChange={e => setField("phone", e.target.value)} placeholder="+91 XXXXX" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Year</label>
                  <select value={form.year} onChange={e => setField("year", e.target.value)} className={inputCls + " appearance-none cursor-pointer"}>
                    <option value="" className="bg-[#0b1220] text-white/50">Select Year</option>
                    {YEAR_OPTIONS.map(o => <option key={o} value={o} className="bg-[#0b1220] text-white">{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Dept.</label>
                  <select value={form.department} onChange={e => setField("department", e.target.value)} className={inputCls + " appearance-none cursor-pointer"}>
                    <option value="" className="bg-[#0b1220] text-white/50">Select Dept.</option>
                    {DEPT_OPTIONS.map(o => <option key={o} value={o} className="bg-[#0b1220] text-white">{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Division</label>
                  <select value={form.division} onChange={e => setField("division", e.target.value)} className={inputCls + " appearance-none cursor-pointer"}>
                    <option value="" className="bg-[#0b1220] text-white/50">Select Div.</option>
                    {DIV_OPTIONS.map(o => <option key={o} value={o} className="bg-[#0b1220] text-white">{o}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* ── Teammates (only for team events) ── */}
            {isTeamEvent && (
              <div className="space-y-4">
                {/* Teammate rows */}
                {teammates.map((tm, i) => (
                  <div key={i} className="rounded-2xl bg-white/[0.015] border border-white/6 p-5 space-y-3 relative">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Teammate {i + 2}</p>
                      {teammates.length > minTeammates && (
                        <button type="button" onClick={() => removeTeammate(i)}
                          className="p-1.5 rounded-full bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors">
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className={labelCls}>Name *</label>
                        <input type="text" value={tm.name} onChange={e => setTM(i, "name", e.target.value)} placeholder="Teammate name" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Email *</label>
                        <input type="email" value={tm.email} onChange={e => setTM(i, "email", e.target.value)} placeholder="Email" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Phone</label>
                        <input type="tel" value={tm.phone} onChange={e => setTM(i, "phone", e.target.value)} placeholder="+91" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Year</label>
                        <select value={tm.year} onChange={e => setTM(i, "year", e.target.value)} className={inputCls + " appearance-none cursor-pointer"}>
                          <option value="" className="bg-[#0b1220] text-white/50">Select Year</option>
                          {YEAR_OPTIONS.map(o => <option key={o} value={o} className="bg-[#0b1220] text-white">{o}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Dept.</label>
                        <select value={tm.department} onChange={e => setTM(i, "department", e.target.value)} className={inputCls + " appearance-none cursor-pointer"}>
                          <option value="" className="bg-[#0b1220] text-white/50">Select Dept.</option>
                          {DEPT_OPTIONS.map(o => <option key={o} value={o} className="bg-[#0b1220] text-white">{o}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className={labelCls}>Division</label>
                        <select value={tm.division} onChange={e => setTM(i, "division", e.target.value)} className={inputCls + " appearance-none cursor-pointer"}>
                          <option value="" className="bg-[#0b1220] text-white/50">Select Div.</option>
                          {DIV_OPTIONS.map(o => <option key={o} value={o} className="bg-[#0b1220] text-white">{o}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add teammate button */}
                {teammates.length < maxTeammates && (
                  <button type="button" onClick={addTeammate}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 py-3 text-xs font-bold uppercase tracking-widest text-white/30 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all">
                    <span className="text-lg leading-none">+</span> Add Teammate
                  </button>
                )}
              </div>
            )}

            {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 font-medium">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/10 transition-all hover:scale-[1.01] hover:shadow-primary/20 hover:opacity-90 disabled:opacity-60 disabled:scale-100 disabled:cursor-not-allowed mt-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Registering…" : "Confirm Registration"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ─── Registration Success Banner ──────────────────────────────────────────────

function SuccessBanner({ whatsappLink }: { whatsappLink?: string | null }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-4 py-3">
        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-emerald-400">You&apos;re registered!</p>
          <p className="text-xs text-emerald-400/70">We look forward to seeing you at the event.</p>
        </div>
      </div>
      {whatsappLink && (
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25D366] text-white text-sm font-bold shadow-lg shadow-[#25D366]/20 transition-all hover:scale-[1.02] hover:bg-[#20b958]">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
          Join WhatsApp Group
        </a>
      )}
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
  const { user } = useUser()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [regModalOpen, setRegModalOpen] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null)
  const [checkingReg, setCheckingReg] = useState(true)

  const imgs = getImages(event)
  const firstImg = imgs[0] ?? null
  const isUpcoming = new Date(event.date) >= new Date()

  const teamLabel =
    !event.minTeamSize && !event.maxTeamSize
      ? "Solo"
      : event.minTeamSize === event.maxTeamSize
        ? `${event.minTeamSize} Members`
        : `${event.minTeamSize}\u2013${event.maxTeamSize} Members`

  const isRegistrationOpen = event.registrationStartTime 
    ? new Date(event.registrationStartTime) <= new Date() 
    : true;

  // Check existing registration on mount
  useEffect(() => {
    if (!user) { setCheckingReg(false); return }
    fetch(`/api/events/${event._id}/register`)
      .then((r) => r.json())
      .then((d) => { 
        if (d.registered) {
          setRegistered(true)
          if (d.whatsappLink) setWhatsappLink(d.whatsappLink)
        }
      })
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
    gsap.from(".ed-fade", { y: 28, opacity: 0, duration: 0.7, stagger: 0.1, ease: "power2.out" })
  }, { scope: containerRef, dependencies: [event._id] })

  const handleRegisterClick = () => {
    setRegModalOpen(true)
  }

  const handleGoogleForm = () => {
    if (event.googleFormLink) window.open(event.googleFormLink, "_blank", "noopener,noreferrer")
  }

  return (
    <div ref={containerRef} className="relative min-h-screen w-full overflow-x-hidden text-blue-50">

      {/* ═══════════════════════════════════════════════════
          HERO — Poster-centric with meta info
      ═══════════════════════════════════════════════════ */}
      <section className="relative pt-4 pb-0 min-h-[85vh] flex flex-col">
        {/* Ambient glow from poster image as blurred backdrop */}
        {firstImg && (
          <div
            className="absolute inset-0 opacity-[0.12] blur-[80px] scale-110 pointer-events-none"
            style={{ backgroundImage: `url(${firstImg})`, backgroundSize: "cover", backgroundPosition: "center" }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1220]/80 via-[#0b1220]/30 to-[#111827] pointer-events-none" />

        <div className="relative z-10 container mx-auto px-5 md:px-10 flex-1 flex items-center py-10 md:py-16">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

            {/* LEFT: meta info */}
            <div className="lg:col-span-7 ed-fade space-y-7">
              {/* Breadcrumb + back button */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className="group flex items-center gap-2 rounded-full border border-white/15 bg-black/40 backdrop-blur-md px-4 py-2 text-xs uppercase tracking-widest text-white/50 transition-all duration-200 hover:border-primary/50 hover:text-primary"
                >
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                  All Events
                </button>
                <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-white/30">
                  <FiChevronRight size={10} />
                  <span className="text-primary">{isUpcoming ? "Upcoming" : "Completed"}</span>
                </div>
              </div>

              {/* Status badge */}
              <div className="flex flex-wrap gap-3">
                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  isUpcoming ? "bg-primary text-primary-foreground" : "bg-white/10 text-white/40"
                }`}>
                  {isUpcoming ? "Upcoming" : "Completed"}
                </span>
                {teamLabel !== "Solo" && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest">
                    <Users size={10} /> {teamLabel}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-[3rem] sm:text-6xl md:text-7xl font-black text-white uppercase leading-[0.9] tracking-tight">
                {event.title.split(" ").map((word, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && " "}
                    {i === 1 ? <><b className="text-primary">{word[0]}</b>{word.slice(1)}</> : word}
                  </React.Fragment>
                ))}
              </h1>

              {/* Short description */}
              {event.description && (
                <p className="text-base md:text-lg text-blue-50/55 leading-relaxed max-w-lg font-light">
                  {event.description.slice(0, 180)}{event.description.length > 180 ? "\u2026" : ""}
                </p>
              )}

              {/* Quick stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { icon: Calendar, label: "Date", value: new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
                  ...(event.time ? [{ icon: Clock, label: "Time", value: event.time }] : []),
                  ...(event.location ? [{ icon: MapPin, label: "Venue", value: event.location }] : []),
                  { icon: Users, label: "Team Size", value: teamLabel },
                  { icon: Trophy, label: "Prize Pool", value: event.prizePool && event.prizePool.length > 0 ? event.prizePool.map(p => p.amount).join(" + ") : "No Prize Pool" },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col gap-1.5 p-4 rounded-2xl bg-white/[0.03] border border-white/6">
                    <stat.icon className="text-primary" size={15} />
                    <p className="text-white font-black text-sm leading-tight">{stat.value}</p>
                    <p className="text-white/30 text-[9px] uppercase font-black tracking-widest">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-wrap items-center gap-5 pt-2">
                {isUpcoming && (
                  <>
                    {registered ? (
                      <SuccessBanner whatsappLink={whatsappLink} />
                    ) : event.googleFormLink ? (
                      <button
                        onClick={handleGoogleForm}
                        disabled={!isRegistrationOpen}
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground text-sm font-black uppercase tracking-widest transition-all hover:opacity-90 hover:scale-[1.02] shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                      >
                        {!isRegistrationOpen ? "Opens " + new Date(event.registrationStartTime!).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "numeric", minute: "numeric" }) : "Register Now"}
                      </button>
                    ) : (
                      <button
                        onClick={handleRegisterClick}
                        disabled={checkingReg || !isRegistrationOpen}
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground text-sm font-black uppercase tracking-widest transition-all hover:opacity-90 hover:scale-[1.02] shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                      >
                        {!isRegistrationOpen ? "Opens " + new Date(event.registrationStartTime!).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "numeric", minute: "numeric" }) : "Register Now"}
                      </button>
                    )}
                    <button
                      onClick={() => document.getElementById("event-content")?.scrollIntoView({ behavior: "smooth" })}
                      className="text-white/40 hover:text-white text-xs uppercase tracking-widest font-bold transition flex items-center gap-1.5"
                    >
                      View Details <FiChevronRight size={11} />
                    </button>
                  </>
                )}
                {!isUpcoming && (
                  <p className="text-white/30 text-sm font-semibold uppercase tracking-widest">Event Concluded</p>
                )}
              </div>
            </div>

            {/* RIGHT: poster / image card */}
            <div className="lg:col-span-5 ed-fade flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[340px] sm:max-w-[380px]">
                {/* Glow ring */}
                <div className="absolute -inset-3 rounded-[32px] bg-primary/8 blur-2xl" />
                {/* Poster */}
                <div className="relative aspect-[3/4] w-full rounded-[28px] overflow-hidden border border-white/12 shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
                  {firstImg ? (
                    <ImageCarousel images={imgs} alt={event.title} />
                  ) : (
                    <div className="size-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-transparent">
                      <Calendar className="h-24 w-24 text-white/10" />
                    </div>
                  )}
                  {/* Bottom gradient overlay on poster */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  {/* Date badge on poster */}
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                    <div>
                      <p className="text-[9px] uppercase font-black tracking-widest text-white/40 mb-0.5">Date</p>
                      <p className="text-lg font-black text-white">
                        {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                    <span className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-widest">
                      {isUpcoming ? "Upcoming" : "Done"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom fade out */}
        <div className="absolute bottom-0 left-0 w-full h-28 bg-gradient-to-t from-[#111827] to-transparent pointer-events-none" />
      </section>

      {/* ═══════════════════════════════════════════════════
          CONTENT — description + sidebar
      ═══════════════════════════════════════════════════ */}
      <section id="event-content" className="relative z-10 py-16 md:py-24">
        <div className="container mx-auto px-5 md:px-10 max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">

            {/* ── MAIN CONTENT ── */}
            <div className="lg:col-span-8 ed-fade">
              {/* About section */}
              <div className="rounded-2xl border border-white/8 bg-white/[0.015] p-6 md:p-8">
                <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-white/55 flex items-center gap-2 mb-6">
                  <Info size={13} className="text-primary" />
                  About this Event
                </h2>

                {event.description ? (
                  <div className="prose prose-invert max-w-none text-blue-50/70 leading-relaxed">
                    <ReactMarkdown>{event.description}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm text-blue-50/45">Details will be shared soon.</p>
                )}

                {/* Stats grid inside content */}
                <div className="grid sm:grid-cols-2 gap-5 mt-8">
                  <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/6">
                    <p className="text-[10px] uppercase font-black tracking-widest text-primary mb-3 flex items-center gap-2">
                      <Users size={12} /> Participation Mode
                    </p>
                    <p className="text-2xl font-black text-white uppercase tracking-tight">
                      {!event.minTeamSize && !event.maxTeamSize
                        ? "Solo Entry"
                        : event.minTeamSize === event.maxTeamSize
                          ? `Team of ${event.minTeamSize}`
                          : `${event.minTeamSize}\u2013${event.maxTeamSize} Members`}
                    </p>
                  </div>
                  {event.location && (
                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/6">
                      <p className="text-[10px] uppercase font-black tracking-widest text-primary mb-3 flex items-center gap-2">
                        <MapPin size={12} /> Venue
                      </p>
                      <p className="text-xl font-black text-white uppercase tracking-tight">{event.location}</p>
                    </div>
                  )}
                  {/* Prize Pool card — always shown */}
                  <div className={`p-6 rounded-3xl border border-white/6 ${
                    event.prizePool && event.prizePool.length > 0
                      ? "bg-yellow-300/5 border-yellow-300/20"
                      : "bg-white/[0.02]"
                  }`}>
                    <p className="text-[10px] uppercase font-black tracking-widest text-primary mb-3 flex items-center gap-2">
                      <Trophy size={12} /> Prize Pool
                    </p>
                    {event.prizePool && event.prizePool.length > 0 ? (
                      <div className="space-y-2 mt-4">
                        {event.prizePool.map((prize, idx) => (
                           <div key={idx} className="flex items-center justify-between pb-2 border-b border-white/10 last:border-0 last:pb-0">
                              <span className="text-white/60 font-semibold">{prize.position}</span>
                              <span className="text-xl font-black text-yellow-300 uppercase">{prize.amount}</span>
                           </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-lg font-black text-white/30 uppercase tracking-tight">No Prize Pool</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Photo gallery (if multiple images) */}
              {imgs.length > 1 && (
                <div className="mt-8 rounded-2xl border border-white/8 bg-white/[0.015] p-6 md:p-8 ed-fade">
                  <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-white/55 mb-6">
                    Gallery &middot; {imgs.length} Photos
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {imgs.map((src, i) => (
                      <div key={i} className="aspect-video rounded-xl overflow-hidden border border-white/8">
                        <img src={src} alt={`${event.title} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── SIDEBAR ── */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit ed-fade">
              <div className="rounded-[28px] border border-white/8 bg-white/[0.025] p-7 md:p-8 backdrop-blur-xl shadow-2xl space-y-7">
                <h3 className="font-black text-white uppercase tracking-widest text-xs border-b border-white/6 pb-5">Event Brief</h3>

                <div className="space-y-5 text-sm">
                  {[
                    { icon: Calendar, label: "Date", value: new Date(event.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long", year: "numeric" }) },
                    ...(event.time ? [{ icon: Clock, label: "Time", value: event.time }] : []),
                    ...(event.location ? [{ icon: MapPin, label: "Venue", value: event.location }] : []),
                    { icon: Users, label: "Team Size", value: teamLabel },
                    { icon: Trophy, label: "Prize Pool", value: event.prizePool && event.prizePool.length > 0 ? event.prizePool.map(p => `${p.position}: ${p.amount}`).join("\n") : "No Prize Pool" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                        <item.icon className="text-primary" size={16} />
                      </div>
                      <div>
                        <p className="text-[9px] uppercase font-black tracking-widest text-white/30 mb-1">{item.label}</p>
                        <p className="text-white font-bold text-sm leading-snug whitespace-pre-line">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-5 border-t border-white/6 space-y-4">
                  {isUpcoming ? (
                    registered ? (
                      <SuccessBanner />
                    ) : event.googleFormLink ? (
                      <button
                        onClick={handleGoogleForm}
                        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 px-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/10 hover:shadow-primary/20 hover:opacity-90 transition-all"
                      >
                        Register Now
                      </button>
                    ) : (
                      <button
                        onClick={handleRegisterClick}
                        disabled={checkingReg}
                        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 px-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/10 hover:shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-60"
                      >
                        {checkingReg ? <Loader2 className="h-4 w-4 animate-spin" /> : "Register Now"}
                      </button>
                    )
                  ) : (
                    <p className="text-center text-sm text-white/30 py-2">This event has concluded.</p>
                  )}

                  {isUpcoming && (
                    <p className="text-center text-[9px] uppercase font-bold tracking-[0.2em] text-white/20 animate-pulse">
                      Limited slots available
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Auth Modal — shown when guest clicks Register */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        reason="You need to be signed in to register for this event."
        onSuccess={() => {
          setAuthModalOpen(false)
          setRegModalOpen(true)
        }}
      />

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
          onSuccess={(link) => {
            setRegModalOpen(false)
            setRegistered(true)
            if (link) setWhatsappLink(link)
          }}
        />
      )}

      <style jsx>{`
        :global(.prose h1) { font-size: 2rem; font-weight: 800; color: white; margin-bottom: 1rem; }
        :global(.prose h2) { font-size: 1.5rem; font-weight: 700; color: white; margin-top: 1.5rem; margin-bottom: 0.75rem; }
        :global(.prose h3) { font-size: 1.2rem; font-weight: 700; color: var(--color-primary, #6366f1); }
        :global(.prose p) { margin-bottom: 1rem; line-height: 1.8; color: rgba(235,245,255,0.65); }
        :global(.prose ul) { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
        :global(.prose ol) { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
        :global(.prose li) { margin-bottom: 0.5rem; color: rgba(235,245,255,0.65); }
        :global(.prose strong) { color: white; font-weight: 800; }
        :global(.prose em) { color: rgba(235,245,255,0.9); }
        :global(.prose code) { background: rgba(255,255,255,0.08); padding: 0.15rem 0.4rem; border-radius: 5px; font-size: 0.9em; color: var(--color-primary, #6366f1); }
      `}</style>
    </div>
  )
}