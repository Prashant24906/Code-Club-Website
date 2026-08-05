"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AdminNavbar } from "@/components/admin-navbar"
import { ParticleBackground } from "@/components/particle-background"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter as AlertFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDropzone } from "react-dropzone"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { CalendarIcon, X } from "lucide-react"
import ImageCropperDialog from "@/components/image-cropper-dialog"
import { EventType } from "@/lib/types"

export default function EventsAdminPage() {
  type EventImageRatio = "square" | "portrait"
  const [events, setEvents] = useState<EventType[]>([])

  const [aTitle, setATitle] = useState("")
  const [aDate, setADate] = useState("")
  const [aLocation, setALocation] = useState("")
  const [aDescription, setADescription] = useState("")
  const [aGoogleForm, setAGoogleForm] = useState("")
  const [aImages, setAImages] = useState<string[]>([])
  const [aImageRatio, setAImageRatio] = useState<EventImageRatio>("portrait")
  const [aMinTeam, setAMinTeam] = useState("")
  const [aMaxTeam, setAMaxTeam] = useState("")
  const [aTeamLabel, setATeamLabel] = useState("")
  const [aPrizePool, setAPrizePool] = useState<{position: string, amount: string}[]>([])
  const [aRegistrationStart, setARegistrationStart] = useState("")
  const [aWhatsAppLink, setAWhatsAppLink] = useState("")

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [eTitle, setETitle] = useState("")
  const [eDate, setEDate] = useState("")
  const [eLocation, setELocation] = useState("")
  const [eDescription, setEDescription] = useState("")
  const [eGoogleForm, setEGoogleForm] = useState("")
  const [eImages, setEImages] = useState<string[]>([])
  const [eImageRatio, setEImageRatio] = useState<EventImageRatio>("portrait")
  const [eMinTeam, setEMinTeam] = useState("")
  const [eMaxTeam, setEMaxTeam] = useState("")
  const [eTeamLabel, setETeamLabel] = useState("")
  const [ePrizePool, setEPrizePool] = useState<{position: string, amount: string}[]>([])
  const [eRegistrationStart, setERegistrationStart] = useState("")
  const [eWhatsAppLink, setEWhatsAppLink] = useState("")

  const [addCropOpen, setAddCropOpen] = useState(false)
  const [addCropSrc, setAddCropSrc] = useState<string | null>(null)
  const [editCropOpen, setEditCropOpen] = useState(false)
  const [editCropSrc, setEditCropSrc] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [addUploading, setAddUploading] = useState(false)
  const [editUploading, setEditUploading] = useState(false)

  /** Upload a base64 dataUrl to Cloudinary via our server route and return the secure URL */
  async function uploadToCloudinary(dataUrl: string): Promise<string | null> {
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || json.error || "Unknown error")
      return json.url as string
    } catch (err) {
      console.error("Cloudinary upload failed:", err)
      return null
    }
  }

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data: EventType[]) => setEvents(data))
      .catch((err) => console.error("Failed to fetch events:", err))
  }, [])

  const addEvent = async () => {
    if (!aTitle.trim() || !aDate.trim() || !aDescription.trim()) return

    const newEvent: EventType = {
      title: aTitle.trim(),
      date: aDate,
      location: aLocation.trim() || undefined,
      description: aDescription.trim(),
      images: aImages,
      googleFormLink: aGoogleForm.trim() || undefined,
      image: aImages[0] || "", // legacy compat
      minTeamSize: aMinTeam ? Number(aMinTeam) : undefined,
      maxTeamSize: aMaxTeam ? Number(aMaxTeam) : undefined,
      teamNameLabel: aTeamLabel.trim() || undefined,
      prizePool: aPrizePool.filter(p => p.position.trim() && p.amount.trim()),
      registrationStartTime: aRegistrationStart ? new Date(aRegistrationStart).toISOString() : null,
      whatsappLink: aWhatsAppLink.trim() || undefined,
    }

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      })
      const createdEvent = await res.json()
      setEvents((prev) => [createdEvent, ...prev])
      resetAddForm()
    } catch (err) {
      console.error("Failed to add event:", err)
    }
  }

  const saveEdit = async () => {
    if (!editingId || !eTitle.trim() || !eDate.trim() || !eDescription.trim()) return

    const updatedEvent: Partial<EventType> = {
      title: eTitle.trim(),
      date: eDate,
      location: eLocation.trim() || undefined,
      description: eDescription.trim(),
      images: eImages,
      googleFormLink: eGoogleForm.trim() || undefined,
      image: eImages[0] || "", // legacy compat
      minTeamSize: eMinTeam ? Number(eMinTeam) : undefined,
      maxTeamSize: eMaxTeam ? Number(eMaxTeam) : undefined,
      teamNameLabel: eTeamLabel.trim() || undefined,
      prizePool: ePrizePool.filter(p => p.position.trim() && p.amount.trim()),
      registrationStartTime: eRegistrationStart ? new Date(eRegistrationStart).toISOString() : null,
      whatsappLink: eWhatsAppLink.trim() || undefined,
    }

    try {
      const res = await fetch("/api/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...updatedEvent }),
      })
      const updated = await res.json()
      setEvents((prev) => prev.map((e) => (e._id === editingId ? updated : e)))
      setEditOpen(false)
      resetEditForm()
    } catch (err) {
      console.error("Failed to update event:", err)
    }
  }

  const deleteEvent = async () => {
    if (!pendingDeleteId) return
    try {
      await fetch("/api/events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pendingDeleteId }),
      })
      setEvents((prev) => prev.filter((e) => e._id !== pendingDeleteId))
      if (editingId === pendingDeleteId) {
        setEditOpen(false)
        resetEditForm()
      }
      setDeleteDialogOpen(false)
      setPendingDeleteId(null)
    } catch (err) {
      console.error("Failed to delete event:", err)
    }
  }

  const openDeleteDialog = (id: string) => {
    setPendingDeleteId(id)
    setDeleteDialogOpen(true)
  }

  function resetAddForm() {
    setATitle("")
    setADate("")
    setALocation("")
    setADescription("")
    setAGoogleForm("")
    setAImages([])
    setAImageRatio("portrait")
    setAMinTeam("")
    setAMaxTeam("")
    setATeamLabel("")
    setAPrizePool([])
    setARegistrationStart("")
    setAWhatsAppLink("")
  }
  function resetEditForm() {
    setEditingId(null)
    setETitle("")
    setEDate("")
    setELocation("")
    setEDescription("")
    setEGoogleForm("")
    setEImages([])
    setEImageRatio("portrait")
    setEMinTeam("")
    setEMaxTeam("")
    setETeamLabel("")
    setEPrizePool([])
    setERegistrationStart("")
    setEWhatsAppLink("")
  }

  const onAddDrop = (files: File[]) => {
    const file = files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : undefined
      if (result) {
        setAddCropSrc(result)
        setAddCropOpen(true)
      }
    }
    reader.readAsDataURL(file)
  }

  const onEditDrop = (files: File[]) => {
    const file = files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : undefined
      if (result) {
        setEditCropSrc(result)
        setEditCropOpen(true)
      }
    }
    reader.readAsDataURL(file)
  }

  const {
    getRootProps: getAddRootProps,
    getInputProps: getAddInputProps,
    isDragActive: addDragActive,
  } = useDropzone({
    onDrop: onAddDrop,
    multiple: false,
    accept: { "image/*": [] },
  })
  const {
    getRootProps: getEditRootProps,
    getInputProps: getEditInputProps,
    isDragActive: editDragActive,
  } = useDropzone({
    onDrop: onEditDrop,
    multiple: false,
    accept: { "image/*": [] },
  })

  function formatYmd(date: Date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
  }
  function parseYmd(s: string): Date | null {
    if (!s) return null
    const [y, m, d] = s.split("-").map((v) => Number(v))
    if (!y || !m || !d) return null
    return new Date(y, m - 1, d)
  }

  const addSelectedDate = useMemo(() => (aDate ? (parseYmd(aDate) ?? undefined) : undefined), [aDate])
  const editSelectedDate = useMemo(() => (eDate ? (parseYmd(eDate) ?? undefined) : undefined), [eDate])

  const addCanSave = useMemo(() => {
    return aTitle.trim() !== "" && aDate.trim() !== "" && aDescription.trim() !== ""
  }, [aTitle, aDate, aDescription])

  const editCanSave = useMemo(() => {
    return eTitle.trim() !== "" && eDate.trim() !== "" && eDescription.trim() !== ""
  }, [eTitle, eDate, eDescription])

  const addIsFuture = useMemo(() => {
    const today = new Date()
    const selectedDate = parseYmd(aDate)
    return selectedDate ? selectedDate > today : false
  }, [aDate])

  const editIsFuture = useMemo(() => {
    const today = new Date()
    const selectedDate = parseYmd(eDate)
    return selectedDate ? selectedDate > today : false
  }, [eDate])

  const openEdit = (event: EventType) => {
    setEditingId(event._id || null)
    setETitle(event.title)
    setEDate(event.date)
    setELocation(event.location || "")
    setEDescription(event.description)
    setEGoogleForm(event.googleFormLink || "")
    setEMinTeam(event.minTeamSize != null ? String(event.minTeamSize) : "")
    setEMaxTeam(event.maxTeamSize != null ? String(event.maxTeamSize) : "")
    setETeamLabel(event.teamNameLabel || "")
    setEPrizePool(event.prizePool || [])
    setEWhatsAppLink(event.whatsappLink || "")
    
    if (event.registrationStartTime) {
      const d = new Date(event.registrationStartTime)
      const pad = (n: number) => n.toString().padStart(2, '0')
      const localStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
      setERegistrationStart(localStr)
    } else {
      setERegistrationStart("")
    }
    
    // Support legacy data structure
    if (event.images && event.images.length > 0) {
      setEImages(event.images)
    } else if (event.image) {
      setEImages([event.image])
    } else {
      setEImages([])
    }
    
    setEImageRatio("portrait")
    setEditOpen(true)
  }

  const ratioAspect = (ratio: EventImageRatio) => (ratio === "square" ? 1 : 3 / 4)
  const ratioOutput = (ratio: EventImageRatio) =>
    ratio === "square" ? { w: 1080, h: 1080 } : { w: 1080, h: 1440 }

  return (
    <main className="relative min-h-screen">
      <AdminNavbar />
      <ParticleBackground />
      <div className="mx-auto max-w-5xl px-4 pt-28 pb-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Events</h1>
        <Button asChild variant="outline">
          <Link href="/admin">← Back to Admin</Link>
        </Button>
      </div>

      {/* Events list */}
      <Card className="glass-card mb-8 rounded-xl p-6">
        <h2 className="mb-4 text-lg font-semibold">Events</h2>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => {
              const coverImg = (e.images && e.images.length > 0) ? e.images[0] : e.image
              return (
                <div key={e._id} className="rounded-lg border border-border overflow-hidden bg-background/50">
                  <div className="relative w-full bg-muted/30 overflow-hidden aspect-[3/4]">
                    {coverImg ? (
                      <img
                        src={coverImg}
                        loading="lazy"
                        alt={e.title}
                        className="absolute inset-0 h-full w-full object-contain p-2"
                      />
                    ) : (
                      <img
                        src="/event-thumbnail-placeholder.jpg"
                        loading="lazy"
                        alt="Event thumbnail placeholder"
                        className="absolute inset-0 h-full w-full object-contain p-2"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="font-semibold truncate" title={e.title}>
                      {e.title}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground flex flex-col gap-0.5">
                      <span>{new Date(e.date).toLocaleDateString()}</span>
                      <span>{e.location || "TBD"}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" onClick={() => openEdit(e)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/events/${e._id}/registrations`}>Registrations</Link>
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => openDeleteDialog(e._id!)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Card className="glass-card rounded-xl p-6">
        <h2 className="mb-4 text-lg font-semibold">Add New Event</h2>
        
        <div className="mb-4 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={aImageRatio === "square" ? "default" : "outline"}
              onClick={(e) => {
                e.preventDefault()
                setAImageRatio("square")
              }}
            >
              1:1
            </Button>
            <Button
              type="button"
              size="sm"
              variant={aImageRatio === "portrait" ? "default" : "outline"}
              onClick={(e) => {
                e.preventDefault()
                setAImageRatio("portrait")
              }}
            >
              3:4
            </Button>
          </div>

          <div
            {...getAddRootProps()}
            className={`rounded-lg border border-dashed p-6 text-center transition cursor-pointer ${
              addDragActive ? "bg-accent/10 border-accent" : "bg-background/50 hover:bg-background/80"
            }`}
          >
            <input {...getAddInputProps()} id="add-multi-image" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Upload event image(s)</p>
              <p>Drag & drop here, or click to select</p>
            </div>
          </div>

          {addUploading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
              <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Uploading to Cloudinary…
            </div>
          )}

          {aImages.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {aImages.map((src, idx) => (
                <div key={idx} className={`relative rounded-md border border-white/10 overflow-hidden ${aImageRatio === "square" ? "aspect-square" : "aspect-[3/4]"}`}>
                  <img src={src} className="w-full h-full object-contain p-1 bg-black/20" alt={`Upload ${idx + 1}`} />
                  <button
                    onClick={() => setAImages(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 rounded-full bg-red-500/80 p-1 hover:bg-red-500 text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {idx === 0 && <span className="absolute bottom-0 inset-x-0 bg-primary text-[10px] text-center font-bold uppercase py-0.5">Cover</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <label htmlFor="a-title" className="text-sm font-medium">
              Title
            </label>
            <input
              id="a-title"
              value={aTitle}
              onChange={(e) => setATitle(e.target.value)}
              placeholder="Hackathon 2025"
              className="glass rounded-md px-3 py-2"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="a-date" className="text-sm font-medium">
              Date
            </label>
            <div className="relative">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="justify-start font-normal bg-transparent w-full px-4 py-2"
                    id="a-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {aDate ? (
                      new Date(aDate).toLocaleDateString()
                    ) : (
                      <span className="text-muted-foreground">Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0 z-50">
                  <Calendar
                    mode="single"
                    selected={addSelectedDate}
                    onSelect={(d) => {
                      if (d) setADate(formatYmd(d) ?? ""); // Ensure a string is always set
                    }}
                    defaultMonth={addSelectedDate ?? new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <label htmlFor="a-location" className="text-sm font-medium">
              Location (optional)
            </label>
            <input
              id="a-location"
              value={aLocation}
              onChange={(e) => setALocation(e.target.value)}
              placeholder="Auditorium A"
              className="glass rounded-md px-3 py-2"
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <label htmlFor="a-desc" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="a-desc"
              value={aDescription}
              onChange={(e) => setADescription(e.target.value)}
              placeholder={"Use Markdown, e.g. **bold**, - list, [link](https://...) \nShort details..."}
              className="glass min-h-24 rounded-md px-3 py-2"
            />
            <p className="text-xs text-muted-foreground">Markdown supported in cards and event dialog.</p>
          </div>

          {addIsFuture && (
            <div className="grid gap-2 sm:col-span-2">
              <label htmlFor="a-gform" className="text-sm font-medium">
                Google Form Link (optional)
              </label>
              <input
                id="a-gform"
                value={aGoogleForm}
                onChange={(e) => setAGoogleForm(e.target.value)}
                placeholder="https://forms.google.com/..."
                className="glass rounded-md px-3 py-2"
              />
            </div>
          )}

          <div className="grid gap-2 sm:col-span-2">
            <label htmlFor="a-whatsapp" className="text-sm font-medium">
              WhatsApp Group Link (optional)
            </label>
            <input
              id="a-whatsapp"
              value={aWhatsAppLink}
              onChange={(e) => setAWhatsAppLink(e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
              className="glass rounded-md px-3 py-2"
            />
          </div>

          {/* Team Size */}
          <div className="grid gap-2 sm:col-span-2">
            <label className="text-sm font-medium">Team Size (optional — leave blank for individual)</label>
            <div className="grid grid-cols-3 gap-2">
              <input type="number" min="1" max="20" value={aMinTeam} onChange={e => setAMinTeam(e.target.value)} placeholder="Min (e.g. 2)" className="glass rounded-md px-3 py-2" />
              <input type="number" min="1" max="20" value={aMaxTeam} onChange={e => setAMaxTeam(e.target.value)} placeholder="Max (e.g. 4)" className="glass rounded-md px-3 py-2" />
              <input type="text" value={aTeamLabel} onChange={e => setATeamLabel(e.target.value)} placeholder="Label (e.g. Team Name)" className="glass rounded-md px-3 py-2" />
            </div>
            <p className="text-xs text-muted-foreground">Min members · Max members · Label shown to registrants</p>
          </div>

          {/* Prize Pool */}
          <div className="grid gap-2 sm:col-span-2">
            <label className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">🏆 Prize Pool (optional)</span>
              <Button type="button" size="sm" variant="outline" onClick={() => setAPrizePool([...aPrizePool, {position: "", amount: ""}])}>
                + Add Position
              </Button>
            </label>
            {aPrizePool.length > 0 ? (
              <div className="space-y-2">
                {aPrizePool.map((prize, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input 
                      placeholder="Position (e.g. 1st)"
                      className="glass rounded-md px-3 py-2 flex-1"
                      value={prize.position}
                      onChange={e => {
                        const newPool = [...aPrizePool]
                        newPool[idx].position = e.target.value
                        setAPrizePool(newPool)
                      }}
                    />
                    <input 
                      placeholder="Prize (e.g. ₹5,000)"
                      className="glass rounded-md px-3 py-2 flex-1"
                      value={prize.amount}
                      onChange={e => {
                        const newPool = [...aPrizePool]
                        newPool[idx].amount = e.target.value
                        setAPrizePool(newPool)
                      }}
                    />
                    <Button type="button" variant="destructive" size="icon" onClick={() => setAPrizePool(aPrizePool.filter((_, i) => i !== idx))}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
               <p className="text-xs text-muted-foreground">No prize pool added.</p>
            )}
          </div>

          {/* Registration Start Time */}
          <div className="grid gap-2 sm:col-span-2">
            <label htmlFor="a-reg-start" className="text-sm font-medium">
              Registration Start Time (optional)
            </label>
            <input
              id="a-reg-start"
              type="datetime-local"
              value={aRegistrationStart}
              onChange={(e) => setARegistrationStart(e.target.value)}
              className="glass rounded-md px-3 py-2"
            />
            <p className="text-xs text-muted-foreground">If set, users cannot register until this time.</p>
          </div>


          <div className="flex gap-2 sm:col-span-2">
            <Button onClick={addEvent} disabled={!addCanSave} className="bg-emerald-600 hover:bg-emerald-700">
              Submit
            </Button>
            <Button type="button" variant="secondary" onClick={resetAddForm}>
              Reset
            </Button>
          </div>
        </div>
      </Card>
      
      <ImageCropperDialog
        open={addCropOpen}
        onOpenChange={setAddCropOpen}
        src={addCropSrc || "/placeholder.svg?height=512&width=512&query=event%20thumbnail"} 
        onCropped={async (dataUrl) => {
          if (!dataUrl) return
          setAddUploading(true)
          const url = await uploadToCloudinary(dataUrl)
          setAddUploading(false)
          if (url) setAImages(prev => [...prev, url])
          else alert("Image upload failed. Please try again.")
        }}
        aspect={ratioAspect(aImageRatio)}
        outputWidth={ratioOutput(aImageRatio).w}
        outputHeight={ratioOutput(aImageRatio).h}
      />
      
      <ImageCropperDialog
        open={editCropOpen}
        onOpenChange={setEditCropOpen}
        src={editCropSrc || "/placeholder.svg?height=512&width=512&query=event%20thumbnail"} 
        onCropped={async (dataUrl) => {
          if (!dataUrl) return
          setEditUploading(true)
          const url = await uploadToCloudinary(dataUrl)
          setEditUploading(false)
          if (url) setEImages(prev => [...prev, url])
          else alert("Image upload failed. Please try again.")
        }}
        aspect={ratioAspect(eImageRatio)}
        outputWidth={ratioOutput(eImageRatio).w}
        outputHeight={ratioOutput(eImageRatio).h}
      />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="glass-card sm:max-w-2xl max-h-[90vh] overflow-y-auto border-white/10 bg-[#0b1220] text-blue-50" style={{ scrollbarWidth: "thin" }}>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>

          <div className="mb-4 space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={eImageRatio === "square" ? "default" : "outline"}
                onClick={(ev) => {
                  ev.preventDefault()
                  setEImageRatio("square")
                }}
              >
                1:1
              </Button>
              <Button
                type="button"
                size="sm"
                variant={eImageRatio === "portrait" ? "default" : "outline"}
                onClick={(ev) => {
                  ev.preventDefault()
                  setEImageRatio("portrait")
                }}
              >
                3:4
              </Button>
            </div>

            <div
              {...getEditRootProps()}
              className={`rounded-lg border border-dashed p-6 text-center transition cursor-pointer ${
                editDragActive ? "bg-accent/10 border-accent" : "bg-background/50 hover:bg-background/80"
              }`}
            >
              <input {...getEditInputProps()} id="edit-multi-image" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Add event image(s)</p>
                <p>Drag & drop here, or click to select</p>
              </div>
            </div>

            {editUploading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Uploading to Cloudinary…
              </div>
            )}

            {eImages.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {eImages.map((src, idx) => (
                  <div key={idx} className={`relative rounded-md border border-white/10 overflow-hidden ${eImageRatio === "square" ? "aspect-square" : "aspect-[3/4]"}`}>
                    <img src={src} className="w-full h-full object-contain p-1 bg-black/20" alt={`Upload ${idx + 1}`} />
                    <button
                      type="button"
                      onClick={() => setEImages(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 rounded-full bg-red-500/80 p-1 hover:bg-red-500 text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {idx === 0 && <span className="absolute bottom-0 inset-x-0 bg-primary text-[10px] text-center font-bold uppercase py-0.5">Cover</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <label htmlFor="e-title" className="text-sm font-medium">
                Title
              </label>
              <input
                id="e-title"
                value={eTitle}
                onChange={(ev) => setETitle(ev.target.value)}
                className="glass rounded-md px-3 py-2"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="e-date" className="text-sm font-medium">
                Date
              </label>
              <div className="relative">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="justify-start font-normal bg-transparent w-full"
                      id="e-date"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {eDate ? (
                        new Date(eDate).toLocaleDateString()
                      ) : (
                        <span className="text-muted-foreground">Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="p-0">
                    <Calendar
                      mode="single"
                      selected={editSelectedDate}
                      onSelect={(d) => {
                        if (d) setEDate(formatYmd(d) ?? "");
                      }}
                      defaultMonth={editSelectedDate ?? new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <label htmlFor="e-location" className="text-sm font-medium">
                Location (optional)
              </label>
              <input
                id="e-location"
                value={eLocation}
                onChange={(ev) => setELocation(ev.target.value)}
                className="glass rounded-md px-3 py-2"
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <label htmlFor="e-desc" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="e-desc"
                value={eDescription}
                onChange={(ev) => setEDescription(ev.target.value)}
                placeholder={"Use Markdown, e.g. **bold**, - list, [link](https://...) \nShort details..."}
                className="glass min-h-24 rounded-md px-3 py-2"
              />
              <p className="text-xs text-muted-foreground">Markdown supported in cards and event dialog.</p>
            </div>

            {editIsFuture && (
              <div className="grid gap-2 sm:col-span-2">
                <label htmlFor="e-gform" className="text-sm font-medium">
                  Google Form Link (optional)
                </label>
                <input
                  id="e-gform"
                  value={eGoogleForm}
                  onChange={(ev) => setEGoogleForm(ev.target.value)}
                  placeholder="https://forms.google.com/..."
                  className="glass rounded-md px-3 py-2"
                />
              </div>
            )}

            <div className="grid gap-2 sm:col-span-2">
              <label htmlFor="e-whatsapp" className="text-sm font-medium">
                WhatsApp Group Link (optional)
              </label>
              <input
                id="e-whatsapp"
                value={eWhatsAppLink}
                onChange={(e) => setEWhatsAppLink(e.target.value)}
                placeholder="https://chat.whatsapp.com/..."
                className="glass rounded-md px-3 py-2"
              />
            </div>

            {/* Team Size */}
            <div className="grid gap-2 sm:col-span-2">
              <label className="text-sm font-medium">Team Size (optional — leave blank for individual)</label>
              <div className="grid grid-cols-3 gap-2">
                <input type="number" min="1" max="20" value={eMinTeam} onChange={e => setEMinTeam(e.target.value)} placeholder="Min (e.g. 2)" className="glass rounded-md px-3 py-2" />
                <input type="number" min="1" max="20" value={eMaxTeam} onChange={e => setEMaxTeam(e.target.value)} placeholder="Max (e.g. 4)" className="glass rounded-md px-3 py-2" />
                <input type="text" value={eTeamLabel} onChange={e => setETeamLabel(e.target.value)} placeholder="Label (e.g. Team Name)" className="glass rounded-md px-3 py-2" />
              </div>
              <p className="text-xs text-muted-foreground">Min members · Max members · Label shown to registrants</p>
            </div>

            {/* Prize Pool */}
            <div className="grid gap-2 sm:col-span-2">
              <label className="text-sm font-medium flex items-center justify-between">
                <span className="flex items-center gap-2">🏆 Prize Pool (optional)</span>
                <Button type="button" size="sm" variant="outline" onClick={() => setEPrizePool([...ePrizePool, {position: "", amount: ""}])}>
                  + Add Position
                </Button>
              </label>
              {ePrizePool.length > 0 ? (
                <div className="space-y-2">
                  {ePrizePool.map((prize, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input 
                        placeholder="Position (e.g. 1st)"
                        className="glass rounded-md px-3 py-2 flex-1"
                        value={prize.position}
                        onChange={e => {
                          const newPool = [...ePrizePool]
                          newPool[idx].position = e.target.value
                          setEPrizePool(newPool)
                        }}
                      />
                      <input 
                        placeholder="Prize (e.g. ₹5,000)"
                        className="glass rounded-md px-3 py-2 flex-1"
                        value={prize.amount}
                        onChange={e => {
                          const newPool = [...ePrizePool]
                          newPool[idx].amount = e.target.value
                          setEPrizePool(newPool)
                        }}
                      />
                      <Button type="button" variant="destructive" size="icon" onClick={() => setEPrizePool(ePrizePool.filter((_, i) => i !== idx))}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                 <p className="text-xs text-muted-foreground">No prize pool added.</p>
              )}
            </div>

            {/* Registration Start Time */}
            <div className="grid gap-2 sm:col-span-2">
              <label htmlFor="e-reg-start" className="text-sm font-medium">
                Registration Start Time (optional)
              </label>
              <input
                id="e-reg-start"
                type="datetime-local"
                value={eRegistrationStart}
                onChange={(e) => setERegistrationStart(e.target.value)}
                className="glass rounded-md px-3 py-2"
              />
              <p className="text-xs text-muted-foreground">If set, users cannot register until this time.</p>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={!editCanSave}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) setPendingDeleteId(null)
        }}
      >
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete This Event?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected event will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={deleteEvent}
            >
              Delete
            </AlertDialogAction>
          </AlertFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </main>
  )
}
