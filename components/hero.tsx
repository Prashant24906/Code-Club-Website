"use client"

import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Code, Users, Zap, ArrowRight } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

// ─── Mini Panel Preview (mirrors VideoPreview 3D tilt) ───────────────────────

interface PanelPreviewProps {
  children: React.ReactNode
}

function PanelPreview({ children }: PanelPreviewProps) {
  const [isHovering, setIsHovering] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = ({ clientX, clientY, currentTarget }: React.MouseEvent<HTMLElement>) => {
    const rect = currentTarget.getBoundingClientRect()
    const xOffset = clientX - (rect.left + rect.width / 2)
    const yOffset = clientY - (rect.top + rect.height / 2)

    if (isHovering) {
      gsap.to(sectionRef.current, {
        x: xOffset * 0.3,
        y: yOffset * 0.3,
        rotationY: xOffset / 6,
        rotationX: -yOffset / 6,
        transformPerspective: 600,
        duration: 0.8,
        ease: "power1.out",
      })
      gsap.to(contentRef.current, {
        x: -xOffset * 0.15,
        y: -yOffset * 0.15,
        duration: 0.8,
        ease: "power1.out",
      })
    }
  }

  useEffect(() => {
    if (!isHovering) {
      gsap.to(sectionRef.current, { x: 0, y: 0, rotationY: 0, rotationX: 0, duration: 0.8, ease: "power1.out" })
      gsap.to(contentRef.current, { x: 0, y: 0, duration: 0.8, ease: "power1.out" })
    }
  }, [isHovering])

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="absolute z-50 size-full overflow-hidden rounded-xl"
      style={{ perspective: "600px" }}
    >
      <div ref={contentRef} className="origin-center rounded-xl" style={{ transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </section>
  )
}

// ─── Slide data ───────────────────────────────────────────────────────────────

const slides = [
  {
    bg: "from-indigo-950 via-blue-950 to-slate-950",
    accent: "#38bdf8",
    glow: "rgba(56,189,248,0.15)",
    icon: Code,
    title: "Code",
    sub: "Build the Future",
    desc: `A Club for The Students 
    by the students and to the students`,
  },
  {
    bg: "from-emerald-950 via-teal-950 to-slate-950",
    accent: "#34d399",
    glow: "rgba(52,211,153,0.15)",
    icon: Users,
    title: "Collaborate",
    sub: "Build Together",
    desc: "Team up and ship projects that matter",
  },
  {
    bg: "from-violet-950 via-purple-950 to-slate-950",
    accent: "#a78bfa",
    glow: "rgba(167,139,250,0.15)",
    icon: Zap,
    title: "Innovate",
    sub: "Push the Limits",
    desc: "Turn ideas into impactful technology",
  },
  {
    bg: "from-rose-950 via-pink-950 to-slate-950",
    accent: "#fb7185",
    glow: "rgba(251,113,133,0.15)",
    icon: ArrowRight,
    title: "Grow",
    sub: "Level Up Daily",
    desc: "Learn from peers, mentors & hackathons",
  },
]

// ─── Hero ─────────────────────────────────────────────────────────────────────

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasClicked, setHasClicked] = useState(false)
  const [loading, setLoading] = useState(true)

  const nextPanelRef = useRef<HTMLDivElement>(null)

  // Simulate load gate (mirrors the video-loading wait)
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    document.body.style.overflow = loading ? "hidden" : ""
  }, [loading])

  const handleMiniPanelClick = () => {
    setHasClicked(true)
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }

  const nextIndex = (currentIndex + 1) % slides.length
  const current = slides[currentIndex]
  const next = slides[nextIndex]

  // ── Mini panel expands to full (mirrors "next-video" scale animation) ────
  useGSAP(
    () => {
      if (hasClicked) {
        gsap.set("#next-panel", { visibility: "visible" })
        gsap.to("#next-panel", {
          transformOrigin: "center center",
          scale: 1,
          width: "100%",
          height: "100%",
          duration: 1,
          ease: "power1.inOut",
        })
        gsap.from("#current-panel", {
          transformOrigin: "center center",
          scale: 0,
          duration: 1.5,
          ease: "power1.inOut",
        })
      }
    },
    { dependencies: [currentIndex], revertOnUpdate: true }
  )

  // ── ScrollTrigger clip-path polygon morph ─────────────────────────────────
  useGSAP(() => {
    gsap.set("#hero-frame", {
      clipPath: "polygon(14% 0, 72% 0, 88% 90%, 0 95%)",
      borderRadius: "0% 0% 40% 10%",
    })
    gsap.from("#hero-frame", {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      borderRadius: "0% 0% 0% 0%",
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: "#hero-frame",
        start: "center center",
        end: "bottom center",
        scrub: true,
      },
    })
  })

  const NextIcon = next.icon
  const CurrentIcon = current.icon

  return (
    <div className="relative h-dvh w-screen overflow-x-hidden">

      {/* ── Loading overlay ────────────────────────────────────────────── */}
      {loading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950">
          <div className="flex flex-col items-center gap-5">
            <div className="flex items-center gap-3">
              {[0, 0.2, 0.4].map((delay, i) => (
                <span
                  key={i}
                  className="block size-4 rounded-full bg-sky-400"
                  style={{ animation: `heroPulseDot 1.2s ease-in-out ${delay}s infinite` }}
                />
              ))}
            </div>
            <Image src="/codeclub1.png" alt="CoDE Club" width={56} height={56} className="rounded-xl opacity-80" />
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-sky-400 animate-pulse">
              Initializing CoDE Club
            </p>
          </div>
        </div>
      )}

      {/* ── Main hero frame (clip-path morphs on scroll) ──────────────── */}
      <div
        id="hero-frame"
        className="relative z-10 h-dvh w-screen overflow-hidden rounded-lg bg-slate-950"
      >
        {/* Current background panel */}
        <div id="current-panel" className={`absolute inset-0 bg-gradient-to-br ${current.bg}`}>
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background: `radial-gradient(ellipse 70% 60% at 30% 40%, ${current.glow}, transparent),
                           radial-gradient(ellipse 50% 70% at 80% 70%, ${current.glow}, transparent)`,
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(${current.accent}40 1px, transparent 1px),
                                linear-gradient(90deg, ${current.accent}40 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
          <div
            className="absolute -top-32 -left-32 size-[500px] rounded-full blur-[120px] opacity-20"
            style={{ background: current.accent }}
          />
          <div
            className="absolute -bottom-32 -right-32 size-[400px] rounded-full blur-[100px] opacity-15"
            style={{ background: current.accent }}
          />
        </div>

        {/* Next panel — invisible until click, expands to fill ─────────── */}
        <div
          id="next-panel"
          ref={nextPanelRef}
          className={`invisible absolute-center absolute z-20 size-40 sm:size-64 bg-gradient-to-br ${next.bg} rounded-xl overflow-hidden`}
        >
          <div
            className="absolute inset-0 opacity-60"
            style={{ background: `radial-gradient(ellipse 70% 60% at 30% 40%, ${next.glow}, transparent)` }}
          />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(${next.accent}40 1px, transparent 1px),
                                linear-gradient(90deg, ${next.accent}40 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
          <div
            className="absolute -top-16 -left-16 size-[200px] rounded-full blur-[60px] opacity-25"
            style={{ background: next.accent }}
          />
        </div>

        {/* ── Pulse rings around mini panel ─────────────────────────────── */}
        <div className="absolute-center absolute z-40 size-40 sm:size-64 pointer-events-none">
          <div
            className="absolute inset-0 rounded-xl border opacity-30"
            style={{
              borderColor: current.accent,
              animation: "heroPulseRing 2s ease-in-out infinite",
            }}
          />
          <div
            className="absolute -inset-2 rounded-xl border opacity-10"
            style={{
              borderColor: current.accent,
              animation: "heroPulseRing 2s ease-in-out 0.5s infinite",
            }}
          />
          <p
            className="hidden sm:block absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-widest opacity-50"
            style={{
              color: current.accent,
              animation: "heroFadeUpHint 3s ease-in-out infinite",
            }}
          >
            Click to switch
          </p>
        </div>

        {/* ── Clickable mini panel with 3D tilt (PanelPreview) ─────────── */}
        <div className="mask-clip-path absolute-center absolute z-50 size-40 sm:size-64 cursor-pointer overflow-hidden rounded-xl">
          <PanelPreview>
            <div
              onClick={handleMiniPanelClick}
              className={`origin-center scale-50 opacity-0 transition-all duration-500 ease-in hover:scale-100 hover:opacity-100 size-40 sm:size-64 bg-gradient-to-br ${next.bg} rounded-xl flex flex-col items-center justify-center gap-2 border relative overflow-hidden`}
              style={{ borderColor: `${next.accent}40` }}
            >
              {/* Glow ring behind image */}
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  background: `radial-gradient(circle at 50% 45%, ${next.accent}30, transparent 70%)`,
                }}
              />
              {/* CoDE Club logo image */}
              <div
                className="relative size-20 sm:size-28 rounded-xl overflow-hidden border"
                style={{
                  borderColor: `${next.accent}30`,
                  boxShadow: `0 0 32px ${next.accent}40`,
                }}
              >
                <Image
                  src="/codeclub1.png"
                  alt="CoDE Club"
                  fill
                  sizes="(max-width: 640px) 80px, 112px"
                  className="object-contain p-2"
                  style={{ filter: `drop-shadow(0 0 10px ${next.accent}80)` }}
                />
              </div>
              <p className="relative text-xs font-bold tracking-widest uppercase z-10" style={{ color: next.accent }}>
                {next.title}
              </p>
            </div>
          </PanelPreview>
        </div>

        {/* ── Bottom-right heading ──────────────────────────────────────── */}
        <h1
          className="absolute bottom-5 right-5 z-40 text-right leading-none font-black uppercase text-2xl sm:text-4xl lg:text-[clamp(2rem,6vw,5rem)] text-white/90"
          style={{ textShadow: `0 0 40px ${current.accent}60` }}
        >
          Build the <span style={{ color: current.accent }}>Future</span>
          <br />
          with <span style={{ color: current.accent }}>CoDE</span>
        </h1>

        {/* ── Top-left branding card ────────────────────────────────────── */}
        <div className="absolute left-0 top-0 z-40 size-full">
          <div className="mt-18 sm:mt-24 px-4 sm:px-10 w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-8 sm:mb-10 w-full sm:w-fit p-0 sm:p-5 md:max-w-4xl font-sans transition-all duration-300 group">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {/* Logo box */}
                <div
                  className="relative w-16 h-16 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center rounded-xl border overflow-hidden transition-transform duration-500 group-hover:scale-105"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    backdropFilter: "blur(12px)",
                    borderColor: "rgba(255,255,255,0.15)",
                    boxShadow: `0 0 32px ${current.accent}20`,
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(135deg, ${current.accent}15, transparent)` }}
                  />
                  <Image
                    src="/codeclub1.png"
                    alt="CoDE Club Logo"
                    fill
                    sizes="(max-width: 640px) 64px, 112px"
                    className="object-contain p-2 sm:p-3"
                    style={{ filter: `drop-shadow(0 0 8px ${current.accent}60)` }}
                  />
                </div>

                {/* Text block */}
                <div className="flex flex-col justify-center py-1">
                  <p
                    className="text-[9px] sm:text-xs font-bold tracking-[0.2em] leading-none mb-1 sm:mb-2 uppercase"
                    style={{ color: `${current.accent}cc` }}
                  >
                    PES Modern College of Engineering
                  </p>
                  <h2 className="text-base sm:text-4xl md:text-5xl font-black text-white leading-tight sm:leading-none mb-1 sm:mb-2 uppercase sm:whitespace-nowrap drop-shadow-md">
                    CoDE Club
                  </h2>
                  <div
                    className="w-full h-px my-2 sm:my-3"
                    style={{
                      background: `linear-gradient(to right, ${current.accent}60, ${current.accent}20, transparent)`,
                    }}
                  />
                  <p className="text-[10px] sm:text-sm md:text-base font-medium text-white/60 leading-tight max-w-2xl">
                    {current.sub} —{" "}
                    <span className="font-serif font-medium text-white/50 italic text-[10px] sm:text-sm tracking-wide leading-relaxed">{current.desc.slice(0, 6)}<br />{current.desc.slice(6,23)}<br />{current.desc.slice(23,45)}<br/>{current.desc.slice(45,68)}</span>
                  </p>
                </div>
              </div>

              {/* Mobile CTA */}
              <a
                href="#events"
                className="sm:hidden mb-4 w-full flex items-center justify-center gap-2 rounded-full py-3 px-6 text-sm font-bold text-white shadow-lg transition-transform active:scale-95"
                style={{
                  background: current.accent,
                  boxShadow: `0 8px 24px ${current.accent}40`,
                }}
              >
                Explore Events <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* ── Slide indicator dots ──────────────────────────────────────── */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2">
          {slides.map((s, i) => (
            <button
              key={i}
              onClick={() => { setHasClicked(true); setCurrentIndex(i) }}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === currentIndex ? "28px" : "8px",
                height: "8px",
                background: i === currentIndex ? current.accent : "rgba(255,255,255,0.25)",
                boxShadow: i === currentIndex ? `0 0 10px ${current.accent}80` : "none",
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Shadow heading below the morphed frame (same trick as mpulse) */}
      <h1 className="hidden md:block absolute bottom-5 right-5 text-black font-black uppercase leading-none text-2xl sm:text-4xl lg:text-[clamp(2rem,6vw,5rem)]">
        Build the Future
        <br />
        with CoDE
      </h1>

      {/* ── Keyframes ────────────────────────────────────────────────────── */}
      <style>{`
        .absolute-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .mask-clip-path {
          clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
        }
        @keyframes heroPulseDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes heroPulseRing {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.08); opacity: 0.6; }
        }
        @keyframes heroFadeUpHint {
          0%, 100% { opacity: 0; transform: translateY(4px) translateX(-50%); }
          50% { opacity: 0.6; transform: translateY(0) translateX(-50%); }
        }
      `}</style>
    </div>
  )
}

export default Hero
