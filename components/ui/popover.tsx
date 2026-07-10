"use client"

import React, { useState, useRef, useEffect } from "react"
import { clsx } from "clsx"

interface PopoverProps {
  children: React.ReactNode
}

interface PopoverContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const PopoverContext = React.createContext<PopoverContextValue>({
  open: false,
  setOpen: () => {},
})

export function Popover({ children }: PopoverProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className="relative inline-block w-full">
        {children}
      </div>
    </PopoverContext.Provider>
  )
}

export function PopoverTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) {
  const { open, setOpen } = React.useContext(PopoverContext)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: () => setOpen(!open),
    })
  }

  return (
    <button type="button" onClick={() => setOpen(!open)}>
      {children}
    </button>
  )
}

export function PopoverContent({
  className,
  align = "center",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "center" | "end" }) {
  const { open } = React.useContext(PopoverContext)
  if (!open) return null

  const alignClass = align === "start" ? "left-0" : align === "end" ? "right-0" : "left-1/2 -translate-x-1/2"

  return (
    <div
      className={clsx(
        "absolute z-50 mt-1 rounded-md border border-border bg-popover shadow-lg",
        alignClass,
        className
      )}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </div>
  )
}
