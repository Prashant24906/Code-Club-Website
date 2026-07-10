"use client"

import React from "react"
import { clsx } from "clsx"

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
  id?: string
}

export function Switch({ checked, onCheckedChange, className, id }: SwitchProps) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={clsx(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
        checked ? "bg-primary" : "bg-muted",
        className
      )}
    >
      <span
        className={clsx(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  )
}
