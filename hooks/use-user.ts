"use client"

import { useState, useEffect, useCallback } from "react"

export interface AuthUser {
  id: string
  email: string
  username: string
  fullName: string
  year: string
  department: string
  division: string
}


export function useUser() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/user/me")
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()

    // Sync auth state across different components using this hook
    const handleAuthChange = () => refetch()
    window.addEventListener("auth-change", handleAuthChange)
    return () => window.removeEventListener("auth-change", handleAuthChange)
  }, [refetch])

  const logout = useCallback(async () => {
    await fetch("/api/user/logout", { method: "POST" })
    setUser(null)
    // Notify other components (like Hero) to update
    window.dispatchEvent(new Event("auth-change"))
  }, [])

  return { user, loading, refetch, logout }
}
