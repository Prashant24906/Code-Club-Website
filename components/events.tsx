"use client"

import { useRef, useState, useEffect } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Calendar, MapPin, Clock } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Markdown } from "@/components/ui/markdown"

gsap.registerPlugin(ScrollTrigger)

type Event = {
  _id: string
  image?: string
  title: string
  date: string
  description?: string
  location?: string
  googleFormLink?: string
  time?: string
}

export function Events() {
  const [eventsEnabled, setEventsEnabled] = useState(true)
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [eventAspectById, setEventAspectById] = useState<Record<string, "square" | "portrait">>({})
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    try {
      const adminSettings = localStorage.getItem("codeClubAdminSettings")
      if (adminSettings) {
        const parsed = JSON.parse(adminSettings)
        setEventsEnabled(parsed.eventsEnabled ?? true)
      }
    } catch {}
  }, [])

  useEffect(() => {
    fetch("/api/events").then((r) => r.json()).then(setEvents).catch(console.error)
  }, [])

  useEffect(() => {
    let cancelled = false
    const entries = events.filter((e) => e._id && e.image).map((e) => ({ id: e._id, src: e.image! }))
    if (!entries.length) return
    Promise.all(entries.map(({ id, src }) => new Promise<{ id: string; aspect: "square" | "portrait" }>((resolve) => {
      const img = new Image()
      img.onload = () => { const ratio = img.naturalWidth / img.naturalHeight; resolve({ id, aspect: ratio > 0.95 && ratio < 1.05 ? "square" : "portrait" }) }
      img.onerror = () => resolve({ id, aspect: "portrait" })
      img.src = src
    }))).then((resolved) => {
      if (cancelled) return
      const next: Record<string, "square" | "portrait"> = {}
      resolved.forEach(({ id, aspect }) => { next[id] = aspect })
      setEventAspectById(next)
    })
    return () => { cancelled = true }
  }, [events])

  useEffect(() => {
    if (!events.length) return
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
  }, [events])

  const now = new Date()
  const isUpcomingEvent = (e: Event) => new Date(e.date) >= now
  const upcomingEvents = events.filter(isUpcomingEvent)
  const pastEvents = events.filter((e) => !isUpcomingEvent(e))

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
        <div className="events-heading text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Our <span className="gradient-text">Events</span></h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">Join us for workshops, hackathons, tech talks, and networking events</p>
        </div>

        {/* Upcoming Events */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold mb-8 gradient-text">Upcoming Events</h3>
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 justify-items-center">
              {upcomingEvents.map((event) => (
                <div key={event._id} className="event-card glass-card rounded-2xl p-3 sm:p-4 group cursor-pointer w-full max-w-[320px] border border-white/10 hover:-translate-y-1 transition-transform duration-300" onClick={() => setSelectedEvent(event)}>
                  <div className="relative bg-black/20 rounded-xl overflow-hidden border border-white/10 mb-4">
                    <img src={event.image || "/placeholder.svg"} alt={event.title} className={`w-full object-contain p-2 group-hover:scale-[1.02] transition-transform duration-300 ${eventAspectById[event._id] === "square" ? "aspect-square" : "aspect-[3/4]"}`} />
                    <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">Upcoming</div>
                  </div>
                  <h4 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2 min-h-[56px]">{event.title}</h4>
                  <Markdown content={event.description || ""} className="mb-4 text-sm min-h-[60px] max-h-[72px] overflow-hidden [mask-image:linear-gradient(to_bottom,black_75%,transparent)]" />
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center space-x-2"><Calendar className="h-4 w-4" style={{ color: "var(--accent-blue)" }} /><span>{new Date(event.date).toLocaleDateString("en-US")}</span></div>
                    {event.time && <div className="flex items-center space-x-2"><Clock className="h-4 w-4" style={{ color: "var(--accent-blue)" }} /><span>{event.time}</span></div>}
                    {event.location && <div className="flex items-center space-x-2"><MapPin className="h-4 w-4" style={{ color: "var(--accent-blue)" }} /><span className="truncate">{event.location}</span></div>}
                  </div>
                  {event.googleFormLink && (
                    <a href={event.googleFormLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex w-full justify-center bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-transform hover:scale-[1.02]">Register</a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No upcoming events available.</p>
          )}
        </div>

        {/* Past Events */}
        <div>
          <h3 className="text-2xl font-bold mb-8 gradient-text">Past Events</h3>
          {pastEvents.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 justify-items-center">
              {pastEvents.map((event) => (
                <div key={event._id} className="event-card glass-card rounded-2xl p-3 sm:p-4 group cursor-pointer opacity-80 hover:opacity-100 transition-opacity w-full max-w-[300px] border border-white/10 hover:-translate-y-1 transition-transform duration-300" onClick={() => setSelectedEvent(event)}>
                  <div className="relative bg-black/20 rounded-xl overflow-hidden border border-white/10 mb-4">
                    <img src={event.image || "/placeholder.svg"} alt={event.title} className={`w-full object-contain p-2 group-hover:scale-[1.02] transition-transform duration-300 ${eventAspectById[event._id] === "square" ? "aspect-square" : "aspect-[3/4]"}`} />
                    <div className="absolute top-2 right-2 bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs">Completed</div>
                  </div>
                  <h4 className="text-base font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2 min-h-[48px]">{event.title}</h4>
                  <Markdown content={event.description || ""} className="text-xs mb-3 min-h-[36px] max-h-[56px] overflow-hidden [mask-image:linear-gradient(to_bottom,black_75%,transparent)]" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground"><span>{new Date(event.date).toLocaleDateString("en-US")}</span></div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No past events available.</p>
          )}
        </div>
      </div>

      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="w-[calc(100%-1rem)] sm:max-w-4xl p-4 md:p-6 bg-background border border-border shadow-2xl max-h-[88vh] overflow-y-auto">
          {selectedEvent && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-[44%_56%] gap-5 md:gap-6 items-start">
                <div className="rounded-xl border border-white/10 bg-black/20 overflow-hidden">
                  <img src={selectedEvent.image || "/placeholder.svg"} alt={selectedEvent.title} className={`w-full object-contain p-2 ${eventAspectById[selectedEvent._id] === "square" ? "aspect-square" : "aspect-[3/4]"} max-h-[42vh]`} />
                </div>
                <div className="space-y-4">
                  <DialogHeader>
                    <DialogTitle className="text-xl md:text-2xl leading-tight pr-8">{selectedEvent.title}</DialogTitle>
                  </DialogHeader>
                  <Markdown content={selectedEvent.description || "No description provided."} className="text-sm leading-relaxed text-muted-foreground" />
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" style={{ color: "var(--accent-blue)" }} /><span>{new Date(selectedEvent.date).toLocaleDateString("en-US")}</span></div>
                    {selectedEvent.time && <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" style={{ color: "var(--accent-blue)" }} /><span>{selectedEvent.time}</span></div>}
                    {selectedEvent.location && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" style={{ color: "var(--accent-blue)" }} /><span>{selectedEvent.location}</span></div>}
                  </div>
                  {selectedEvent.googleFormLink && isUpcomingEvent(selectedEvent) && (
                    <a href={selectedEvent.googleFormLink} target="_blank" rel="noopener noreferrer" className="inline-flex w-full md:w-auto justify-center bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-transform hover:scale-[1.02]">Register</a>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
