"use client"

import { useEffect, useState } from "react"

const ACCENT_CYCLE = ["#38bdf8", "#34d399", "#a78bfa", "#fb7185"]

interface PageHeroProps {
  title: string
  highlight: string
  subtitle?: string
  badge?: string
}

export function PageHero({ title, highlight, subtitle, badge }: PageHeroProps) {
  const [accentIndex, setAccentIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setAccentIndex((i) => (i + 1) % ACCENT_CYCLE.length), 4000)
    return () => clearInterval(id)
  }, [])

  const accent = ACCENT_CYCLE[accentIndex]

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: "220px" }}>
      {/* Dark base gradient */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, #0b1220 0%, #111827 100%)" }}
      />
      {/* Accent mesh glow */}
      <div
        className="absolute inset-0 transition-all duration-[1500ms]"
        style={{
          background: `
            radial-gradient(ellipse 60% 80% at 20% 50%, ${accent}18, transparent),
            radial-gradient(ellipse 50% 60% at 85% 30%, ${accent}10, transparent)
          `,
        }}
      />
      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(${accent}80 1px, transparent 1px),
            linear-gradient(90deg, ${accent}80 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
      {/* Floating orbs */}
      <div
        className="absolute -top-24 -left-24 size-64 rounded-full blur-[100px] opacity-20 transition-all duration-[1500ms]"
        style={{ background: accent }}
      />
      <div
        className="absolute -bottom-16 -right-16 size-48 rounded-full blur-[80px] opacity-10 transition-all duration-[1500ms]"
        style={{ background: accent }}
      />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-center justify-center px-4 py-20 text-center"
        style={{ minHeight: "220px" }}
      >
        {badge && (
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-5 border"
            style={{ color: accent, borderColor: `${accent}40`, background: `${accent}12` }}
          >
            <span
              className="size-1.5 rounded-full"
              style={{ background: accent, boxShadow: `0 0 6px ${accent}` }}
            />
            {badge}
          </div>
        )}

        <h1 className="text-4xl md:text-6xl font-black uppercase leading-tight text-white/90 mb-4">
          {title}{" "}
          <span
            className="transition-colors duration-[1500ms]"
            style={{ color: accent, textShadow: `0 0 40px ${accent}60` }}
          >
            {highlight}
          </span>
        </h1>

        {subtitle && (
          <p className="text-base md:text-lg text-white/50 max-w-2xl font-medium leading-relaxed">
            {subtitle}
          </p>
        )}

        <div
          className="mt-6 h-px w-24 rounded-full transition-all duration-[1500ms]"
          style={{ background: `linear-gradient(to right, transparent, ${accent}, transparent)` }}
        />
      </div>
    </div>
  )
}

