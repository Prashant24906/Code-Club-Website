"use client"

/**
 * Global in-memory data cache for the Code Club site.
 *
 * On first mount (anywhere in the app) this provider fires parallel fetches
 * for members, events (page-1 upcoming + page-1 past), and communities.
 * All consuming components check the cache first; if data is already present
 * they render immediately with no loading state.
 *
 * A 5-minute TTL ensures stale data is refreshed automatically.
 */

import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from "react"

// ── Types ──────────────────────────────────────────────────────────────────────

export type Member = {
  _id: string
  name: string
  role: string
  department: string
  image: string
  isHead: boolean
}

export type Community = {
  _id: string
  id: string
  name: string
  description: string
  color: string
  members: string
  tags: string[]
  whatsappLink: string
  isMain: boolean
  iconName: string
}

export type ClubEvent = {
  _id: string
  image?: string
  images?: string[]
  title: string
  date: string
  description?: string
  location?: string
  googleFormLink?: string
  time?: string
}

export type EventsPage = {
  events: ClubEvent[]
  totalPages: number
  total: number
}

// ── Cache state shape ──────────────────────────────────────────────────────────

type CacheEntry<T> = { data: T; fetchedAt: number } | null

interface DataCache {
  members: CacheEntry<Member[]>
  communities: CacheEntry<Community[]>
  upcomingEvents: CacheEntry<EventsPage>
  pastEvents: CacheEntry<EventsPage>
}

interface DataCacheContextValue {
  cache: DataCache
  /** Manually invalidate and re-fetch the whole cache (e.g. after admin writes) */
  invalidate: () => void
}

// ── Context ────────────────────────────────────────────────────────────────────

const TTL_MS = 5 * 60 * 1_000 // 5 minutes

const DataCacheContext = createContext<DataCacheContextValue | null>(null)

function isFresh<T>(entry: CacheEntry<T>): entry is { data: T; fetchedAt: number } {
  return entry !== null && Date.now() - entry.fetchedAt < TTL_MS
}

// ── Provider ───────────────────────────────────────────────────────────────────

export function DataCacheProvider({ children }: { children: ReactNode }) {
  const [cache, setCache] = useState<DataCache>({
    members: null,
    communities: null,
    upcomingEvents: null,
    pastEvents: null,
  })

  // Prevent duplicate concurrent fetches
  const fetching = useRef(false)

  const prefetch = useCallback(async () => {
    if (fetching.current) return
    fetching.current = true
    try {
      const [membersRes, communitiesRes, upcomingRes, pastRes] = await Promise.allSettled([
        fetch("/api/members").then((r) => r.json()),
        fetch("/api/communities").then((r) => r.json()),
        fetch("/api/events?page=1&limit=8&type=upcoming").then((r) => r.json()),
        fetch("/api/events?page=1&limit=8&type=past").then((r) => r.json()),
      ])

      const now = Date.now()

      setCache({
        members:
          membersRes.status === "fulfilled" && Array.isArray(membersRes.value)
            ? { data: membersRes.value, fetchedAt: now }
            : null,

        communities:
          communitiesRes.status === "fulfilled" && Array.isArray(communitiesRes.value)
            ? { data: communitiesRes.value, fetchedAt: now }
            : null,

        upcomingEvents:
          upcomingRes.status === "fulfilled" && upcomingRes.value?.events
            ? { data: upcomingRes.value, fetchedAt: now }
            : null,

        pastEvents:
          pastRes.status === "fulfilled" && pastRes.value?.events
            ? { data: pastRes.value, fetchedAt: now }
            : null,
      })
    } finally {
      fetching.current = false
    }
  }, [])

  // Fire prefetch once on mount
  useEffect(() => {
    prefetch()
  }, [prefetch])

  const invalidate = useCallback(() => {
    setCache({ members: null, communities: null, upcomingEvents: null, pastEvents: null })
    fetching.current = false
    prefetch()
  }, [prefetch])

  return (
    <DataCacheContext.Provider value={{ cache, invalidate }}>
      {children}
    </DataCacheContext.Provider>
  )
}

// ── Consumer hook ──────────────────────────────────────────────────────────────

export function useDataCache() {
  const ctx = useContext(DataCacheContext)
  if (!ctx) throw new Error("useDataCache must be used inside <DataCacheProvider>")
  return ctx
}

/** Returns cached members if fresh, or null if not yet ready */
export function useCachedMembers() {
  const { cache } = useDataCache()
  return isFresh(cache.members) ? cache.members.data : null
}

/** Returns cached communities if fresh, or null if not yet ready */
export function useCachedCommunities() {
  const { cache } = useDataCache()
  return isFresh(cache.communities) ? cache.communities.data : null
}

/** Returns cached events page-1 data if fresh, or null if not yet ready */
export function useCachedEvents() {
  const { cache } = useDataCache()
  return {
    upcoming: isFresh(cache.upcomingEvents) ? cache.upcomingEvents.data : null,
    past: isFresh(cache.pastEvents) ? cache.pastEvents.data : null,
  }
}
