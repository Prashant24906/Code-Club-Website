"use client"

import { useEffect, useState } from "react"
import AdminNavbar from "@/components/admin-navbar"
import { ParticleBackground } from "@/components/particle-background"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter as AlertFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import Link from "next/link"
import { Plus, Edit, Trash2, ExternalLink, Users, MessageCircle } from "lucide-react"

type Community = {
  _id: string
  id: string
  name: string
  description: string
  color: string
  members: string
  tags: string[]
  whatsappLink: string
  isMain: boolean
  iconName: string
}

const BLANK: Omit<Community, "_id"> = {
  id: "",
  name: "",
  description: "",
  color: "#38bdf8",
  members: "0+",
  tags: [],
  whatsappLink: "https://chat.whatsapp.com/",
  isMain: false,
  iconName: "MessageCircle",
}

const COLOR_PRESETS = [
  "#38bdf8", "#34d399", "#a78bfa", "#fb7185",
  "#fbbf24", "#f87171", "#60a5fa", "#c084fc",
]

export default function AdminCommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)

  // Add dialog
  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState<Omit<Community, "_id">>(BLANK)
  const [addTagInput, setAddTagInput] = useState("")
  const [addSaving, setAddSaving] = useState(false)

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState<Community | null>(null)
  const [editTagInput, setEditTagInput] = useState("")
  const [editSaving, setEditSaving] = useState(false)

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Community | null>(null)

  useEffect(() => {
    fetchCommunities()
  }, [])

  async function fetchCommunities() {
    setLoading(true)
    try {
      const res = await fetch("/api/communities")
      const data = await res.json()
      setCommunities(data)
    } catch {
      toast.error("Failed to load communities")
    } finally {
      setLoading(false)
    }
  }

  // ── ADD ──────────────────────────────────────────────────────────────────────
  async function handleAdd() {
    if (!addForm.name.trim() || !addForm.description.trim()) return
    setAddSaving(true)
    try {
      const res = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...addForm, id: addForm.id || addForm.name.toLowerCase().replace(/\s+/g, "-") }),
      })
      if (!res.ok) throw new Error()
      const created = await res.json()
      setCommunities((prev) => [...prev, created])
      setAddOpen(false)
      setAddForm(BLANK)
      setAddTagInput("")
      toast.success("Community added!")
    } catch {
      toast.error("Failed to add community")
    } finally {
      setAddSaving(false)
    }
  }

  // ── EDIT ─────────────────────────────────────────────────────────────────────
  function openEdit(c: Community) {
    setEditForm({ ...c })
    setEditTagInput("")
    setEditOpen(true)
  }

  async function handleEdit() {
    if (!editForm || !editForm.name.trim() || !editForm.description.trim()) return
    setEditSaving(true)
    try {
      const res = await fetch("/api/communities", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setCommunities((prev) => prev.map((c) => (c._id === updated._id ? updated : c)))
      setEditOpen(false)
      setEditForm(null)
      toast.success("Community updated!")
    } catch {
      toast.error("Failed to update community")
    } finally {
      setEditSaving(false)
    }
  }

  // ── DELETE ────────────────────────────────────────────────────────────────────
  async function handleDelete(c: Community) {
    try {
      const res = await fetch("/api/communities", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: c._id }),
      })
      if (!res.ok) throw new Error()
      setCommunities((prev) => prev.filter((x) => x._id !== c._id))
      toast.success("Community deleted!")
    } catch {
      toast.error("Failed to delete community")
    } finally {
      setDeleteTarget(null)
    }
  }

  // ── TAG HELPERS ───────────────────────────────────────────────────────────────
  function addTagToAdd(e: React.KeyboardEvent) {
    if (e.key === "Enter" && addTagInput.trim()) {
      e.preventDefault()
      setAddForm((f) => ({ ...f, tags: [...f.tags, addTagInput.trim()] }))
      setAddTagInput("")
    }
  }
  function removeTagAdd(tag: string) {
    setAddForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))
  }

  function addTagToEdit(e: React.KeyboardEvent) {
    if (e.key === "Enter" && editTagInput.trim() && editForm) {
      e.preventDefault()
      setEditForm((f) => f ? { ...f, tags: [...f.tags, editTagInput.trim()] } : f)
      setEditTagInput("")
    }
  }
  function removeTagEdit(tag: string) {
    setEditForm((f) => f ? { ...f, tags: f.tags.filter((t) => t !== tag) } : f)
  }

  // ── RENDER ────────────────────────────────────────────────────────────────────
  return (
    <main className="relative min-h-screen">
      <AdminNavbar />
      <ParticleBackground />
      <div className="mx-auto max-w-6xl px-4 pt-28 pb-12">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Manage Communities</h1>
            <p className="text-sm text-muted-foreground mt-1">{communities.length} communities • edits reflect on the /community page</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/admin">← Back to Admin</Link>
            </Button>
            <Button onClick={() => { setAddForm(BLANK); setAddTagInput(""); setAddOpen(true) }} className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Community
            </Button>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-5 h-44 animate-pulse" />
            ))}
          </div>
        ) : communities.length === 0 ? (
          <Card className="glass-card p-12 text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No communities yet. Add one above.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {communities.map((c) => (
              <Card key={c._id} className="glass-card rounded-2xl p-5 flex flex-col gap-3" style={{ borderLeft: `3px solid ${c.color}` }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="size-3 rounded-full shrink-0" style={{ background: c.color }} />
                      <h3 className="font-semibold text-sm truncate">{c.name}</h3>
                      {c.isMain && <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full shrink-0" style={{ background: `${c.color}20`, color: c.color }}>Main</span>}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {c.members} members
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(c)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => setDeleteTarget(c)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{c.description}</p>

                <div className="flex flex-wrap gap-1">
                  {c.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full" style={{ background: `${c.color}15`, color: c.color, border: `1px solid ${c.color}25` }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {c.whatsappLink && (
                  <a href={c.whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 transition-colors">
                    <ExternalLink className="h-3 w-3" />
                    <span className="truncate">{c.whatsappLink}</span>
                  </a>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ── ADD DIALOG ─────────────────────────────────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg glass-card">
          <DialogHeader><DialogTitle>Add Community</DialogTitle></DialogHeader>
          <CommunityForm
            form={addForm}
            setForm={setAddForm as React.Dispatch<React.SetStateAction<Omit<Community, "_id">>>}
            tagInput={addTagInput}
            setTagInput={setAddTagInput}
            onTagKeyDown={addTagToAdd}
            onRemoveTag={removeTagAdd}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={addSaving || !addForm.name.trim()} className="bg-cyan-600 hover:bg-cyan-700">
              {addSaving ? "Saving..." : "Add Community"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── EDIT DIALOG ────────────────────────────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg glass-card">
          <DialogHeader><DialogTitle>Edit Community</DialogTitle></DialogHeader>
          {editForm && (
            <CommunityForm
              form={editForm}
              setForm={setEditForm as React.Dispatch<React.SetStateAction<Omit<Community, "_id">>>}
              tagInput={editTagInput}
              setTagInput={setEditTagInput}
              onTagKeyDown={addTagToEdit}
              onRemoveTag={removeTagEdit}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={editSaving || !editForm?.name.trim()} className="bg-cyan-600 hover:bg-cyan-700">
              {editSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DELETE CONFIRM ──────────────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Community</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteTarget && handleDelete(deleteTarget)}>
              Delete
            </AlertDialogAction>
          </AlertFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}

// ── Shared form component ──────────────────────────────────────────────────────
function CommunityForm({
  form,
  setForm,
  tagInput,
  setTagInput,
  onTagKeyDown,
  onRemoveTag,
}: {
  form: Omit<Community, "_id">
  setForm: React.Dispatch<React.SetStateAction<Omit<Community, "_id">>>
  tagInput: string
  setTagInput: (v: string) => void
  onTagKeyDown: (e: React.KeyboardEvent) => void
  onRemoveTag: (tag: string) => void
}) {
  return (
    <div className="grid gap-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label>Name *</Label>
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Web Development" className="glass" />
        </div>
        <div className="grid gap-1.5">
          <Label>Members</Label>
          <Input value={form.members} onChange={(e) => setForm((f) => ({ ...f, members: e.target.value }))} placeholder="80+" className="glass" />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label>Description *</Label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Short description of this community..."
          rows={3}
          className="glass rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      <div className="grid gap-1.5">
        <Label>WhatsApp Invite Link</Label>
        <Input value={form.whatsappLink} onChange={(e) => setForm((f) => ({ ...f, whatsappLink: e.target.value }))} placeholder="https://chat.whatsapp.com/..." className="glass" />
      </div>

      <div className="grid gap-1.5">
        <Label>Accent Color</Label>
        <div className="flex items-center gap-2 flex-wrap">
          {["#38bdf8", "#34d399", "#a78bfa", "#fb7185", "#fbbf24", "#f87171", "#60a5fa", "#c084fc"].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setForm((f) => ({ ...f, color: c }))}
              className="size-7 rounded-full border-2 transition-transform hover:scale-110"
              style={{ background: c, borderColor: form.color === c ? "#fff" : "transparent" }}
            />
          ))}
          <Input
            value={form.color}
            onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
            placeholder="#38bdf8"
            className="glass w-28 text-xs"
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label>Tags <span className="text-xs text-muted-foreground">(press Enter to add)</span></Label>
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={onTagKeyDown}
          placeholder="React, Next.js, ..."
          className="glass"
        />
        {form.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {form.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full transition-opacity hover:opacity-70"
                style={{ background: `${form.color}20`, color: form.color, border: `1px solid ${form.color}30` }}
              >
                {tag} ✕
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isMain"
          checked={form.isMain}
          onChange={(e) => setForm((f) => ({ ...f, isMain: e.target.checked }))}
          className="accent-cyan-500 size-4"
        />
        <Label htmlFor="isMain" className="cursor-pointer">Mark as Main Community</Label>
      </div>
    </div>
  )
}
