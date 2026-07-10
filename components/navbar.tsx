"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Menu, X, Moon, Sun } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const theme = localStorage.getItem("theme") || "dark"
    setIsDark(theme === "dark")
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [])

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark"
    setIsDark(!isDark)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const navItems = [
    { name: "About", href: "#about" },
    { name: "Members", href: "#members" },
    { name: "Events", href: "#events" },
    { name: "Quiz", href: "/quiz" },
    { name: "Contact", href: "#contact" },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-4 z-50 transition-all duration-500 ${
        scrolled
          ? "left-10 right-10 md:left-44 md:right-44 bg-white dark:bg-gray-900 rounded-xl px-6 py-3 border border-slate-300/70 dark:border-white/10 shadow-lg shadow-slate-900/5 dark:shadow-black/30"
          : "left-8 right-8 md:left-36 md:right-36 bg-white dark:bg-gray-900 rounded-xl px-6 py-3 border border-slate-300/70 dark:border-white/10 shadow-lg shadow-slate-900/5 dark:shadow-black/30"
      }`}
    >
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/codeclub1.png" alt="CoDE" width={52} height={52} className="nav-logo shadow-2xl" />
          <span className="text-lg font-bold gradient-text">CoDE</span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 hover:scale-105 transform"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Link href="/admin">
            <Button
              variant="outline"
              size="sm"
              className="border-primary/50 text-primary hover:bg-primary/10 bg-transparent"
            >
              Admin
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden mt-4 pt-4 border-t border-border"
        >
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground"
            >
              {isDark ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
              {isDark ? "Light" : "Dark"}
            </Button>
            <Link href="/admin">
              <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                Admin
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}
