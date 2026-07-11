"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Loader2, UserPlus, ArrowLeft, Check } from "lucide-react"
import { toast } from "sonner"

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") || "/"

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const passwordsMatch = password && confirmPassword && password === confirmPassword
  const passwordLong = password.length >= 6

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Registration failed")
        return
      }
      toast.success(`Welcome to CoDE Club, ${data.user.username}! 🎉`)
      router.push(next)
      router.refresh()
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-dvh w-full flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #020817 0%, #0f172a 40%, #1e1b4b 100%)" }}
    >
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #34d399, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(52,211,153,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Back button */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:gap-3 group"
        style={{ color: "rgba(148,163,184,0.7)" }}
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-200" />
        Back to site
      </Link>

      {/* Card */}
      <div
        className={`relative w-full max-w-md transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        style={{
          background: "rgba(15,23,42,0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(52,211,153,0.12)",
          borderRadius: "24px",
          boxShadow: "0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(52,211,153,0.06), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Card inner glow */}
        <div
          className="absolute inset-0 rounded-[24px] pointer-events-none opacity-40"
          style={{ background: "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(52,211,153,0.08), transparent)" }}
        />

        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center relative">
          <div className="flex justify-center mb-5">
            <div
              className="relative w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center"
              style={{
                background: "rgba(52,211,153,0.1)",
                border: "1px solid rgba(52,211,153,0.25)",
                boxShadow: "0 0 32px rgba(52,211,153,0.2)",
              }}
            >
              <Image src="/codeclub1.png" alt="CoDE Club" fill sizes="64px" className="object-contain p-2" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mb-1">Join CoDE Club</h1>
          <p className="text-sm" style={{ color: "rgba(148,163,184,0.7)" }}>
            Create your free account in seconds
          </p>
        </div>

        {/* Divider */}
        <div className="mx-8 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(52,211,153,0.2), transparent)" }} />

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(148,163,184,0.7)" }}>
              Username
            </label>
            <input
              id="signup-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_handle"
              required
              autoComplete="username"
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all duration-200 focus:ring-2"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(52,211,153,0.5)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(148,163,184,0.7)" }}>
              Email address
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all duration-200 focus:ring-2"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(52,211,153,0.5)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(148,163,184,0.7)" }}>
              Password
            </label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                autoComplete="new-password"
                className="w-full px-4 py-3 pr-12 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all duration-200 focus:ring-2"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(52,211,153,0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 transition-colors" style={{ color: "rgba(100,116,139,0.8)" }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Strength hint */}
            {password && (
              <div className="flex items-center gap-2 text-xs" style={{ color: passwordLong ? "rgba(52,211,153,0.9)" : "rgba(251,113,133,0.9)" }}>
                <Check size={12} />
                {passwordLong ? "Good length" : "Too short — min 6 characters"}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(148,163,184,0.7)" }}>
              Confirm password
            </label>
            <div className="relative">
              <input
                id="signup-confirm-password"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                required
                autoComplete="new-password"
                className="w-full px-4 py-3 pr-12 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all duration-200 focus:ring-2"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${confirmPassword ? (passwordsMatch ? "rgba(52,211,153,0.4)" : "rgba(251,113,133,0.4)") : "rgba(255,255,255,0.08)"}`,
                }}
                onFocus={(e) => !confirmPassword && (e.target.style.borderColor = "rgba(52,211,153,0.5)")}
                onBlur={(e) => !confirmPassword && (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 transition-colors" style={{ color: "rgba(100,116,139,0.8)" }}>
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirmPassword && (
              <div className="flex items-center gap-2 text-xs" style={{ color: passwordsMatch ? "rgba(52,211,153,0.9)" : "rgba(251,113,133,0.9)" }}>
                <Check size={12} />
                {passwordsMatch ? "Passwords match" : "Passwords don't match"}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            id="signup-submit"
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            style={{
              background: "linear-gradient(135deg, #10b981, #6366f1)",
              boxShadow: "0 8px 24px rgba(16,185,129,0.3)",
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        {/* Footer */}
        <div className="px-8 pb-8 text-center">
          <div className="h-px mb-5 mx-4" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)" }} />
          <p className="text-sm" style={{ color: "rgba(100,116,139,0.9)" }}>
            Already have an account?{" "}
            <Link
              href={`/login${next !== "/" ? `?next=${next}` : ""}`}
              className="font-bold transition-colors hover:underline"
              style={{ color: "#34d399" }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px rgba(15,23,42,0.95) inset;
          -webkit-text-fill-color: #fff;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
