"use client"
import AdminNavbar from "@/components/admin-navbar"
import { useDropzone } from "react-dropzone"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter as AlertFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ImageCropperDialog from "@/components/image-cropper-dialog"
import Image from "next/image"
import Link from "next/link"
import { uploadMemberImage } from "@/lib/uploadthing"

import { useEffect, useState, useMemo } from "react"

type Member = {
  _id: string
  name: string
  role: string
  department: string
  image: string
  isHead: boolean
}

const DEFAULT_DEPARTMENTS = [
  "Core Leadership",
  "Tech",
  "Marketing",
  "Documentation",
  "Logistics",
  "Design Department",
] as const

export default function MembersAdminPage() {
  const [members, setMembers] = useState<Member[]>([])

  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [deptOptions, setDeptOptions] = useState<string[]>([...DEFAULT_DEPARTMENTS])
  const [department, setDepartment] = useState<string>(DEFAULT_DEPARTMENTS[0])
  const [addingCustomDept, setAddingCustomDept] = useState(false)
  const [customDept, setCustomDept] = useState("")
  const [image, setImage] = useState<string | undefined>(undefined)
  const [isHead, setIsHead] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
  const [eName, setEName] = useState("")
  const [eRole, setERole] = useState("")
  const [eDepartment, setEDepartment] = useState<string>(DEFAULT_DEPARTMENTS[0])
  const [eAddingCustomDept, setEAddingCustomDept] = useState(false)
  const [eCustomDept, setECustomDept] = useState("")
  const [eImage, setEImage] = useState<string | undefined>(undefined)
  const [eIsHead, setEIsHead] = useState(false)

  const [addCropOpen, setAddCropOpen] = useState(false)
  const [addCropSrc, setAddCropSrc] = useState<string | null>(null)
  const [addZoom, setAddZoom] = useState(1)

  const [editCropOpen, setEditCropOpen] = useState(false)
  const [editCropSrc, setEditCropSrc] = useState<string | null>(null)
  const [editZoom, setEditZoom] = useState(1)

  const [isUploading, setIsUploading] = useState(false)
  const [editIsUploading, setEditIsUploading] = useState(false)
  const [alertState, setAlertState] = useState({
    open: false,
    title: "",
    description: "",
  })
  const openAlert = (title: string, description: string) => {
    setAlertState({ open: true, title, description })
  }

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch("/api/members")
        const data = await res.json()
        setMembers(data)
        const existingDepts = Array.from(new Set(data.map((m: Member) => m.department).filter(Boolean) as string[]))
        if (existingDepts.length) {
          setDeptOptions((prev) => Array.from(new Set([...prev, ...existingDepts])))
        }
      } catch (err) {
        console.error("Failed to fetch members:", err)
      }
    }
    fetchMembers()
  }, [])

  const canAdd = useMemo(
    () =>
      name.trim().length > 1 &&
      role.trim().length > 1 &&
      (addingCustomDept ? customDept.trim() : department.trim()) &&
      image,
    [name, role, department, addingCustomDept, customDept, image]
  )

  function resetAddForm() {
    setName("")
    setRole("")
    setDepartment(DEFAULT_DEPARTMENTS[0])
    setAddingCustomDept(false)
    setCustomDept("")
    setImage(undefined)
    setIsHead(false)
  }

  async function addMember() {
    if (!canAdd || !image) return
    const finalDept = addingCustomDept ? customDept.trim() : department
    if (addingCustomDept && finalDept && !deptOptions.includes(finalDept)) {
      setDeptOptions((prev) => [...prev, finalDept])
    }

    try {
      setIsUploading(true)
      // Convert data URL to blob and upload to UploadThing
      const response = await fetch(image)
      const blob = await response.blob()
      const file = new File([blob], "member-image.jpg", { type: "image/jpeg" })
      const imageUrl = await uploadMemberImage(file)

      const newMember = { name: name.trim(), role: role.trim(), department: finalDept, image: imageUrl, isHead }

      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMember),
      })
      const createdMember = await res.json()
      setMembers((prev) => [...prev, createdMember])
      resetAddForm()
    } catch (err) {
      console.error("Error adding member:", err)
      openAlert("Add Member Failed", "Failed to upload image or add member.")
    } finally {
      setIsUploading(false)
    }
  }

  async function removeMember(id: string) {
    try {
      await fetch("/api/members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      setMembers((prev) => prev.filter((m) => m._id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const onAddDrop = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAddCropSrc(reader.result)
        setAddCropOpen(true)
      }
    }
    reader.readAsDataURL(file)
  }

  const { getRootProps: getAddRootProps, getInputProps: getAddInputProps } = useDropzone({
    onDrop: (files) => onAddDrop(files?.[0]),
    multiple: false,
    accept: { "image/*": [] },
  })

  const openEditDialog = (member: Member) => {
    setEditingMemberId(member._id)
    setEName(member.name)
    setERole(member.role)
    setEDepartment(member.department || DEFAULT_DEPARTMENTS[0])
    setEImage(member.image)
    setEIsHead(member.isHead)
    setEAddingCustomDept(false)
    setECustomDept("")
    setEditOpen(true)
  }

  const resetEditForm = () => {
    setEditingMemberId(null)
    setEName("")
    setERole("")
    setEDepartment(DEFAULT_DEPARTMENTS[0])
    setEAddingCustomDept(false)
    setECustomDept("")
    setEImage(undefined)
    setEIsHead(false)
  }

  const saveEdit = async () => {
    if (!editingMemberId || !eName.trim() || !eRole.trim() || !(eAddingCustomDept ? eCustomDept.trim() : eDepartment.trim())) return
    const finalDept = eAddingCustomDept ? eCustomDept.trim() : eDepartment
    if (eAddingCustomDept && finalDept && !deptOptions.includes(finalDept)) {
      setDeptOptions((prev) => [...prev, finalDept])
    }

    try {
      setEditIsUploading(true)
      // Check if image is a new data URL (not a URL from UploadThing)
      let finalImageUrl = eImage
      if (eImage && eImage.startsWith("data:")) {
        const response = await fetch(eImage)
        const blob = await response.blob()
        const file = new File([blob], "member-image.jpg", { type: "image/jpeg" })
        finalImageUrl = await uploadMemberImage(file)
      }

      const updatedMember = { name: eName.trim(), role: eRole.trim(), department: finalDept, image: finalImageUrl, isHead: eIsHead }

      const res = await fetch("/api/members", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingMemberId, ...updatedMember }),
      })
      const updated = await res.json()
      setMembers((prev) => prev.map((m) => (m._id === editingMemberId ? updated : m)))
      setEditOpen(false)
      resetEditForm()
    } catch (err) {
      console.error("Error saving member:", err)
      openAlert("Update Failed", "Failed to update member.")
    } finally {
      setEditIsUploading(false)
    }
  }

  const onEditDrop = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setEditCropSrc(reader.result)
        setEditCropOpen(true)
      }
    }
    reader.readAsDataURL(file)
  }

  const { getRootProps: getEditRootProps, getInputProps: getEditInputProps } = useDropzone({
    onDrop: (files) => onEditDrop(files?.[0]),
    multiple: false,
    accept: { "image/*": [] },
  })

  const canEdit = useMemo(
    () =>
      eName.trim().length > 1 &&
      eRole.trim().length > 1 &&
      (eAddingCustomDept ? eCustomDept.trim() : eDepartment.trim()) &&
      eImage,
    [eName, eRole, eDepartment, eAddingCustomDept, eCustomDept, eImage]
  )

  return (
    <main className="mx-auto max-w-5xl px-4 pt-24 pb-8">
      <AdminNavbar />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Manage Members</h1>
        <Button asChild variant="outline">
          <Link href="/admin">← Back to Admin</Link>
        </Button>
      </div>

      {/* Members List */}
      <Card className="glass-card rounded-xl p-6 mb-8">
        <h2 className="mb-4 text-lg font-semibold">Members</h2>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No members yet. Use the form below to add new members.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((m) => (
              <Card key={m._id} className="glass-card p-4">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3">
                    <Image
                      src={m.image}
                      loading="lazy"
                      alt={`${m.name} avatar`}
                      width={64}
                      height={64}
                      className="rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{m.name}</div>
                      <div className="truncate text-sm text-muted-foreground">{m.role}</div>
                      <div className="truncate text-xs text-muted-foreground/80">
                        {m.department || "—"} {m.isHead ? "• Head" : ""}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openEditDialog(m)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => removeMember(m._id)}>
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Card>
      {/* Add Member Form */}
      <Card className="glass-card rounded-xl p-6">
        <h2 className="mb-4 text-lg font-semibold">Add Member</h2>
        <div className="grid gap-6">
          <div {...getAddRootProps({ className: "mx-auto w-full max-w-sm rounded-lg border-2 border-dashed p-4 text-center cursor-pointer" })}>
            <input {...getAddInputProps()} />
            {image ? (
              <div className="relative w-56 overflow-hidden rounded-md" style={{ paddingTop: "100%" }}>
                <Image src={image} alt="Uploaded preview" fill className="absolute inset-0 h-full w-full object-cover" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Drag & drop here, or click to select</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className="glass" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Team Member" className="glass" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Department</Label>
            <Select
              value={addingCustomDept ? "__custom__" : department}
              onValueChange={(v) => {
                if (v === "__custom__") setAddingCustomDept(true)
                else {
                  setAddingCustomDept(false)
                  setDepartment(v)
                }
              }}
            >
              <SelectTrigger className="glass">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {deptOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
                <SelectItem value="__custom__">+ Add new department</SelectItem>
              </SelectContent>
            </Select>
            {addingCustomDept && <Input value={customDept} onChange={(e) => setCustomDept(e.target.value)} placeholder="Type new department" className="glass" />}
          </div>

          <div className="grid gap-2">
            <Label>Department Head/Lead</Label>
            <Select value={isHead ? "yes" : "no"} onValueChange={(v) => setIsHead(v === "yes")}>
              <SelectTrigger className="glass"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4">
          <Button onClick={addMember} disabled={!canAdd || isUploading} className="bg-cyan-600 hover:bg-cyan-700">
            {isUploading ? "Uploading..." : "Add Member"}
          </Button>
        </div>
      </Card>

      <ImageCropperDialog
        open={addCropOpen}
        onOpenChange={setAddCropOpen}
        src={addCropSrc || "/placeholder.svg"}
        onCropped={(dataUrl) => {
          setImage(dataUrl ?? "")
          setAddCropOpen(false)
        }}
        zoom={addZoom}
        setZoom={setAddZoom}
        aspect={1}
        outputWidth={512}
        outputHeight={512}
      />

      <Dialog open={editOpen} onOpenChange={(v) => !v && setEditOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Member</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6">
            <div {...getEditRootProps({ className: "mx-auto w-full max-w-sm rounded-lg border-2 border-dashed p-4 text-center cursor-pointer" })}>
              <input {...getEditInputProps()} />
              {eImage ? (
                <div className="relative w-56 overflow-hidden rounded-md" style={{ paddingTop: "100%" }}>
                  <Image src={eImage} alt="Uploaded preview" fill className="absolute inset-0 h-full w-full object-cover" />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Drag & drop here, or click to select</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2"><Label>Name</Label><Input value={eName} onChange={(e) => setEName(e.target.value)} className="glass" /></div>
              <div className="grid gap-2"><Label>Role</Label><Input value={eRole} onChange={(e) => setERole(e.target.value)} className="glass" /></div>
            </div>

            <div className="grid gap-2">
              <Label>Department</Label>
              <Select value={eAddingCustomDept ? "__custom__" : eDepartment} onValueChange={(v) => {
                if (v === "__custom__") setEAddingCustomDept(true)
                else { setEAddingCustomDept(false); setEDepartment(v) }
              }}>
                <SelectTrigger className="glass"><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {deptOptions.map((opt) => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}
                  <SelectItem value="__custom__">+ Add new department</SelectItem>
                </SelectContent>
              </Select>
              {eAddingCustomDept && <Input value={eCustomDept} onChange={(e) => setECustomDept(e.target.value)} placeholder="Type new department" className="glass" />}
            </div>

            <div className="grid gap-2">
              <Label>Department Head/Lead</Label>
              <Select value={eIsHead ? "yes" : "no"} onValueChange={(v) => setEIsHead(v === "yes")}>
                <SelectTrigger className="glass"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-4 flex justify-between">
            <Button variant="outline" onClick={() => { setEditOpen(false); resetEditForm() }}>Cancel</Button>
            <Button onClick={saveEdit} disabled={!canEdit || editIsUploading}>{editIsUploading ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImageCropperDialog
        open={editCropOpen}
        onOpenChange={setEditCropOpen}
        src={editCropSrc || "/placeholder.svg"}
        onCropped={(dataUrl) => {
          setEImage(dataUrl ?? "")
          setEditCropOpen(false)
        }}
        zoom={editZoom}
        setZoom={setEditZoom}
        aspect={1}
        outputWidth={512}
        outputHeight={512}
      />
      <AlertDialog
        open={alertState.open}
        onOpenChange={(open) => setAlertState((prev) => ({ ...prev, open }))}
      >
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle>{alertState.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertState.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
