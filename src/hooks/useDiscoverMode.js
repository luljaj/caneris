import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { artistsToGraphData } from '../utils/graphUtils'
import {
  fetchArtistImagesForAll,
  fetchTopArtistsWithTags,
  fetchUserInfo,
  normalizeLastFmArtists
} from '../utils/lastfm'

const STORAGE_KEY = 'caneris:others'
const STORAGE_LIMIT = 5 * 1024 * 1024
const WARNING_THRESHOLD = 0.8
const FULL_THRESHOLD = 0.95
const STALE_MS = 1000 * 60 * 60 * 24 * 7
const EMPTY_STATE = { discovered: [], fused: [] }

const stripGraphData = (entry) => {
  if (!entry || typeof entry !== 'object') return entry
  const { graphData, ...rest } = entry
  return rest
}

const readStorage = () => {
  if (typeof window === 'undefined') return EMPTY_STATE

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_STATE
    const parsed = JSON.parse(raw)
    return {
      discovered: Array.isArray(parsed?.discovered) ? parsed.discovered : [],
      fused: Array.isArray(parsed?.fused) ? parsed.fused : []
    }
  } catch {
    return EMPTY_STATE
  }
}

const writeStorage = (state) => {
  if (typeof window === 'undefined') return

  try {
    const payload = {
      discovered: (state?.discovered || []).map(stripGraphData),
      fused: (state?.fused || []).map(stripGraphData)
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Ignore storage failures (quota, privacy mode, etc.)
  }
}

const getStorageUsage = () => {
  if (typeof window === 'undefined') return 0

  try {
    let total = 0
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        const value = localStorage.getItem(key)
        if (value) {
          total += value.length * 2
        }
      }
    }
    return total
  } catch {
    return 0
  }
}

const mapLastFmError = (error) => {
  const code = Number(error?.code)
  if (code === 6) {
    return { type: 'not_found', message: 'Username not found on Last.fm' }
  }
  if (code === 17) {
    return { type: 'private', message: 'This profile is private' }
  }
  return { type: 'network', message: error?.message || 'Network error. Try again.' }
}

const computeTopGenres = (artists, limit = 3) => {
  const genreCounts = {}
  artists.forEach((artist) => {
    artist.genres?.forEach((genre) => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1
    })
  })
  return Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([genre]) => genre)
}

const stripImages = (artist) => ({
  ...artist,
  images: []
})

const buildCacheKey = (type, key) => `${type}:${key}`

const buildEntryStats = (artists, graphData) => ({
  artistCount: artists.length,
  connectionCount: graphData?.links?.length || 0,
  topGenres: computeTopGenres(artists)
})

const buildDiscoveredEntry = (username, artists, options = {}) => {
  const now = Date.now()
  const graphData = artistsToGraphData(artists)
  const stats = buildEntryStats(artists, graphData)

  return {
    username,
    loadedAt: options.loadedAt || now,
    lastChecked: options.lastChecked || now,
    imagesLoaded: Boolean(options.imagesLoaded),
    artists,
    ...stats,
    graphData
  }
}

const buildFusedEntry = ({ name, fusionType, sourceUsers, artists, createdAt }) => {
  const graphData = artistsToGraphData(artists)
  const stats = buildEntryStats(artists, graphData)

  return {
    id: `fuse_${createdAt}`,
    name,
    createdAt,
    fusionType,
    sourceUsers,
    imagesLoaded: false,
    artists,
    ...stats,
    graphData
  }
}

const fuseUnion = (myArtists, theirArtists) => {
  const artistMap = new Map()

  myArtists.forEach((artist) => {
    artistMap.set(artist.id, { ...artist, source: 'mine' })
  })

  theirArtists.forEach((artist) => {
    if (artistMap.has(artist.id)) {
      artistMap.get(artist.id).source = 'both'
    } else {
      artistMap.set(artist.id, { ...artist, source: 'theirs' })
    }
  })

  return Array.from(artistMap.values())
}

const fuseIntersection = (myArtists, theirArtists) => {
  const theirIds = new Set(theirArtists.map((artist) => artist.id))

  return myArtists
    .filter((artist) => theirIds.has(artist.id))
    .map((artist) => ({ ...artist, source: 'both' }))
}

export function useDiscoverMode({ currentUsername, originalArtists }) {
  const [discovered, setDiscovered] = useState([])
  const [fused, setFused] = useState([])
  const [isOffline, setIsOffline] = useState(() => {
    if (typeof navigator === 'undefined') return false
    return !navigator.onLine
  })
  const [storageUsage, setStorageUsage] = useState(0)
  const isReadyRef = useRef(false)
  const graphCacheRef = useRef(new Map())
  const discoveredRef = useRef([])
  const fusedRef = useRef([])

  useEffect(() => {
    discoveredRef.current = discovered
  }, [discovered])

  useEffect(() => {
    fusedRef.current = fused
  }, [fused])

  useEffect(() => {
    const stored = readStorage()
    setDiscovered(stored.discovered)
    setFused(stored.fused)
    setStorageUsage(getStorageUsage())
    isReadyRef.current = true
  }, [])

  useEffect(() => {
    if (!isReadyRef.current) return
    writeStorage({ discovered, fused })
    setStorageUsage(getStorageUsage())
  }, [discovered, fused])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const storageStatus = useMemo(() => {
    const ratio = STORAGE_LIMIT > 0 ? storageUsage / STORAGE_LIMIT : 0
    return {
      bytes: storageUsage,
      limit: STORAGE_LIMIT,
      ratio,
      isWarning: ratio >= WARNING_THRESHOLD,
      isFull: ratio >= FULL_THRESHOLD
    }
  }, [storageUsage])

  const searchUser = useCallback(async (username) => {
    try {
      const user = await fetchUserInfo(username)
      return { user, error: null }
    } catch (error) {
      return { user: null, error: mapLastFmError(error) }
    }
  }, [])

  const normalizeArtistsForDiscover = useCallback((artists) => {
    return normalizeLastFmArtists(artists).map(stripImages)
  }, [])

  const addDiscovered = useCallback(async (username) => {
    if (!username) {
      throw new Error('Enter a Last.fm username')
    }
    if (isOffline) {
      throw new Error('Search is unavailable while offline')
    }
    if (storageStatus.isFull) {
      throw new Error('Storage is full. Remove constellations to add more.')
    }

    const cleaned = username.trim()
    if (!cleaned) {
      throw new Error('Enter a Last.fm username')
    }

    if (currentUsername && cleaned.toLowerCase() === currentUsername.toLowerCase()) {
      throw new Error('This is already your Original Path')
    }

    const alreadyAdded = discoveredRef.current.some(
      (entry) => entry.username.toLowerCase() === cleaned.toLowerCase()
    )
    if (alreadyAdded) {
      throw new Error('Already in your Discovered list')
    }

    const artistsWithTags = await fetchTopArtistsWithTags(cleaned)
    const normalizedArtists = normalizeArtistsForDiscover(artistsWithTags)
    const entry = buildDiscoveredEntry(cleaned, normalizedArtists)

    setDiscovered((prev) => [entry, ...prev])
    graphCacheRef.current.set(buildCacheKey('discovered', entry.username), entry.graphData)

    return entry
  }, [currentUsername, isOffline, normalizeArtistsForDiscover, storageStatus.isFull])

  const refreshDiscovered = useCallback(async (username) => {
    if (!username) return null
    if (isOffline) {
      throw new Error('Refresh is unavailable while offline')
    }

    const target = discoveredRef.current.find(
      (entry) => entry.username.toLowerCase() === username.toLowerCase()
    )
    if (!target) return null

    const artistsWithTags = await fetchTopArtistsWithTags(target.username)
    const normalizedArtists = normalizeArtistsForDiscover(artistsWithTags)
    const entry = buildDiscoveredEntry(target.username, normalizedArtists, {
      loadedAt: target.loadedAt
    })

    setDiscovered((prev) => prev.map((item) => (
      item.username.toLowerCase() === target.username.toLowerCase()
        ? entry
        : item
    )))
    graphCacheRef.current.set(buildCacheKey('discovered', entry.username), entry.graphData)

    return entry
  }, [isOffline, normalizeArtistsForDiscover])

  const removeDiscovered = useCallback((username) => {
    setDiscovered((prev) => prev.filter((entry) => entry.username !== username))
    graphCacheRef.current.delete(buildCacheKey('discovered', username))
  }, [])

  const removeFused = useCallback((id) => {
    setFused((prev) => prev.filter((entry) => entry.id !== id))
    graphCacheRef.current.delete(buildCacheKey('fused', id))
  }, [])

  const loadImagesForEntry = useCallback(async (type, key) => {
    if (isOffline) {
      throw new Error('Images are unavailable while offline')
    }

    const entries = type === 'fused' ? fusedRef.current : discoveredRef.current
    const target = entries.find((entry) => (
      type === 'fused' ? entry.id === key : entry.username === key
    ))
    if (!target) return null

    const imageMap = await fetchArtistImagesForAll(target.artists)
    const updatedArtists = target.artists.map((artist) => {
      const imageUrl = imageMap.get(artist.name.toLowerCase())
      if (!imageUrl) return artist
      return {
        ...artist,
        images: [{ url: imageUrl, height: 300, width: 300 }]
      }
    })

    const graphData = artistsToGraphData(updatedArtists)
    const stats = buildEntryStats(updatedArtists, graphData)
    const updatedEntry = {
      ...target,
      artists: updatedArtists,
      imagesLoaded: true,
      ...stats,
      graphData
    }

    if (type === 'fused') {
      setFused((prev) => prev.map((entry) => entry.id === key ? updatedEntry : entry))
    } else {
      setDiscovered((prev) => prev.map((entry) => entry.username === key ? updatedEntry : entry))
    }

    graphCacheRef.current.set(buildCacheKey(type, key), graphData)
    return updatedEntry
  }, [isOffline])

  const createFusion = useCallback((username, fusionType) => {
    if (!originalArtists || originalArtists.length === 0) {
      throw new Error('Load your Original Path before fusing')
    }

    const target = discoveredRef.current.find(
      (entry) => entry.username.toLowerCase() === username.toLowerCase()
    )
    if (!target) return null

    const createdAt = Date.now()
    const theirArtists = target.artists
    const baseArtists = fusionType === 'intersection'
      ? fuseIntersection(originalArtists, theirArtists)
      : fuseUnion(originalArtists, theirArtists)

    const fusedArtists = baseArtists.map(stripImages)
    const name = fusionType === 'intersection'
      ? `You + ${target.username} (Shared)`
      : `You + ${target.username} (Union)`

    const entry = buildFusedEntry({
      name,
      fusionType,
      sourceUsers: ['_self', target.username],
      artists: fusedArtists,
      createdAt
    })

    setFused((prev) => [entry, ...prev])
    graphCacheRef.current.set(buildCacheKey('fused', entry.id), entry.graphData)
    return entry
  }, [originalArtists])

  const getGraphData = useCallback((type, key) => {
    const cacheKey = buildCacheKey(type, key)
    const cached = graphCacheRef.current.get(cacheKey)
    if (cached) return cached

    const entries = type === 'fused' ? fusedRef.current : discoveredRef.current
    const target = entries.find((entry) => (
      type === 'fused' ? entry.id === key : entry.username === key
    ))
    if (!target) return null

    const graphData = artistsToGraphData(target.artists || [])
    graphCacheRef.current.set(cacheKey, graphData)
    return graphData
  }, [])

  const isOutdated = useCallback((entry) => {
    if (!entry?.lastChecked) return false
    return Date.now() - entry.lastChecked > STALE_MS
  }, [])

  return {
    discovered,
    fused,
    isOffline,
    storageStatus,
    searchUser,
    addDiscovered,
    refreshDiscovered,
    removeDiscovered,
    removeFused,
    loadImagesForEntry,
    createFusion,
    getGraphData,
    isOutdated
  }
}
