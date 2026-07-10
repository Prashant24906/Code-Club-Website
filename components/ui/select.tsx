"use client"

import React, { useState, useRef, useEffect } from "react"
import { clsx } from "clsx"
import { ChevronDown } from "lucide-react"

interface SelectProps {
  value: string
  onValueChange: (val: string) => void
  children: React.ReactNode
}

interface SelectContextValue {
  value: string
  onValueChange: (val: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  displayLabel: string
  setDisplayLabel: (label: string) => void
}

const SelectContext = React.createContext<SelectContextValue>({
  value: "",
  onValueChange: () => {},
  open: false,
  setOpen: () => {},
  displayLabel: "",
  setDisplayLabel: () => {},
})

export function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = useState(false)
  const [displayLabel, setDisplayLabel] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, displayLabel, setDisplayLabel }}>
      <div ref={ref} className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ className, children }: { className?: string; children: React.ReactNode }) {
  const { open, setOpen } = React.useContext(SelectContext)
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={clsx(
        "flex w-full items-center justify-between rounded-md border border-border px-3 py-2",
        "bg-background text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "cursor-pointer hover:bg-accent/50 transition-colors",
        className
      )}
    >
      {children}
      <ChevronDown className={clsx("h-4 w-4 opacity-50 transition-transform duration-200", open && "rotate-180")} />
    </button>
  )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const { displayLabel } = React.useContext(SelectContext)
  return <span className={clsx(!displayLabel && "text-muted-foreground")}>{displayLabel || placeholder || "Select..."}</span>
}

export function SelectContent({ className, children }: { className?: string; children: React.ReactNode }) {
  const { open } = React.useContext(SelectContext)
  if (!open) return null
  return (
    <div
      className={clsx(
        "absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg",
        "max-h-60 overflow-y-auto",
        className
      )}
    >
      <div className="py-1">{children}</div>
    </div>
  )
}

export function SelectItem({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(SelectContext)
  const isSelected = ctx.value === value

  const handleClick = () => {
    ctx.onValueChange(value)
    ctx.setDisplayLabel(typeof children === "string" ? children : value)
    ctx.setOpen(false)
  }

  useEffect(() => {
    if (isSelected && typeof children === "string") {
      ctx.setDisplayLabel(children)
    }
  }, [isSelected, children])

  return (
    <button
      type="button"
      onClick={handleClick}
      className={clsx(
        "flex w-full items-center px-3 py-2 text-sm cursor-pointer hover:bg-accent transition-colors",
        isSelected && "bg-accent/50 font-medium",
        className
      )}
    >
      {children}
    </button>
  )
}
