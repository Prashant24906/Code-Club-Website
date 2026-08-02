"use client"

/**
 * Global in-memory data cache for the Code Club site.
 *
 * Fetch strategy (all fire simultaneously on mount):
 *
 *  Phase 1 — simultaneous:
 *    ① GET /api/members?department=Core Leadership   (fast, ~5 docs — instant leadership render)
 *    ② GET /api/members?isHead=true                  (fast, ~10 docs — instant leadership render)
 *    ③ GET /api/communities
 *    ④ GET /api/events?type=upcoming
 *    ⑤ GET /api/events?type=past
 *
 *  Phase 2 — single call (fires after Phase 1 resolves):
 *    GET /api/members  → all members in one DB query, grouped client-side into membersByDept
 *
 *  Previously Phase 2 called /api/members/departments then fired N per-dept fetches
 *  (N+1 HTTP requests, 2 serial round-trips). One call saves N–1 requests and 1 RTT.
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
  /** Core Leadership members + all isHead leads — available fast from Phase 1 */
  membersLeadership: CacheEntry<Member[]>
  /**
   * All members grouped by department name.
   * Populated department-by-department as Phase 2 fetches complete.
   * { "Core Leadership": [...], "Tech": [...], "Design": [...] }
   */
  membersByDept: CacheEntry<Record<string, Member[]>>
  communities: CacheEntry<Community[]>
  upcomingEvents: CacheEntry<EventsPage>
  pastEvents: CacheEntry<EventsPage>
}

interface DataCacheContextValue {
  cache: DataCache
  setCache: React.Dispatch<React.SetStateAction<DataCache>>
  invalidate: () => void
}

// ── Context ────────────────────────────────────────────────────────────────────

const TTL_MS = 5 * 60 * 1_000 // 5 minutes

const DataCacheContext = createContext<DataCacheContextValue | null>(null)

export function isFresh<T>(entry: CacheEntry<T>): entry is { data: T; fetchedAt: number } {
  return entry !== null && Date.now() - entry.fetchedAt < TTL_MS
}

const EMPTY_CACHE: DataCache = {
  membersLeadership: null,
  membersByDept: null,
  communities: null,
  upcomingEvents: null,
  pastEvents: null,
}

// ── Provider ───────────────────────────────────────────────────────────────────

export function DataCacheProvider({ children }: { children: ReactNode }) {
  const [cache, setCache] = useState<DataCache>(EMPTY_CACHE)
  const fetching = useRef(false)

  const prefetch = useCallback(async () => {
    if (fetching.current) return
    fetching.current = true

    try {
      // ── Phase 1: all fire simultaneously ──────────────────────────────────
      const [coreRes, headsRes, communitiesRes, upcomingRes, pastRes] =
        await Promise.allSettled([
          fetch("/api/members?department=Core Leadership").then((r) => r.json()),
          fetch("/api/members?isHead=true").then((r) => r.json()),
          fetch("/api/communities").then((r) => r.json()),
          fetch("/api/events?page=1&limit=8&type=upcoming").then((r) => r.json()),
          fetch("/api/events?page=1&limit=8&type=past").then((r) => r.json()),
        ])

      const now = Date.now()

      // Build leadership slice (Core Leadership + all isHead leads, deduped)
      const coreList: Member[] = coreRes.status === "fulfilled" && Array.isArray(coreRes.value) ? coreRes.value : []
      const headsList: Member[] = headsRes.status === "fulfilled" && Array.isArray(headsRes.value) ? headsRes.value : []
      const leadershipIds = new Set(coreList.map((m) => String(m._id)))
      const merged = [...coreList, ...headsList.filter((m) => !leadershipIds.has(String(m._id)))]

      // Write Phase 1 results immediately so components can render right away
      setCache((prev) => ({
        ...prev,
        membersLeadership: merged.length > 0 ? { data: merged, fetchedAt: now } : null,

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
      }))

      // ── Phase 2: single call — all members at once, grouped client-side ───
      let allMembersJson: unknown
      try {
        allMembersJson = await fetch("/api/members").then((r) => r.json())
      } catch {
        return
      }

      if (!Array.isArray(allMembersJson)) return

      const byDept: Record<string, Member[]> = {}
      for (const member of allMembersJson as Member[]) {
        const dept = member.department || "Uncategorized"
        if (!byDept[dept]) byDept[dept] = []
        byDept[dept].push(member)
      }

      if (Object.keys(byDept).length > 0) {
        setCache((prev) => ({
          ...prev,
          membersByDept: { data: byDept, fetchedAt: Date.now() },
        }))
      }
    } finally {
      fetching.current = false
    }
  }, [])

  useEffect(() => { prefetch() }, [prefetch])

  const invalidate = useCallback(() => {
    setCache(EMPTY_CACHE)
    fetching.current = false
    prefetch()
  }, [prefetch])

  return (
    <DataCacheContext.Provider value={{ cache, setCache, invalidate }}>
      {children}
    </DataCacheContext.Provider>
  )
}

// ── Consumer hooks ─────────────────────────────────────────────────────────────

export function useDataCache() {
  const ctx = useContext(DataCacheContext)
  if (!ctx) throw new Error("useDataCache must be used inside <DataCacheProvider>")
  return ctx
}

/**
 * Home preview — Core Leadership + isHead leads.
 * Available within ~100ms of mount (Phase 1).
 */
export function useCachedMembersLeadership() {
  const { cache } = useDataCache()
  return isFresh(cache.membersLeadership) ? cache.membersLeadership.data : null
}

/**
 * Full members page — all members grouped by department.
 * Available after Phase 2 completes (per-dept calls).
 * Returns null while fetching; updates reactively as depts load.
 */
export function useCachedMembersByDept() {
  const { cache } = useDataCache()
  return isFresh(cache.membersByDept) ? cache.membersByDept.data : null
}

/**
 * Flattened member list (for backward compat / any component needing a flat array).
 * Derived from membersByDept — no extra fetch.
 */
export function useCachedMembers() {
  const { cache } = useDataCache()
  if (!isFresh(cache.membersByDept)) return null
  return Object.values(cache.membersByDept.data).flat()
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
