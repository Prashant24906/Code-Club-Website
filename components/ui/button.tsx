"use client"

import { clsx } from "clsx"
import React from "react"

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive" | "link"
type ButtonSize = "default" | "sm" | "lg" | "icon"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  asChild?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground bg-transparent",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  link: "text-primary underline-offset-4 hover:underline bg-transparent",
}

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-9 px-4 py-2 text-sm",
  sm: "h-8 px-3 text-xs rounded-md",
  lg: "h-11 px-8 text-base",
  icon: "h-9 w-9",
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild, children, ...props }, ref) => {
    const cls = clsx(
      "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      "disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
      variantClasses[variant],
      sizeClasses[size],
      className
    )

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
        className: clsx((children as React.ReactElement<{ className?: string }>).props.className, cls),
      })
    }

    return (
      <button ref={ref} className={cls} {...props}>
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"
