"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Eye, EyeOff, Loader2, LogIn, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") || "/"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Login failed")
        return
      }
      toast.success(`Welcome back, ${data.user.username}!`)
      window.dispatchEvent(new Event("auth-change"))
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
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #38bdf8, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.03]"
          style={{ background: "conic-gradient(from 0deg, #38bdf8, #6366f1, #34d399, #38bdf8)" }}
        />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(56,189,248,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.5) 1px, transparent 1px)",
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
          border: "1px solid rgba(56,189,248,0.12)",
          borderRadius: "24px",
          boxShadow: "0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(56,189,248,0.06), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Card inner glow */}
        <div
          className="absolute inset-0 rounded-[24px] pointer-events-none opacity-40"
          style={{ background: "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(56,189,248,0.08), transparent)" }}
        />

        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center relative">
          <div className="flex justify-center mb-5">
            <div
              className="relative w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center"
              style={{
                background: "rgba(56,189,248,0.1)",
                border: "1px solid rgba(56,189,248,0.25)",
                boxShadow: "0 0 32px rgba(56,189,248,0.2)",
              }}
            >
              <Image src="/codeclub1.png" alt="CoDE Club" fill sizes="64px" className="object-contain p-2" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mb-1">Welcome back</h1>
          <p className="text-sm" style={{ color: "rgba(148,163,184,0.7)" }}>
            Sign in to your CoDE Club account
          </p>
        </div>

        {/* Divider */}
        <div className="mx-8 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(56,189,248,0.2), transparent)" }} />

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(148,163,184,0.7)" }}>
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all duration-200 focus:ring-2"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(56,189,248,0.5)")}
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
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-12 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all duration-200 focus:ring-2"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(56,189,248,0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors duration-200"
                style={{ color: "rgba(100,116,139,0.8)" }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            style={{
              background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
              boxShadow: "0 8px 24px rgba(14,165,233,0.3)",
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <div className="px-8 pb-8 text-center">
          <div className="h-px mb-5 mx-4" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)" }} />
          <p className="text-sm" style={{ color: "rgba(100,116,139,0.9)" }}>
            Don&apos;t have an account?{" "}
            <Link
              href={`/signup${next !== "/" ? `?next=${next}` : ""}`}
              className="font-bold transition-colors hover:underline"
              style={{ color: "#38bdf8" }}
            >
              Create one for free
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

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
