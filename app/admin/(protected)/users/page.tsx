"use client"

import { useEffect, useState } from "react"
import AdminNavbar from "@/components/admin-navbar"
import { ParticleBackground } from "@/components/particle-background"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter as AlertFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import Link from "next/link"
import { Search, Trash2, UserCircle2, Calendar, BookOpen, GraduationCap } from "lucide-react"

type SiteUser = {
  _id: string
  email: string
  username: string
  fullName: string
  year: string
  department: string
  division: string
  createdAt: string
}

const DEPT_COLORS: Record<string, string> = {
  IT: "#38bdf8", CS: "#34d399", MECH: "#fbbf24", CIVIL: "#94a3b8",
  EXTC: "#a78bfa", ETRX: "#fb7185", AIDS: "#f87171", AIML: "#60a5fa", OTHER: "#9ca3af",
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<SiteUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<SiteUser | null>(null)

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/users")
      if (!res.ok) throw new Error()
      const data = await res.json()
      setUsers(data)
    } catch {
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(u: SiteUser) {
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: u._id }),
      })
      if (!res.ok) throw new Error()
      setUsers((prev) => prev.filter((x) => x._id !== u._id))
      toast.success("User deleted")
    } catch {
      toast.error("Failed to delete user")
    } finally {
      setDeleteTarget(null)
    }
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    return (
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.fullName || "").toLowerCase().includes(q) ||
      (u.department || "").toLowerCase().includes(q)
    )
  })

  function initials(u: SiteUser) {
    if (u.fullName) {
      const parts = u.fullName.trim().split(" ")
      return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase()
    }
    return u.username.slice(0, 2).toUpperCase()
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
  }

  return (
    <main className="relative min-h-screen">
      <AdminNavbar />
      <ParticleBackground />
      <div className="mx-auto max-w-6xl px-4 pt-28 pb-12">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Registered Users</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {loading ? "Loading..." : `${users.length} registered user${users.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin">← Back to Admin</Link>
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, username, department..."
            className="glass pl-9"
          />
        </div>

        {/* Stats pills */}
        {!loading && (
          <div className="flex flex-wrap gap-3 mb-6">
            {Object.entries(
              users.reduce<Record<string, number>>((acc, u) => {
                const dept = u.department || "OTHER"
                acc[dept] = (acc[dept] || 0) + 1
                return acc
              }, {})
            )
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([dept, count]) => (
                <span key={dept} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full" style={{ background: `${DEPT_COLORS[dept] ?? "#9ca3af"}15`, color: DEPT_COLORS[dept] ?? "#9ca3af", border: `1px solid ${DEPT_COLORS[dept] ?? "#9ca3af"}30` }}>
                  {dept}: {count}
                </span>
              ))
            }
          </div>
        )}

        {/* Table / Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="glass-card rounded-2xl p-5 h-32 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="glass-card p-12 text-center">
            <UserCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{search ? "No users match your search." : "No users registered yet."}</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((u) => {
              const color = DEPT_COLORS[u.department] ?? "#9ca3af"
              return (
                <Card key={u._id} className="glass-card rounded-2xl p-5 flex gap-4 items-start" style={{ borderLeft: `3px solid ${color}` }}>
                  {/* Avatar */}
                  <div
                    className="size-11 rounded-xl flex items-center justify-center shrink-0 text-sm font-black text-white"
                    style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}
                  >
                    {initials(u)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{u.fullName || u.username}</p>
                        {u.fullName && <p className="text-xs text-muted-foreground truncate">@{u.username}</p>}
                      </div>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0" onClick={() => setDeleteTarget(u)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground truncate mb-2">{u.email}</p>

                    <div className="flex flex-wrap items-center gap-2">
                      {u.department && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
                          <BookOpen className="h-2.5 w-2.5" />{u.department}
                        </span>
                      )}
                      {u.year && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-white/10">
                          <GraduationCap className="h-2.5 w-2.5" />{u.year}
                        </span>
                      )}
                      {u.division && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-white/10">
                          Div {u.division}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
                        <Calendar className="h-2.5 w-2.5" />
                        {formatDate(u.createdAt)}
                      </span>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.fullName || deleteTarget?.username}</strong>? This cannot be undone and will remove their account permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteTarget && handleDelete(deleteTarget)}>
              Delete User
            </AlertDialogAction>
          </AlertFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
