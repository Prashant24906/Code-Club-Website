"use client"

import React, { useState } from "react"
import { clsx } from "clsx"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CalendarProps {
  mode?: "single"
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  defaultMonth?: Date
  initialFocus?: boolean
  className?: string
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

export function Calendar({ selected, onSelect, defaultMonth, className }: CalendarProps) {
  const today = new Date()
  const [viewDate, setViewDate] = useState<Date>(defaultMonth || selected || today)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

  const handleSelect = (day: number) => {
    const date = new Date(year, month, day)
    onSelect?.(date)
  }

  const isSelected = (day: number) => {
    if (!selected) return false
    return (
      selected.getFullYear() === year &&
      selected.getMonth() === month &&
      selected.getDate() === day
    )
  }

  const isToday = (day: number) => {
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    )
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className={clsx("p-3 bg-popover border border-border rounded-md w-[280px]", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1 rounded hover:bg-accent transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">
          {MONTHS[month]} {year}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1 rounded hover:bg-accent transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) =>
          day === null ? (
            <div key={`empty-${i}`} />
          ) : (
            <button
              key={day}
              type="button"
              onClick={() => handleSelect(day)}
              className={clsx(
                "h-8 w-8 mx-auto rounded-full text-sm transition-colors flex items-center justify-center",
                isSelected(day) && "bg-primary text-primary-foreground",
                isToday(day) && !isSelected(day) && "border border-primary text-primary",
                !isSelected(day) && "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {day}
            </button>
          )
        )}
      </div>
    </div>
  )
}
