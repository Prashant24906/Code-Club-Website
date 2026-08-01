"use client"

/**
 * Global in-memory data cache for the Code Club site.
 *
 * On first mount this provider fires parallel fetches for:
 *   - membersLeadership  → Core Leadership + all isHead:true leads (fast, ~10 docs)
 *   - communities        → all communities
 *   - upcomingEvents     → page-1 upcoming events
 *   - pastEvents         → page-1 past events
 *
 * The full member list (membersAll) is fetched lazily the first time
 * useCachedMembers() is called with { full: true } — i.e. from the /members page.
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
  /** Core Leadership + all isHead leads — fetched eagerly on mount (fast) */
  membersLeadership: CacheEntry<Member[]>
  /** Full member list — fetched lazily on first /members page visit */
  membersAll: CacheEntry<Member[]>
  communities: CacheEntry<Community[]>
  upcomingEvents: CacheEntry<EventsPage>
  pastEvents: CacheEntry<EventsPage>
}

interface DataCacheContextValue {
  cache: DataCache
  setCache: React.Dispatch<React.SetStateAction<DataCache>>
  /** Manually invalidate and re-fetch the whole cache (e.g. after admin writes) */
  invalidate: () => void
}

// ── Context ────────────────────────────────────────────────────────────────────

const TTL_MS = 5 * 60 * 1_000 // 5 minutes

const DataCacheContext = createContext<DataCacheContextValue | null>(null)

function isFresh<T>(entry: CacheEntry<T>): entry is { data: T; fetchedAt: number } {
  return entry !== null && Date.now() - entry.fetchedAt < TTL_MS
}

const EMPTY_CACHE: DataCache = {
  membersLeadership: null,
  membersAll: null,
  communities: null,
  upcomingEvents: null,
  pastEvents: null,
}

// ── Provider ───────────────────────────────────────────────────────────────────

export function DataCacheProvider({ children }: { children: ReactNode }) {
  const [cache, setCache] = useState<DataCache>(EMPTY_CACHE)

  // Prevent duplicate concurrent fetches
  const fetching = useRef(false)

  const prefetch = useCallback(async () => {
    if (fetching.current) return
    fetching.current = true
    try {
      // Fire all 6 APIs simultaneously on mount — nothing is lazy anymore
      const [coreRes, headsRes, allMembersRes, communitiesRes, upcomingRes, pastRes] = await Promise.allSettled([
        fetch("/api/members?department=Core Leadership").then((r) => r.json()),
        fetch("/api/members?isHead=true").then((r) => r.json()),
        fetch("/api/members").then((r) => r.json()),
        fetch("/api/communities").then((r) => r.json()),
        fetch("/api/events?page=1&limit=8&type=upcoming").then((r) => r.json()),
        fetch("/api/events?page=1&limit=8&type=past").then((r) => r.json()),
      ])

      const now = Date.now()

      // Merge Core Leadership + all isHead leads, deduplicated by _id
      const coreList: Member[] = coreRes.status === "fulfilled" && Array.isArray(coreRes.value) ? coreRes.value : []
      const headsList: Member[] = headsRes.status === "fulfilled" && Array.isArray(headsRes.value) ? headsRes.value : []
      const leadershipIds = new Set(coreList.map((m) => String(m._id)))
      const merged = [...coreList, ...headsList.filter((m) => !leadershipIds.has(String(m._id)))]

      setCache((prev) => ({
        ...prev,
        membersLeadership: merged.length > 0 ? { data: merged, fetchedAt: now } : null,

        membersAll:
          allMembersRes.status === "fulfilled" && Array.isArray(allMembersRes.value)
            ? { data: allMembersRes.value, fetchedAt: now }
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
      }))
    } finally {
      fetching.current = false
    }
  }, [])

  // Fire prefetch once on mount
  useEffect(() => {
    prefetch()
  }, [prefetch])

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
 * Home preview — returns Core Leadership + isHead leads (fast, always pre-fetched).
 * Returns null while the initial fetch is in flight.
 */
export function useCachedMembersLeadership() {
  const { cache } = useDataCache()
  return isFresh(cache.membersLeadership) ? cache.membersLeadership.data : null
}

/**
 * Full members page — returns all members.
 * Triggers a lazy fetch on first call if the full list isn't cached yet.
 */
export function useCachedMembers() {
  const { cache, setCache } = useDataCache()
  const fetchingAll = useRef(false)

  useEffect(() => {
    if (isFresh(cache.membersAll) || fetchingAll.current) return
    fetchingAll.current = true
    fetch("/api/members")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCache((prev) => ({
            ...prev,
            membersAll: { data, fetchedAt: Date.now() },
          }))
        }
      })
      .catch(() => {})
      .finally(() => { fetchingAll.current = false })
  }, [cache.membersAll, setCache])

  return isFresh(cache.membersAll) ? cache.membersAll.data : null
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
