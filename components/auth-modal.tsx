"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  /** Message displayed above the form to explain why login is needed */
  reason?: string
}

export function AuthModal({ open, onOpenChange, onSuccess, reason }: AuthModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
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
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl">
        {/* Gradient header */}
        <div
          className="relative px-6 pt-8 pb-6"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
          }}
        >
          {/* Glow orb */}
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle, #38bdf8, transparent 70%)", transform: "translate(30%, -30%)" }}
          />
          <div className="flex items-center gap-3 mb-1">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-xl"
              style={{ background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.3)" }}
            >
              <LogIn size={18} style={{ color: "#38bdf8" }} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-white tracking-tight">Sign in required</DialogTitle>
            </DialogHeader>
          </div>
          {reason && (
            <p className="text-sm mt-2" style={{ color: "rgba(148,163,184,0.9)" }}>
              {reason}
            </p>
          )}
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-5 space-y-4"
          style={{ background: "rgba(15,23,42,0.98)" }}
        >
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(148,163,184,0.8)" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all duration-200 focus:ring-2"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                // @ts-expect-error CSS variable
                "--tw-ring-color": "rgba(56,189,248,0.4)",
              }}
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(148,163,184,0.8)" }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 pr-11 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all duration-200 focus:ring-2"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  // @ts-expect-error CSS variable
                  "--tw-ring-color": "rgba(56,189,248,0.4)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
              boxShadow: "0 8px 24px rgba(14,165,233,0.3)",
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
            {loading ? "Signing in…" : "Sign In"}
          </button>

          {/* Footer */}
          <p className="text-center text-xs" style={{ color: "rgba(100,116,139,0.9)" }}>
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold transition-colors hover:underline"
              style={{ color: "#38bdf8" }}
              onClick={() => onOpenChange(false)}
            >
              Sign up for free
            </Link>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
