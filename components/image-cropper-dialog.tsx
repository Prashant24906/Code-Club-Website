"use client"

import { useCallback, useEffect, useState } from "react"
import Cropper from "react-easy-crop"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  src: string
  onCropped: (dataUrl: string) => void
  // optional controlled zoom
  zoom?: number
  setZoom?: (v: number) => void
  aspect?: number
  outputWidth?: number
  outputHeight?: number
}

type Area = {
  x: number
  y: number
  width: number
  height: number
}

export default function ImageCropperDialog({
  open,
  onOpenChange,
  src,
  onCropped,
  zoom: zoomProp,
  setZoom: setZoomProp,
  aspect = 1,
  outputWidth,
  outputHeight,
}: Props) {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [uncontrolledZoom, setUncontrolledZoom] = useState(1)
  const zoom = zoomProp ?? uncontrolledZoom
  const setZoom = setZoomProp ?? setUncontrolledZoom
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  useEffect(() => {
    // Reset position/zoom when a new image is provided
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
  }, [src])

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels)
  }, [])

  async function handleCrop() {
    if (!src || !croppedAreaPixels) return
    try {
      const defaultW = aspect === 1 ? 512 : 1280
      const outW = outputWidth ?? defaultW
      const outH = outputHeight ?? Math.round(outW / aspect)
      const dataUrl = await getCroppedImage(src, croppedAreaPixels, outW, outH)
      onCropped(dataUrl)
      onOpenChange(false)
    } catch (e) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card rounded-xl">
        <DialogHeader>
          <DialogTitle>
            Crop Image ({aspect === 1 ? "1:1" : aspect === 3 / 4 ? "3:4" : aspect === 16 / 9 ? "16:9" : "Custom"})
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="relative h-72 w-full overflow-hidden rounded-md border bg-muted/20">
            <Cropper
              image={src || "/placeholder-image.png"}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={(z: number) => setZoom(z)}
              onCropComplete={onCropComplete}
              cropShape="rect"
              showGrid={false}
              objectFit="contain"
              restrictPosition={true}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="zoom">Zoom</Label>
            <Input
              id="zoom"
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number.parseFloat(e.target.value))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="bg-cyan-600 hover:bg-cyan-700" onClick={handleCrop}>
            Crop & Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

async function getCroppedImage(
  imageSrc: string,
  pixelArea: Area,
  outputWidth: number,
  outputHeight: number,
): Promise<string> {
  const img = await loadImage(imageSrc)
  const canvas = document.createElement("canvas")
  canvas.width = outputWidth
  canvas.height = outputHeight
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas not supported")

  const { x, y, width, height } = pixelArea
  // Draw the selected crop area scaled to the output canvas
  ctx.drawImage(img, x, y, width, height, 0, 0, outputWidth, outputHeight)

  return canvas.toDataURL("image/png")
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
