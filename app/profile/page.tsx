"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  User, Mail, GraduationCap, Building2, Users2,
  Save, ArrowLeft, CheckCircle2, Loader2, AlertCircle,
  Pencil
} from "lucide-react"
import { toast } from "sonner"
import { useUser } from "@/hooks/use-user"

// ── Option sets ───────────────────────────────────────────────────────────────
const YEAR_OPTIONS = [
  { value: "FY", label: "FY — First Year" },
  { value: "SY", label: "SY — Second Year" },
  { value: "TY", label: "TY — Third Year" },
  { value: "BE", label: "BE — Final Year" },
  { value: "Passout", label: "Passout / Alumni" },
]

const DEPT_OPTIONS = [
  { value: "IT",    label: "Information Technology" },
  { value: "CS",    label: "Computer Science" },
  { value: "AIDS",  label: "AI & Data Science" },
  { value: "AIML",  label: "AI & Machine Learning" },
  { value: "EXTC",  label: "Electronics & Telecom" },
  { value: "ETRX",  label: "Electronics" },
  { value: "MECH",  label: "Mechanical" },
  { value: "CIVIL", label: "Civil" },
  { value: "OTHER", label: "Other" },
]

const DIV_OPTIONS = ["A", "B", "C", "D"]

// ── Profile completion helper ─────────────────────────────────────────────────
function completionPercent(fields: { fullName: string; year: string; department: string; division: string }) {
  const total = 4
  const filled = [fields.fullName, fields.year, fields.department, fields.division].filter(Boolean).length
  return Math.round((filled / total) * 100)
}

// ── Field wrapper ─────────────────────────────────────────────────────────────
function FieldLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "rgba(148,163,184,0.7)" }}>
      <Icon size={13} style={{ color: "#38bdf8" }} />
      {label}
    </label>
  )
}

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  color: "#fff",
  fontSize: "14px",
  padding: "12px 16px",
  width: "100%",
  outline: "none",
  transition: "border-color 0.2s",
}

const INPUT_FOCUS_COLOR = "rgba(56,189,248,0.5)"

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading, refetch } = useUser()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [year, setYear] = useState("")
  const [department, setDepartment] = useState("")
  const [division, setDivision] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => { setMounted(true) }, [])

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?next=/profile")
    }
  }, [authLoading, user, router])

  // Load profile from API
  useEffect(() => {
    if (!user) return
    fetch("/api/user/profile")
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setFullName(data.user.fullName || "")
          setEmail(data.user.email || "")
          setYear(data.user.year || "")
          setDepartment(data.user.department || "")
          setDivision(data.user.division || "")
        }
      })
      .catch(() => {})
      .finally(() => setDataLoading(false))
  }, [user])

  const completion = completionPercent({ fullName, year, department, division })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, year, department, division }),
      })
      const data = await res.json()
      console.log(data)
      if (!res.ok) {
        toast.error(data.error || "Failed to save profile")
        return
      }
      setSaved(true)
      await refetch()
      toast.success("Profile updated successfully!")
      setTimeout(() => setSaved(false), 3000)
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || dataLoading || !user) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: "linear-gradient(135deg, #020817 0%, #0f172a 60%, #1e1b4b 100%)" }}>
        <Loader2 className="animate-spin text-sky-400" size={32} />
      </div>
    )
  }

  const avatarInitial = (user.fullName || user.username || "?")[0].toUpperCase()
  const profileIncomplete = completion < 100

  return (
    <div
      className="min-h-dvh w-full px-4 py-24 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #020817 0%, #0f172a 60%, #1e1b4b 100%)" }}
    >
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl" style={{ background: "radial-gradient(circle, #38bdf8, transparent 70%)" }} />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ background: "radial-gradient(circle, #a78bfa, transparent 70%)" }} />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(56,189,248,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      {/* Back */}
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium group transition-all duration-200 hover:gap-3" style={{ color: "rgba(148,163,184,0.7)" }}>
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-200" />
        Back to site
      </Link>

      <div className={`max-w-2xl mx-auto transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>

        {/* ── Avatar & header card ────────────────────────────────────── */}
        <div
          className="relative mb-6 rounded-2xl overflow-hidden"
          style={{
            background: "rgba(15,23,42,0.85)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(56,189,248,0.12)",
            boxShadow: "0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          {/* Top gradient strip */}
          <div className="h-24 w-full relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #34d399 100%)" }}>
            <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 1px, transparent 0, transparent 50%)", backgroundSize: "10px 10px" }} />
          </div>

          {/* Avatar */}
          <div className="px-6 pb-6 relative">
            <div
              className="absolute -top-10 left-6 w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white border-4 shadow-2xl select-none"
              style={{
                background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                borderColor: "#0f172a",
                boxShadow: "0 8px 32px rgba(14,165,233,0.4)",
              }}
            >
              {avatarInitial}
            </div>

            <div className="pt-12 flex items-end justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-xl font-black text-white leading-none">
                  {user.fullName || user.username}
                </h1>
                <p className="text-sm mt-1" style={{ color: "rgba(148,163,184,0.7)" }}>@{user.username}</p>
                {user.department && user.year && (
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "rgba(56,189,248,0.12)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.2)" }}>
                      {user.department}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "rgba(99,102,241,0.12)", color: "#a78bfa", border: "1px solid rgba(99,102,241,0.2)" }}>
                      {user.year}
                    </span>
                    {user.division && (
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}>
                        Division {user.division}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Profile completion ring */}
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                  {profileIncomplete
                    ? <AlertCircle size={14} style={{ color: "#fb7185" }} />
                    : <CheckCircle2 size={14} style={{ color: "#34d399" }} />
                  }
                  <span className="text-xs font-semibold" style={{ color: profileIncomplete ? "#fb7185" : "#34d399" }}>
                    {completion}% complete
                  </span>
                </div>
                <div className="w-32 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${completion}%`,
                      background: completion === 100 ? "linear-gradient(90deg,#34d399,#0ea5e9)" : "linear-gradient(90deg,#0ea5e9,#6366f1)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── CoDE Club logo watermark ─────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-4 px-1">
          <div className="relative size-6 rounded-lg overflow-hidden shrink-0">
            <Image src="/codeclub1.png" alt="CoDE Club" fill sizes="24px" className="object-contain" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(56,189,248,0.6)" }}>CoDE Club — Member Profile</span>
        </div>

        {/* ── Edit form card ───────────────────────────────────────────── */}
        <form
          onSubmit={handleSave}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(15,23,42,0.85)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(56,189,248,0.10)",
            boxShadow: "0 24px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <Pencil size={15} style={{ color: "#38bdf8" }} />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Edit Profile</h2>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Full Name */}
            <div className="sm:col-span-2">
              <FieldLabel icon={User} label="Full Name" />
              <input
                id="profile-fullname"
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Prashant Sharma"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = INPUT_FOCUS_COLOR)}
                onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              />
            </div>

            {/* Email (read-only) */}
            <div className="sm:col-span-2">
              <FieldLabel icon={Mail} label="Email Address" />
              <input
                type="email"
                value={email}
                readOnly
                style={{ ...inputStyle, color: "rgba(148,163,184,0.6)", cursor: "not-allowed" }}
              />
              <p className="mt-1.5 text-xs" style={{ color: "rgba(100,116,139,0.7)" }}>Email cannot be changed after registration.</p>
            </div>

            {/* Year */}
            <div>
              <FieldLabel icon={GraduationCap} label="Year" />
              <select
                id="profile-year"
                value={year}
                onChange={e => setYear(e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
                onFocus={e => (e.target.style.borderColor = INPUT_FOCUS_COLOR)}
                onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
              >
                <option value="" disabled style={{ background: "#0f172a" }}>Select year…</option>
                {YEAR_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} style={{ background: "#0f172a" }}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Division */}
            <div>
              <FieldLabel icon={Users2} label="Division" />
              <div className="flex gap-2">
                {DIV_OPTIONS.map(d => (
                  <button
                    key={d}
                    type="button"
                    id={`profile-div-${d}`}
                    onClick={() => setDivision(division === d ? "" : d)}
                    className="flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{
                      background: division === d ? "linear-gradient(135deg,#0ea5e9,#6366f1)" : "rgba(255,255,255,0.04)",
                      border: division === d ? "1px solid rgba(56,189,248,0.4)" : "1px solid rgba(255,255,255,0.08)",
                      color: division === d ? "#fff" : "rgba(148,163,184,0.7)",
                      boxShadow: division === d ? "0 4px 14px rgba(14,165,233,0.3)" : "none",
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Department */}
            <div className="sm:col-span-2">
              <FieldLabel icon={Building2} label="Department" />
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {DEPT_OPTIONS.map(d => (
                  <button
                    key={d.value}
                    type="button"
                    id={`profile-dept-${d.value}`}
                    onClick={() => setDepartment(department === d.value ? "" : d.value)}
                    className="py-2.5 px-2 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 text-center"
                    style={{
                      background: department === d.value ? "linear-gradient(135deg,#0ea5e9,#6366f1)" : "rgba(255,255,255,0.04)",
                      border: department === d.value ? "1px solid rgba(56,189,248,0.4)" : "1px solid rgba(255,255,255,0.08)",
                      color: department === d.value ? "#fff" : "rgba(148,163,184,0.7)",
                      boxShadow: department === d.value ? "0 4px 14px rgba(14,165,233,0.3)" : "none",
                      lineHeight: 1.2,
                    }}
                    title={d.label}
                  >
                    {d.value}
                    <span className="hidden sm:block text-[10px] font-normal opacity-70 mt-0.5 leading-none">
                      {d.label.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Save bar */}
          <div
            className="px-6 py-4 flex items-center justify-between flex-wrap gap-3 border-t"
            style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}
          >
            {profileIncomplete ? (
              <p className="text-xs flex items-center gap-1.5" style={{ color: "rgba(251,191,36,0.8)" }}>
                <AlertCircle size={12} />
                Fill in all fields to complete your profile
              </p>
            ) : (
              <p className="text-xs flex items-center gap-1.5" style={{ color: "rgba(52,211,153,0.8)" }}>
                <CheckCircle2 size={12} />
                Profile complete
              </p>
            )}

            <button
              id="profile-save"
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: saved ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#0ea5e9,#6366f1)",
                boxShadow: saved ? "0 6px 20px rgba(16,185,129,0.35)" : "0 6px 20px rgba(14,165,233,0.35)",
              }}
            >
              {saving ? (
                <Loader2 size={15} className="animate-spin" />
              ) : saved ? (
                <CheckCircle2 size={15} />
              ) : (
                <Save size={15} />
              )}
              {saving ? "Saving…" : saved ? "Saved!" : "Save Profile"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        select option { background: #0f172a; color: #fff; }
        input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px rgba(15,23,42,0.95) inset;
          -webkit-text-fill-color: #fff;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  )
}
