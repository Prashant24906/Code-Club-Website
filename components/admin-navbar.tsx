"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Code2, Menu, X, Moon, Sun } from "lucide-react"

export function AdminNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isDark, setIsDark] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
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
    { name: "Dashboard", href: "/admin" },
    { name: "Members", href: "/admin/members" },
    { name: "Events", href: "/admin/events" },
    { name: "Quizzes", href: "/admin/quizzes" },
  ]

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
    return pathname?.startsWith(href)
  }

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
        <Link href="/admin" className="flex items-center space-x-2" aria-label="Admin home">
          <Code2 className="h-6 w-6 text-cyan-400" />
          <span className="text-lg font-bold gradient-text">Admin</span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors duration-200 hover:scale-105 transform ${
                isActive(item.href) ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
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
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Link href="/" aria-label="Back to site">
            <Button
              variant="outline"
              size="sm"
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 bg-transparent"
            >
              Back to Site
            </Button>
          </Link>
        </div>

        <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsOpen(!isOpen)} aria-label="Menu">
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

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
              className={`block py-2 text-sm font-medium transition-colors ${
                isActive(item.href) ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
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
            <Link href="/" onClick={() => setIsOpen(false)}>
              <Button variant="outline" size="sm">
                Back to Site
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}

export default AdminNavbar
