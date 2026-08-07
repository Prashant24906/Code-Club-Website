"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Calendar, MapPin, Clock, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Markdown } from "@/components/ui/markdown"
import { useCachedEvents } from "@/lib/data-cache"
import ElectricBorder from "./ElectricBorder"

gsap.registerPlugin(ScrollTrigger)

type Event = {
  _id: string
  image?: string       // legacy
  images?: string[]    // new multi-image
  title: string
  date: string
  description?: string
  location?: string
  googleFormLink?: string
  time?: string
  registrationCloseTime?: string | null
}

/** Resolve the effective image array for an event (supports legacy single image) */
function getImages(event: Event): string[] {
  if (event.images && event.images.length > 0) return event.images
  if (event.image) return [event.image]
  return []
}

// ─── Image Carousel ──────────────────────────────────────────────────────────

interface CarouselProps {
  images: string[]
  alt: string
  className?: string
  large?: boolean
}

function ImageCarousel({ images, alt, className = "", large = false }: CarouselProps) {
  const [idx, setIdx] = useState(0)
  const dragStartX = useRef<number | null>(null)
  const dragging = useRef(false)

  const goTo = useCallback(
    (next: number) => {
      if (images.length <= 1) return
      setIdx(((next % images.length) + images.length) % images.length)
    },
    [images.length]
  )

  const prev = useCallback(() => goTo(idx - 1), [goTo, idx])
  const next = useCallback(() => goTo(idx + 1), [goTo, idx])

  // Mouse drag
  const onMouseDown = (e: React.MouseEvent) => {
    dragStartX.current = e.clientX
    dragging.current = false
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (dragStartX.current !== null && Math.abs(e.clientX - dragStartX.current) > 5) {
      dragging.current = true
    }
  }
  const onMouseUp = (e: React.MouseEvent) => {
    if (dragStartX.current === null) return
    const diff = e.clientX - dragStartX.current
    if (Math.abs(diff) > 40) diff < 0 ? next() : prev()
    dragStartX.current = null
    dragging.current = false
  }

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (dragStartX.current === null) return
    const diff = e.changedTouches[0].clientX - dragStartX.current
    if (Math.abs(diff) > 40) diff < 0 ? next() : prev()
    dragStartX.current = null
  }

  if (images.length === 0) {
    return <img src="/placeholder.svg" alt={alt} className={`w-full h-full object-contain ${className}`} />
  }

  return (
    <div
      className={`relative w-full h-full group select-none cursor-grab active:cursor-grabbing ${className}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={() => { dragStartX.current = null }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Images */}
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`${alt} ${i + 1}`}
          draggable={false}
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${i === idx ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          style={{ padding: "8px" }}
        />
      ))}

      {/* Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); if (!dragging.current) prev() }}
            className={`absolute left-1 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/75 ${large ? "p-2" : "p-1"}`}
            aria-label="Previous image"
          >
            <ChevronLeft className={large ? "h-5 w-5" : "h-4 w-4"} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); if (!dragging.current) next() }}
            className={`absolute right-1 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/75 ${large ? "p-2" : "p-1"}`}
            aria-label="Next image"
          >
            <ChevronRight className={large ? "h-5 w-5" : "h-4 w-4"} />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); goTo(i) }}
                className={`rounded-full transition-all duration-200 ${i === idx ? "bg-white w-4 h-1.5" : "bg-white/50 w-1.5 h-1.5 hover:bg-white/80"
                  }`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>

          {/* Counter */}
          <div className="absolute top-2 right-2 z-10 rounded-full bg-black/50 text-white text-xs px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {idx + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const UPCOMING_LIMIT = 8
const PAST_LIMIT = 8

export function Events() {
  const [eventsEnabled, setEventsEnabled] = useState(true)

  // ── Cache seed for page-1 data ──
  const cachedEvents = useCachedEvents()

  // Upcoming events pagination
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>(cachedEvents.upcoming?.events ?? [])
  const [upcomingPage, setUpcomingPage] = useState(1)
  const [upcomingTotalPages, setUpcomingTotalPages] = useState(cachedEvents.upcoming?.totalPages ?? 1)
  const [upcomingTotal, setUpcomingTotal] = useState<number | null>(cachedEvents.upcoming?.total ?? null)
  const [upcomingLoading, setUpcomingLoading] = useState(cachedEvents.upcoming === null)

  // Past events pagination
  const [pastEvents, setPastEvents] = useState<Event[]>(cachedEvents.past?.events ?? [])
  const [pastPage, setPastPage] = useState(1)
  const [pastTotalPages, setPastTotalPages] = useState(cachedEvents.past?.totalPages ?? 1)
  const [pastTotal, setPastTotal] = useState<number | null>(cachedEvents.past?.total ?? null)
  const [pastLoading, setPastLoading] = useState(cachedEvents.past === null)

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [eventAspectById, setEventAspectById] = useState<Record<string, "square" | "portrait">>({})
  const sectionRef = useRef<HTMLElement>(null)
  const router = useRouter()
  const [navigatingId, setNavigatingId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => setEventsEnabled(data.eventsEnabled ?? true))
      .catch(() => setEventsEnabled(true))
  }, [])

  // Fetch upcoming events — skip page 1 if already seeded from cache
  useEffect(() => {
    if (upcomingPage === 1 && cachedEvents.upcoming !== null) return
    const load = async () => {
      setUpcomingLoading(true)
      try {
        const totalParam = upcomingTotal !== null && upcomingPage > 1 ? `&knownTotal=${upcomingTotal}` : ""
        const res = await fetch(`/api/events?page=${upcomingPage}&limit=${UPCOMING_LIMIT}&type=upcoming${totalParam}`)
        const data = await res.json()
        setUpcomingEvents(data.events ?? [])
        setUpcomingTotalPages(data.totalPages ?? 1)
        if (data.total !== undefined) setUpcomingTotal(data.total)
      } catch (err) {
        console.error(err)
      } finally {
        setUpcomingLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upcomingPage])

  // Fetch past events — skip page 1 if already seeded from cache
  useEffect(() => {
    if (pastPage === 1 && cachedEvents.past !== null) return
    const load = async () => {
      setPastLoading(true)
      try {
        const totalParam = pastTotal !== null && pastPage > 1 ? `&knownTotal=${pastTotal}` : ""
        const res = await fetch(`/api/events?page=${pastPage}&limit=${PAST_LIMIT}&type=past${totalParam}`)
        const data = await res.json()
        setPastEvents(data.events ?? [])
        setPastTotalPages(data.totalPages ?? 1)
        if (data.total !== undefined) setPastTotal(data.total)
      } catch (err) {
        console.error(err)
      } finally {
        setPastLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pastPage])

  // Determine aspect ratio from first image of each event (runs whenever either page changes)
  const allPageEvents = [...upcomingEvents, ...pastEvents]
  useEffect(() => {
    let cancelled = false
    const entries = allPageEvents
      .filter((e) => e._id && getImages(e).length > 0)
      .map((e) => ({ id: e._id, src: getImages(e)[0] }))
    if (!entries.length) return
    Promise.all(
      entries.map(({ id, src }) =>
        new Promise<{ id: string; aspect: "square" | "portrait" }>((resolve) => {
          const img = new Image()
          img.onload = () => {
            const ratio = img.naturalWidth / img.naturalHeight
            resolve({ id, aspect: ratio > 0.95 && ratio < 1.05 ? "square" : "portrait" })
          }
          img.onerror = () => resolve({ id, aspect: "portrait" })
          img.src = src
        })
      )
    ).then((resolved) => {
      if (cancelled) return
      const next: Record<string, "square" | "portrait"> = {}
      resolved.forEach(({ id, aspect }) => { next[id] = aspect })
      setEventAspectById((prev) => ({ ...prev, ...next }))
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upcomingEvents, pastEvents])

  const isLoading = upcomingLoading && pastLoading

  useEffect(() => {
    if (isLoading) return
    const ctx = gsap.context(() => {
      gsap.fromTo(".events-heading", { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: ".events-heading", start: "top 80%" },
      })
      gsap.fromTo(".event-card", { opacity: 0, y: 50 }, {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 60%" },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [isLoading])

  const isUpcomingEvent = (e: Event) => new Date(e.date) >= new Date()

  const handleRegister = (e: React.MouseEvent, formLink: string) => {
    e.stopPropagation()
    window.open(formLink, "_blank", "noopener,noreferrer")
  }

  if (!eventsEnabled) {
    return (
      <section id="events" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mx-auto mb-4"><Calendar className="h-6 w-6 text-muted-foreground" /></div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Events are currently unavailable</h2>
            <p className="text-muted-foreground">Please check back later. This section has been turned off by an admin.</p>
          </div>
        </div>
      </section>
    )
  }


  return (
    <section id="events" ref={sectionRef} className="py-20 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Upcoming Events */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold mb-8 gradient-text">Upcoming Events</h3>
          {upcomingLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 justify-items-center">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass-card rounded-2xl p-3 sm:p-4 w-full max-w-[320px] border border-white/10 animate-pulse">
                  <div className="aspect-[3/4] rounded-xl bg-white/5 mb-4" />
                  <div className="h-4 rounded bg-white/10 mb-2 w-3/4" />
                  <div className="h-3 rounded bg-white/5 mb-1 w-full" />
                  <div className="h-3 rounded bg-white/5 mb-4 w-2/3" />
                  <div className="h-3 rounded bg-white/5 mb-1 w-1/2" />
                </div>
              ))}
            </div>
          ) : upcomingEvents.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 justify-items-center">
                {upcomingEvents.map((event) => {
                  const imgs = getImages(event)
                  const isRegClosed = event.registrationCloseTime
                    ? new Date(event.registrationCloseTime) < new Date()
                    : false
                  return (
                    <Link key={event._id} href={`/events/${event._id}`} onClick={() => setNavigatingId(event._id)} className="event-card relative block glass-card rounded-2xl p-3 sm:p-4 group cursor-pointer w-full max-w-[320px] border border-white/10 hover:-translate-y-1 transition-transform duration-300">
                        <div className={`relative bg-black/20 rounded-xl overflow-hidden border border-white/10 mb-4 ${eventAspectById[event._id] === "square" ? "aspect-square" : "aspect-[3/4]"}`}>
                          <ImageCarousel images={imgs} alt={event.title} className="absolute inset-0" />
                          {isRegClosed ? (
                            <div className="absolute top-3 right-3 bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-medium z-20">Reg. Closed</div>
                          ) : (
                            <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium z-20">Upcoming</div>
                          )}
                        </div>
                        <h4 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2 min-h-[56px]">{event.title}</h4>
                        <Markdown content={event.description || ""} className="mb-4 text-sm min-h-[60px] max-h-[72px] overflow-hidden [mask-image:linear-gradient(to_bottom,black_75%,transparent)]" />
                        <div className="space-y-2 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center space-x-2"><Calendar className="h-4 w-4" style={{ color: "var(--accent-blue)" }} /><span>{new Date(event.date).toLocaleDateString("en-US")}</span></div>
                          {event.time && <div className="flex items-center space-x-2"><Clock className="h-4 w-4" style={{ color: "var(--accent-blue)" }} /><span>{event.time}</span></div>}
                          {event.location && <div className="flex items-center space-x-2"><MapPin className="h-4 w-4" style={{ color: "var(--accent-blue)" }} /><span className="truncate">{event.location}</span></div>}
                        </div>
                        <div className={`inline-flex w-full justify-center px-4 py-2 rounded-lg text-sm font-medium transition-transform hover:scale-[1.02] ${
                          isRegClosed
                            ? "bg-red-500/15 text-red-400 border border-red-500/25 cursor-not-allowed"
                            : "bg-primary text-primary-foreground"
                        }`}>
                          {isRegClosed ? "Registration Closed" : "Register Now"}
                        </div>
                        {navigatingId === event._id && (
                          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-2xl">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          </div>
                        )}
                    </Link>
                  )
                })}
              </div>
              {/* Upcoming pagination */}
              {upcomingTotalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <button
                    onClick={() => setUpcomingPage((p) => Math.max(1, p - 1))}
                    disabled={upcomingPage === 1}
                    className="p-2 rounded-lg glass-card border border-white/10 disabled:opacity-30 hover:border-primary/50 transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Page {upcomingPage} of {upcomingTotalPages}
                  </span>
                  <button
                    onClick={() => setUpcomingPage((p) => Math.min(upcomingTotalPages, p + 1))}
                    disabled={upcomingPage === upcomingTotalPages}
                    className="p-2 rounded-lg glass-card border border-white/10 disabled:opacity-30 hover:border-primary/50 transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-muted-foreground">No upcoming events available.</p>
          )}
        </div>

        {/* Past Events */}
        <div>
          <h3 className="text-2xl font-bold mb-8 gradient-text">Past Events</h3>
          {pastLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 justify-items-center">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass-card rounded-2xl p-3 sm:p-4 w-full max-w-[300px] border border-white/10 animate-pulse">
                  <div className="aspect-[3/4] rounded-xl bg-white/5 mb-4" />
                  <div className="h-4 rounded bg-white/10 mb-2 w-3/4" />
                  <div className="h-3 rounded bg-white/5 mb-1 w-full" />
                  <div className="h-3 rounded bg-white/5 w-1/3" />
                </div>
              ))}
            </div>
          ) : pastEvents.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 justify-items-center">
                {pastEvents.map((event) => {
                  const imgs = getImages(event)
                  return (
                    <div 
                      key={event._id} 
                      className="event-card relative glass-card rounded-2xl p-3 sm:p-4 group cursor-pointer opacity-80 hover:opacity-100 w-full max-w-[300px] border border-white/10 hover:-translate-y-1 transition-all duration-300" 
                      onClick={() => {
                        setNavigatingId(event._id)
                        router.push(`/events/${event._id}`)
                      }}
                    >
                      <div className={`relative bg-black/20 rounded-xl overflow-hidden border border-white/10 mb-4 ${eventAspectById[event._id] === "square" ? "aspect-square" : "aspect-[3/4]"}`}>
                        <ImageCarousel images={imgs} alt={event.title} className="absolute inset-0" />
                        <div className="absolute top-2 right-2 bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs z-20">Completed</div>
                      </div>
                      <h4 className="text-base font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2 min-h-[48px]">{event.title}</h4>
                      <Markdown content={event.description || ""} className="text-xs mb-3 min-h-[36px] max-h-[56px] overflow-hidden [mask-image:linear-gradient(to_bottom,black_75%,transparent)]" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground"><span>{new Date(event.date).toLocaleDateString("en-US")}</span></div>
                      {navigatingId === event._id && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-2xl">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              {/* Past events pagination */}
              {pastTotalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <button
                    onClick={() => setPastPage((p) => Math.max(1, p - 1))}
                    disabled={pastPage === 1}
                    className="p-2 rounded-lg glass-card border border-white/10 disabled:opacity-30 hover:border-primary/50 transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Page {pastPage} of {pastTotalPages}
                  </span>
                  <button
                    onClick={() => setPastPage((p) => Math.min(pastTotalPages, p + 1))}
                    disabled={pastPage === pastTotalPages}
                    className="p-2 rounded-lg glass-card border border-white/10 disabled:opacity-30 hover:border-primary/50 transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-muted-foreground">No past events available.</p>
          )}
        </div>
      </div>

    </section>
  )
}
