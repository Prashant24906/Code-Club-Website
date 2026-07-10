"use client"

import React, { useEffect, useRef } from "react"
import { clsx } from "clsx"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    if (open) document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [open, onOpenChange])

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-lg">
        {children}
      </div>
    </div>
  )
}

export function DialogContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement> & { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div
      ref={ref}
      className={clsx(
        "relative bg-card border border-border rounded-xl shadow-2xl p-6 mx-4 max-h-[90vh] overflow-y-auto",
        className
      )}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </div>
  )
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("flex flex-col space-y-1.5 mb-4", className)} {...props} />
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={clsx("text-lg font-semibold text-foreground", className)} {...props} />
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={clsx("text-sm text-muted-foreground", className)} {...props} />
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("flex items-center justify-end gap-2 mt-6", className)} {...props} />
}
