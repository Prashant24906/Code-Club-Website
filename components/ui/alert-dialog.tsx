"use client"

import React, { useEffect } from "react"
import { clsx } from "clsx"
import { Button } from "./button"

interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    if (open) document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [open, onOpenChange])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative z-50 w-full max-w-md mx-4">{children}</div>
    </div>
  )
}

export function AlertDialogContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("bg-card border border-border rounded-xl shadow-2xl p-6", className)}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </div>
  )
}

export function AlertDialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("flex flex-col space-y-2 mb-4", className)} {...props} />
}

export function AlertDialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={clsx("text-lg font-semibold text-foreground", className)} {...props} />
}

export function AlertDialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={clsx("text-sm text-muted-foreground", className)} {...props} />
}

export function AlertDialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("flex items-center justify-end gap-2 mt-4", className)} {...props} />
}

export function AlertDialogAction({ className, children, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button className={className} onClick={onClick} {...props}>
      {children}
    </Button>
  )
}

export function AlertDialogCancel({ className, children, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button variant="outline" className={className} onClick={onClick} {...props}>
      {children || "Cancel"}
    </Button>
  )
}
