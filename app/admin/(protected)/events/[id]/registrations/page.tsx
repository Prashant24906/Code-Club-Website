"use client"

import { useEffect, useState, use } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AdminNavbar } from "@/components/admin-navbar"
import { ParticleBackground } from "@/components/particle-background"
import { Loader2, Download, ChevronLeft } from "lucide-react"

type Teammate = { name: string; email: string; phone: string }

type Registration = {
  _id: string
  name: string
  email: string
  phone: string
  year: string
  department: string
  division: string
  teamName?: string
  teammates?: Teammate[]
  createdAt: string
}

interface Props {
  params: Promise<{ id: string }>
}

export default function RegistrationsPage({ params }: Props) {
  const { id } = use(params)
  const [loading, setLoading] = useState(true)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [eventTitle, setEventTitle] = useState("")

  useEffect(() => {
    fetch(`/api/admin/events/${id}/registrations`)
      .then(res => res.json())
      .then(data => {
        if (data.registrations) {
          setRegistrations(data.registrations)
          setEventTitle(data.eventTitle || "Event")
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const downloadCSV = () => {
    // Flatten registrations (1 row per person, including teammates)
    const rows = [
      ["Reg Date", "Team Name", "Role", "Name", "Email", "Phone", "Year", "Department", "Division"]
    ]

    registrations.forEach(reg => {
      const date = new Date(reg.createdAt).toLocaleString()
      const tName = reg.teamName || ""
      
      // Add main registrant (Leader/Individual)
      const role = reg.teammates && reg.teammates.length > 0 ? "Leader" : "Individual"
      rows.push([
        date, tName, role, reg.name, reg.email, reg.phone || "", reg.year || "", reg.department || "", reg.division || ""
      ])

      // Add teammates
      if (reg.teammates && reg.teammates.length > 0) {
        reg.teammates.forEach(tm => {
          rows.push([
            date, tName, "Member", tm.name, tm.email, tm.phone || "", "", "", ""
          ])
        })
      }
    })

    const csvContent = rows.map(r => r.map(v => `"${(v || "").replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${eventTitle}_Registrations.csv`.replace(/\s+/g, "_")
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="relative min-h-screen">
      <AdminNavbar />
      <ParticleBackground />
      <div className="mx-auto max-w-7xl px-4 pt-28 pb-8 relative z-10">
        
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Button asChild variant="ghost" className="mb-2 -ml-4 hover:bg-white/10">
              <Link href="/admin/events"><ChevronLeft className="h-4 w-4 mr-1"/> Back to Events</Link>
            </Button>
            <h1 className="text-2xl font-bold">Registrations</h1>
            <p className="text-muted-foreground">{eventTitle}</p>
          </div>
          <Button onClick={downloadCSV} disabled={loading || registrations.length === 0} className="shrink-0 gap-2">
            <Download className="h-4 w-4" /> Download CSV
          </Button>
        </div>

        <Card className="glass-card rounded-xl overflow-hidden border border-white/10">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : registrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <span className="text-2xl">📭</span>
              </div>
              <h3 className="text-lg font-semibold">No registrations yet</h3>
              <p className="text-muted-foreground text-sm max-w-sm mt-1">
                When people register for this event, their details will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto" style={{ scrollbarWidth: "thin" }}>
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-black/40 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-semibold tracking-wider">Date</th>
                    <th className="px-4 py-3 font-semibold tracking-wider">Name</th>
                    <th className="px-4 py-3 font-semibold tracking-wider">Email</th>
                    <th className="px-4 py-3 font-semibold tracking-wider">Phone</th>
                    <th className="px-4 py-3 font-semibold tracking-wider">Academic Info</th>
                    <th className="px-4 py-3 font-semibold tracking-wider">Team</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {registrations.map(reg => (
                    <tr key={reg._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {new Date(reg.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-medium">{reg.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{reg.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">{reg.phone || "—"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col text-xs text-muted-foreground">
                          {reg.year || reg.department || reg.division ? (
                            <>
                              <span>{reg.year} {reg.department}</span>
                              <span>Div {reg.division}</span>
                            </>
                          ) : "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {reg.teamName ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-primary">{reg.teamName}</span>
                            <span className="text-xs text-muted-foreground mt-0.5">
                              + {reg.teammates?.length || 0} member(s)
                            </span>
                          </div>
                        ) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </main>
  )
}
