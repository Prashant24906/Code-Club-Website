"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AdminNavbar } from "@/components/admin-navbar"
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
import { CalendarIcon } from "lucide-react"
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
  const [aImage, setAImage] = useState<string | undefined>(undefined)
  const [aImageRatio, setAImageRatio] = useState<EventImageRatio>("portrait")

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [eTitle, setETitle] = useState("")
  const [eDate, setEDate] = useState("")
  const [eLocation, setELocation] = useState("")
  const [eDescription, setEDescription] = useState("")
  const [eGoogleForm, setEGoogleForm] = useState("")
  const [eImage, setEImage] = useState<string | undefined>(undefined)
  const [eImageRatio, setEImageRatio] = useState<EventImageRatio>("portrait")

  const [addCropOpen, setAddCropOpen] = useState(false)
  const [addCropSrc, setAddCropSrc] = useState<string | null>(null)
  const [editCropOpen, setEditCropOpen] = useState(false)
  const [editCropSrc, setEditCropSrc] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

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
      image: aImage || "",
      googleFormLink: aGoogleForm.trim() || undefined,
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
      image: eImage || "",
      googleFormLink: eGoogleForm.trim() || undefined,
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
    setAImage(undefined)
    setAImageRatio("portrait")
  }
  function resetEditForm() {
    setEditingId(null)
    setETitle("")
    setEDate("")
    setELocation("")
    setEDescription("")
    setEGoogleForm("")
    setEImage(undefined)
    setEImageRatio("portrait")
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
    setEImage(event.image || "")
    setEImageRatio("portrait")
    setEditOpen(true)
  }

  const ratioAspect = (ratio: EventImageRatio) => (ratio === "square" ? 1 : 3 / 4)
  const ratioOutput = (ratio: EventImageRatio) =>
    ratio === "square" ? { w: 1080, h: 1080 } : { w: 1080, h: 1440 }

  return (
    <main className="mx-auto max-w-5xl px-4 pt-24 pb-8">
      <AdminNavbar />
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
            {events.map((e) => (
              <div key={e._id} className="rounded-lg border border-border overflow-hidden bg-background/50">
                <div className="relative w-full bg-muted/30 overflow-hidden aspect-[3/4]">
                  {e.image ? (
                    <img
                      src={e.image || "/placeholder.svg"}
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
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openEdit(e)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => openDeleteDialog(e._id!)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="glass-card rounded-xl p-6">
        <h2 className="mb-4 text-lg font-semibold">Add New Event</h2>
        <div
          {...getAddRootProps()}
          className={`mb-4 rounded-lg border border-dashed p-6 text-center transition ${
            addDragActive ? "bg-accent/10 border-accent" : "bg-background/50"
          }`}
        >
          <input {...getAddInputProps()} />
          <div className="mb-3 flex items-center justify-center gap-2">
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
          {aImage ? (
            <div className="flex flex-col items-center gap-3">
              <div
                className={`relative w-full rounded-md overflow-hidden ${
                  aImageRatio === "square" ? "aspect-square" : "aspect-[3/4]"
                }`}
              >
                <img
                  src={aImage || "/placeholder.svg"}
                  loading="lazy"
                  alt="Selected event"
                  className="absolute inset-0 h-full w-full object-contain p-2"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={(e) => {
                    e.preventDefault()
                    if (aImage) {
                      setAddCropSrc(aImage)
                      setAddCropOpen(true)
                    }
                  }}
                >
                  Edit Crop
                </Button>
                <label className="sr-only" htmlFor="add-image-input">
                  Replace image
                </label>
                <input
                  id="add-image-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(ev) => {
                    const file = ev.target.files?.[0]
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
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById("add-image-input")?.click()
                  }}
                >
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={(e) => {
                    e.preventDefault()
                    setAImage(undefined)
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Upload event image</p>
              <p>Preferred ratio: 1:1 or 3:4</p>
              <p>Drag & drop here, or click to select</p>
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
        src={addCropSrc || "/placeholder.svg?height=512&width=512&query=event%20thumbnail"} // Fallback to placeholder
        onCropped={(dataUrl) => setAImage(dataUrl ?? "")} // Ensure a string is set
        aspect={ratioAspect(aImageRatio)}
        outputWidth={ratioOutput(aImageRatio).w}
        outputHeight={ratioOutput(aImageRatio).h}
      />
      <ImageCropperDialog
        open={editCropOpen}
        onOpenChange={setEditCropOpen}
        src={editCropSrc || "/placeholder.svg?height=512&width=512&query=event%20thumbnail"} // Fallback to placeholder
        onCropped={(dataUrl) => setEImage(dataUrl ?? "")} // Ensure a string is set
        aspect={ratioAspect(eImageRatio)}
        outputWidth={ratioOutput(eImageRatio).w}
        outputHeight={ratioOutput(eImageRatio).h}
      />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>

          <div
            {...getEditRootProps()}
            className={`mb-4 rounded-lg border border-dashed p-4 text-center transition ${
              editDragActive ? "bg-accent/10 border-accent" : "bg-background/50"
            }`}
          >
            <input {...getEditInputProps()} />
            <div className="mb-3 flex items-center justify-center gap-2">
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
            {eImage ? (
              <div className="flex flex-col items-center gap-3">
                <div
                  className={`relative w-full rounded-md overflow-hidden ${
                    eImageRatio === "square" ? "aspect-square" : "aspect-[3/4]"
                  }`}
                >
                  <img
                    src={eImage || "/placeholder.svg"} 
                    loading="lazy"
                    alt="Selected event"
                    className="absolute inset-0 h-full w-full object-contain p-2"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={(ev) => {
                      ev.preventDefault()
                      if (eImage) {
                        setEditCropSrc(eImage)
                        setEditCropOpen(true)
                      }
                    }}
                  >
                    Edit Crop
                  </Button>
                  <label className="sr-only" htmlFor="edit-image-input">
                    Replace image
                  </label>
                  <input
                    id="edit-image-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(ev) => {
                      const file = ev.target.files?.[0]
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
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(ev) => {
                      ev.preventDefault()
                      document.getElementById("edit-image-input")?.click()
                    }}
                  >
                    Replace
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={(ev) => {
                      ev.preventDefault()
                      setEImage(undefined)
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Upload event image</p>
                <p>Preferred ratio: 1:1 or 3:4</p>
                <p>Drag & drop here, or click to select</p>
              </div>
            )}
          </div>

          <div className="grid gap-4">
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
                <input
                  type="date"
                  value={eDate}
                  onChange={(e) => setEDate(e.target.value)}
                  className="absolute inset-0 cursor-pointer"
                  aria-label="Type or pick a date"
                />
              </div>
            </div>
            <div className="grid gap-2">
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
            <div className="grid gap-2">
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
              <div className="grid gap-2">
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
    </main>
  )
}
