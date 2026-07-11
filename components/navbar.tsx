"use client"

import { useState, useEffect, useRef } from "react"
import gsap from "gsap"
import { Menu, X, Shield, Sun, Moon, LogOut, UserCircle2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { toast } from "sonner"

// Accent colours cycling with the hero (sky → emerald → violet → rose)
const ACCENT_CYCLE = ["#38bdf8", "#34d399", "#a78bfa", "#fb7185"]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [accentIndex, setAccentIndex] = useState(0)
  const [isDark, setIsDark] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const navRef = useRef<HTMLElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const { user, loading: userLoading, logout } = useUser()

  // Persist + apply saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem("theme") ?? "dark"
    const dark = saved === "dark"
    setIsDark(dark)
    document.documentElement.classList.toggle("dark", dark)
  }, [])

  // Scroll shrink
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Cycle accent colour every 4 s
  useEffect(() => {
    const id = setInterval(() => setAccentIndex((i) => (i + 1) % ACCENT_CYCLE.length), 4000)
    return () => clearInterval(id)
  }, [])

  // GSAP entrance slide-down
  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(navRef.current, { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" })
    }
  }, [])

  // Mobile menu GSAP open/close
  useEffect(() => {
    if (!mobileMenuRef.current) return
    if (isOpen) {
      gsap.fromTo(
        mobileMenuRef.current,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.35, ease: "power2.out" }
      )
    } else {
      gsap.to(mobileMenuRef.current, { height: 0, opacity: 0, duration: 0.25, ease: "power2.in" })
    }
  }, [isOpen])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    localStorage.setItem("theme", next ? "dark" : "light")
    document.documentElement.classList.toggle("dark", next)
  }

  const handleLogout = async () => {
    await logout()
    toast.success("Signed out successfully")
    router.push("/")
    router.refresh()
  }

  const accent = ACCENT_CYCLE[accentIndex]

  // Glass pill adapts to theme
  const glassBg = isDark
    ? "rgba(8, 12, 24, 0.80)"
    : "rgba(255, 255, 255, 0.80)"
  const linkColor = isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.50)"
  const linkHoverColor = isDark ? "#ffffff" : "#000000"
  const shadowColor = isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.12)"

  const navItems = [
    { name: "About", href: "/about" },
    { name: "Members", href: "/members" },
    { name: "Events", href: "/events" },
    { name: "Quiz", href: "/quiz" },
    { name: "Contact", href: "/contact" },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <nav
      ref={navRef}
      className={`fixed top-3 z-50 transition-all duration-500 ${
        scrolled
          ? "left-4 right-4 md:left-16 md:right-16"
          : "left-4 right-4 md:left-10 md:right-10"
      }`}
    >
      {/* ── Glass pill ─────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl px-4 py-3 md:px-6"
        style={{
          background: glassBg,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${accent}28`,
          boxShadow: `0 4px 32px ${shadowColor}, 0 0 0 1px ${accent}10, inset 0 1px 0 rgba(255,255,255,${isDark ? "0.05" : "0.6"})`,
          transition: "background 0.6s ease, border-color 1s ease, box-shadow 1s ease",
        }}
      >
        <div className="flex items-center justify-between">

          {/* ── Logo ──────────────────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="relative size-9 rounded-xl overflow-hidden border shrink-0 transition-transform duration-300 group-hover:scale-110"
              style={{
                borderColor: `${accent}40`,
                boxShadow: `0 0 16px ${accent}30`,
                background: `${accent}15`,
              }}
            >
              <Image
                src="/codeclub1.png"
                alt="CoDE Club"
                fill
                sizes="36px"
                className="object-contain p-1"
                style={{ filter: `drop-shadow(0 0 6px ${accent}80)` }}
              />
            </div>
            <span
              className="text-base font-black uppercase tracking-widest transition-all duration-700"
              style={{ color: accent, textShadow: `0 0 20px ${accent}60` }}
            >
              CoDE
            </span>
          </Link>

          {/* ── Desktop nav links ──────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative px-4 py-1.5 text-sm font-medium rounded-lg group transition-colors duration-200"
                style={{ color: isActive(item.href) ? accent : linkColor }}
              >
                {/* Hover bg tint */}
                <span
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: `${accent}14` }}
                />
                {/* Active dot */}
                {isActive(item.href) && (
                  <span
                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 size-1 rounded-full"
                    style={{ background: accent, boxShadow: `0 0 6px ${accent}` }}
                  />
                )}
                {/* Hover underline */}
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-0 group-hover:w-3/4 transition-all duration-300 rounded-full"
                  style={{ background: accent }}
                />
                <span
                  className="relative z-10 transition-colors duration-200"
                  style={{ color: isActive(item.href) ? accent : undefined }}
                >
                  {item.name}
                </span>
              </Link>
            ))}
          </div>

          {/* ── Desktop right actions ──────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border transition-all duration-300 hover:scale-105"
              style={{
                color: accent,
                borderColor: `${accent}30`,
                background: `${accent}10`,
                boxShadow: `0 0 12px ${accent}15`,
              }}
              aria-label="Toggle theme"
            >
              {isDark
                ? <Sun size={15} />
                : <Moon size={15} />
              }
            </button>

            {/* Auth actions */}
            {!userLoading && (
              user ? (
                <div className="flex items-center gap-2">
                  {/* User avatar — links to profile */}
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300 hover:scale-105"
                    style={{
                      color: accent,
                      borderColor: `${accent}30`,
                      background: `${accent}10`,
                    }}
                  >
                    <UserCircle2 size={14} />
                    <span className="max-w-[80px] truncate">{user.fullName || user.username}</span>
                  </Link>
                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all duration-300 hover:scale-105"
                    style={{
                      color: "#fb7185",
                      borderColor: "rgba(251,113,133,0.3)",
                      background: "rgba(251,113,133,0.08)",
                    }}
                    aria-label="Sign out"
                  >
                    <LogOut size={13} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all duration-300 hover:scale-105"
                    style={{
                      color: accent,
                      borderColor: `${accent}30`,
                      background: `${accent}08`,
                    }}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest text-white transition-all duration-300 hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                      boxShadow: `0 4px 12px ${accent}30`,
                    }}
                  >
                    Sign Up
                  </Link>
                </div>
              )
            )}

            {/* Admin */}
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all duration-300 hover:scale-105"
              style={{
                color: accent,
                borderColor: `${accent}40`,
                background: `${accent}10`,
                boxShadow: `0 0 16px ${accent}20`,
              }}
            >
              <Shield size={13} />
              Admin
            </Link>
          </div>

          {/* ── Mobile: theme toggle + hamburger ─────────────────────── */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border transition-colors duration-200"
              style={{
                color: accent,
                borderColor: `${accent}30`,
                background: `${accent}10`,
              }}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              className="p-2 rounded-lg border transition-colors duration-200"
              style={{
                color: accent,
                borderColor: `${accent}30`,
                background: `${accent}10`,
              }}
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* ── Mobile menu (GSAP animated) ──────────────────────────────── */}
        <div ref={mobileMenuRef} className="overflow-hidden" style={{ height: 0, opacity: 0 }}>
          <div
            className="mt-3 pt-3 border-t flex flex-col gap-1"
            style={{ borderColor: `${accent}20` }}
          >
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  color: isActive(item.href) ? accent : linkColor,
                  background: isActive(item.href) ? `${accent}15` : "transparent",
                }}
              >
                {isActive(item.href) && (
                  <span
                    className="size-1.5 rounded-full shrink-0"
                    style={{ background: accent, boxShadow: `0 0 6px ${accent}` }}
                  />
                )}
                {item.name}
              </Link>
            ))}

            {/* Mobile theme row */}
            <div
              className="flex items-center justify-between px-3 py-2.5 rounded-xl mt-1 border"
              style={{ borderColor: `${accent}20`, background: `${accent}08` }}
            >
              <span className="text-sm font-medium" style={{ color: linkColor }}>
                {isDark ? "Dark mode" : "Light mode"}
              </span>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all duration-200"
                style={{ color: accent, borderColor: `${accent}40`, background: `${accent}15` }}
              >
                {isDark ? <Sun size={13} /> : <Moon size={13} />}
                {isDark ? "Light" : "Dark"}
              </button>
            </div>

            {/* Mobile auth */}
            {!userLoading && (
              user ? (
                <div className="flex flex-col gap-1">
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200"
                    style={{ borderColor: `${accent}20`, background: `${accent}08`, color: accent }}
                  >
                    <UserCircle2 size={16} />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate font-bold">{user.fullName || user.username}</span>
                      {user.fullName && <span className="text-xs opacity-60 truncate">@{user.username}</span>}
                    </div>
                  </Link>
                  <button
                    onClick={() => { setIsOpen(false); handleLogout() }}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200"
                    style={{ color: "#fb7185", borderColor: "rgba(251,113,133,0.3)", background: "rgba(251,113,133,0.08)" }}
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200"
                    style={{ color: accent, borderColor: `${accent}30`, background: `${accent}08` }}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200"
                    style={{
                      background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                      boxShadow: `0 4px 12px ${accent}30`,
                    }}
                  >
                    Sign Up
                  </Link>
                </div>
              )
            )}

            {/* Mobile admin */}
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200"
              style={{
                color: accent,
                borderColor: `${accent}40`,
                background: `${accent}10`,
              }}
            >
              <Shield size={14} />
              Admin Panel
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

