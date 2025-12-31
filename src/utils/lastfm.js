// Last.fm API configuration
const API_KEY = import.meta.env.VITE_LASTFM_API_KEY
const LASTFM_API_BASE = 'https://ws.audioscrobbler.com/2.0'
const DEBUG = import.meta.env.DEV

// Default limit for number of artists to fetch
const DEFAULT_ARTIST_LIMIT = 500

const logDebug = (...args) => {
  if (DEBUG) {
    console.log(...args)
  }
}

// Debug: Log API key status on load
logDebug('[Last.fm] API Key configured:', API_KEY ? `Yes (${API_KEY.substring(0, 4)}...)` : 'NO - Missing VITE_LASTFM_API_KEY')

/**
 * Fetch user's top artists from Last.fm
 * @param {string} username - Last.fm username
 * @param {number} limit - Number of artists to fetch (max 1000)
 * @param {string} period - Time period: overall, 7day, 1month, 3month, 6month, 12month
 */
export async function fetchTopArtists(username, limit = DEFAULT_ARTIST_LIMIT, period = 'overall') {
  if (!API_KEY) {
    throw new Error('Missing VITE_LASTFM_API_KEY')
  }

  const requestLimit = Math.max(1, Math.min(limit, 1000))
  const params = new URLSearchParams({
    method: 'user.gettopartists',
    user: username,
    api_key: API_KEY,
    format: 'json',
    limit: requestLimit.toString(),
    period
  })

  const url = `${LASTFM_API_BASE}?${params}`
  logDebug('[Last.fm] Fetching top artists for:', username)

  try {
    const response = await fetch(url)
    
    logDebug('[Last.fm] Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Last.fm] Error response body:', errorText)
      throw new Error(`Failed to fetch Last.fm top artists: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    logDebug('[Last.fm] Response data:', data)
    
    if (data.error) {
      console.error('[Last.fm] API error:', data.error, data.message)
      throw new Error(data.message || `Last.fm API error: ${data.error}`)
    }
    
    const artists = data.topartists?.artist || []
    logDebug('[Last.fm] Found', artists.length, 'artists')
    
    return artists
  } catch (err) {
    console.error('[Last.fm] Fetch error:', err)
    throw err
  }
}

/**
 * Fetch artist info including tags (genres)
 * @param {string} artistName - Artist name
 */
export async function fetchArtistInfo(artistName) {
  if (!API_KEY) {
    return null
  }

  const params = new URLSearchParams({
    method: 'artist.getinfo',
    artist: artistName,
    api_key: API_KEY,
    format: 'json'
  })

  const response = await fetch(`${LASTFM_API_BASE}?${params}`)
  
  if (!response.ok) {
    logDebug('[Last.fm] Failed to fetch artist info for:', artistName)
    return null
  }
  
  const data = await response.json()
  return data.artist || null
}

/**
 * Fetch similar artists for a given artist
 * @param {string} artistName - Artist name
 * @param {number} limit - Number of similar artists
 */
export async function fetchSimilarArtists(artistName, limit = 20) {
  if (!API_KEY) {
    return []
  }

  const params = new URLSearchParams({
    method: 'artist.getsimilar',
    artist: artistName,
    api_key: API_KEY,
    format: 'json',
    limit: limit.toString()
  })

  const response = await fetch(`${LASTFM_API_BASE}?${params}`)
  
  if (!response.ok) {
    return []
  }
  
  const data = await response.json()
  return data.similarartists?.artist || []
}

/**
 * Fetch top artists with their tags (genres) - batched
 * @param {string} username - Last.fm username
 * @param {number} limit - Number of artists
 * @param {string} period - Time period
 */
export async function fetchTopArtistsWithTags(username, limit = DEFAULT_ARTIST_LIMIT, period = 'overall') {
  logDebug('[Last.fm] fetchTopArtistsWithTags called:', { username, limit, period })
  
  // First get top artists
  const topArtists = await fetchTopArtists(username, limit, period)
  
  logDebug('[Last.fm] Got top artists, now fetching tags...')
  
  // Then fetch tags for each artist (in parallel, batched)
  const batchSize = 10
  const artistsWithTags = []
  
  for (let i = 0; i < topArtists.length; i += batchSize) {
    const batch = topArtists.slice(i, i + batchSize)
    logDebug(`[Last.fm] Processing batch ${i / batchSize + 1}/${Math.ceil(topArtists.length / batchSize)}`)
    
    const batchResults = await Promise.all(
      batch.map(async (artist) => {
        try {
          const info = await fetchArtistInfo(artist.name)
          const tags = info?.tags?.tag?.map(t => t.name.toLowerCase()) || []
          return {
            ...artist,
            tags
          }
        } catch {
          return { ...artist, tags: [] }
        }
      })
    )
    artistsWithTags.push(...batchResults)
  }
  
  logDebug('[Last.fm] Finished fetching all tags')
  return artistsWithTags
}

/**
 * Normalize Last.fm artist data to match Spotify format
 * @param {Array} lastfmArtists - Array of Last.fm artist objects
 */
export function normalizeLastFmArtists(lastfmArtists) {
  return lastfmArtists.map((artist, index) => {
    // Get the largest image
    const images = artist.image || []
    const largeImage = images.find(img => img.size === 'extralarge') || 
                       images.find(img => img.size === 'large') ||
                       images[0]
    const imageUrl = largeImage?.['#text'] || null
    
    return {
      id: artist.mbid || `lastfm-${artist.name.replace(/\s+/g, '-').toLowerCase()}`,
      name: artist.name,
      genres: artist.tags || [],
      popularity: Math.max(0, 100 - index), // Approximate popularity from rank
      followers: { total: parseInt(artist.playcount) || 0 },
      images: images.map(img => ({
        url: img['#text'],
        height: img.size === 'extralarge' ? 300 : img.size === 'large' ? 174 : 64,
        width: img.size === 'extralarge' ? 300 : img.size === 'large' ? 174 : 64
      })).filter(img => img.url),
      // Store URL in same format as Spotify for graph node
      external_urls: {
        lastfm: artist.url
      },
      lastfmUrl: artist.url,
      playcount: parseInt(artist.playcount) || 0,
      source: 'lastfm'
    }
  })
}

/**
 * Validate Last.fm username exists
 * @param {string} username - Last.fm username
 */
export async function validateUsername(username) {
  try {
    if (!API_KEY) {
      return false
    }

    const params = new URLSearchParams({
      method: 'user.getinfo',
      user: username,
      api_key: API_KEY,
      format: 'json'
    })

    const response = await fetch(`${LASTFM_API_BASE}?${params}`)
    const data = await response.json()

    return !data.error
  } catch {
    return false
  }
}

/**
 * Fetch Last.fm user profile info
 * @param {string} username - Last.fm username
 * @returns {Object} user profile data
 */
export async function fetchUserInfo(username) {
  if (!API_KEY) {
    throw new Error('Missing VITE_LASTFM_API_KEY')
  }

  const params = new URLSearchParams({
    method: 'user.getinfo',
    user: username,
    api_key: API_KEY,
    format: 'json'
  })

  const response = await fetch(`${LASTFM_API_BASE}?${params}`)
  const data = await response.json()

  if (data.error) {
    const error = new Error(data.message || 'Failed to load Last.fm user info')
    error.code = data.error
    throw error
  }

  return data.user
}

/**
 * Fetch similar artists for all artists in batch
 * @param {Array} artists - Array of artist objects with name property
 * @param {Function} onProgress - Progress callback (current, total)
 * @returns {Map} Map of artistName -> array of similar artist names in user's library
 */
export async function fetchSimilarArtistsForAll(artists, onProgress) {
  const artistNames = new Set(artists.map(a => a.name.toLowerCase()))
  const similarityMap = new Map()

  const batchSize = 10
  const delayMs = 200

  for (let i = 0; i < artists.length; i += batchSize) {
    const batch = artists.slice(i, i + batchSize)

    const batchResults = await Promise.all(
      batch.map(async (artist) => {
        try {
          const similar = await fetchSimilarArtists(artist.name, 50)
          // Filter to only artists that are in the user's library
          const relevantSimilar = similar
            .filter(s => artistNames.has(s.name.toLowerCase()))
            .map(s => ({
              name: s.name,
              match: parseFloat(s.match) || 0 // Similarity score 0-1
            }))
          return { artistName: artist.name, similar: relevantSimilar }
        } catch {
          return { artistName: artist.name, similar: [] }
        }
      })
    )

    batchResults.forEach(({ artistName, similar }) => {
      similarityMap.set(artistName.toLowerCase(), similar)
    })

    if (onProgress) {
      onProgress(Math.min(i + batchSize, artists.length), artists.length)
    }

    // Rate limiting delay between batches
    if (i + batchSize < artists.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  return similarityMap
}

/**
 * Fetch artist image from Deezer API (via CORS proxy)
 * @param {string} artistName - Artist name to search
 * @returns {string|null} Image URL or null
 */
export async function fetchArtistImageFromDeezer(artistName) {
  try {
    // Use CORS proxy to bypass browser restrictions
    const deezerUrl = `https://api.deezer.com/search/artist?q=${encodeURIComponent(artistName)}&limit=1`
    const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(deezerUrl)}`)

    if (!response.ok) {
      console.warn('[Deezer] Failed to fetch image for:', artistName, response.status)
      return null
    }

    const data = await response.json()
    const artist = data.data?.[0]

    if (!artist) {
      return null
    }

    // Prefer larger images: picture_xl > picture_big > picture_medium
    return artist.picture_xl || artist.picture_big || artist.picture_medium || null
  } catch (err) {
    console.warn('[Deezer] Error fetching image for:', artistName, err.message)
    return null
  }
}

/**
 * Fetch images for all artists from Deezer in batch
 * @param {Array} artists - Array of artist objects with name property
 * @param {Function} onProgress - Progress callback (current, total)
 * @returns {Map} Map of artistName -> imageUrl
 */
export async function fetchArtistImagesForAll(artists, onProgress) {
  const imageMap = new Map()

  const batchSize = 10
  const delayMs = 100 // Deezer is more lenient

  for (let i = 0; i < artists.length; i += batchSize) {
    const batch = artists.slice(i, i + batchSize)

    const batchResults = await Promise.all(
      batch.map(async (artist) => {
        const imageUrl = await fetchArtistImageFromDeezer(artist.name)
        return { artistName: artist.name, imageUrl }
      })
    )

    batchResults.forEach(({ artistName, imageUrl }) => {
      if (imageUrl) {
        imageMap.set(artistName.toLowerCase(), imageUrl)
      }
    })

    if (onProgress) {
      onProgress(Math.min(i + batchSize, artists.length), artists.length)
    }

    // Rate limiting delay between batches
    if (i + batchSize < artists.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  return imageMap
}

/**
 * Complete data fetch for Last.fm with similarity and images
 * @param {string} username - Last.fm username
 * @param {number} limit - Number of artists to fetch
 * @param {string} period - Time period
 * @param {Function} onProgress - Progress callback ({ stage, percent, message })
 */
export async function fetchLastFmDataComplete(username, limit = DEFAULT_ARTIST_LIMIT, period = 'overall', onProgress) {
  const progress = (stage, percent, message) => {
    if (onProgress) onProgress({ stage, percent, message })
  }

  // Stage 1: Fetch top artists (0-10%)
  progress('artists', 0, 'Fetching your top artists...')
  const topArtists = await fetchTopArtists(username, limit, period)
  progress('artists', 10, `Found ${topArtists.length} artists`)

  // Stage 2: Fetch tags/genres (10-30%)
  progress('tags', 10, 'Loading artist genres...')
  const batchSize = 10
  const artistsWithTags = []

  for (let i = 0; i < topArtists.length; i += batchSize) {
    const batch = topArtists.slice(i, i + batchSize)

    const batchResults = await Promise.all(
      batch.map(async (artist) => {
        try {
          const info = await fetchArtistInfo(artist.name)
          const tags = info?.tags?.tag?.map(t => t.name.toLowerCase()) || []
          return { ...artist, tags }
        } catch {
          return { ...artist, tags: [] }
        }
      })
    )
    artistsWithTags.push(...batchResults)

    const percent = 10 + Math.round((i / topArtists.length) * 20)
    progress('tags', percent, `Loading genres... ${Math.min(i + batchSize, topArtists.length)}/${topArtists.length}`)
  }

  // Stage 3: Fetch similar artists (30-70%)
  progress('similar', 30, 'Finding artist connections...')
  const similarityMap = await fetchSimilarArtistsForAll(artistsWithTags, (current, total) => {
    const percent = 30 + Math.round((current / total) * 40)
    progress('similar', percent, `Finding connections... ${current}/${total}`)
  })

  // Stage 4: Fetch images from Deezer (70-95%)
  progress('images', 70, 'Loading artist images...')
  const imageMap = await fetchArtistImagesForAll(artistsWithTags, (current, total) => {
    const percent = 70 + Math.round((current / total) * 25)
    progress('images', percent, `Loading images... ${current}/${total}`)
  })

  // Stage 5: Normalize data (95-100%)
  progress('normalize', 95, 'Building your constellation...')

  // Normalize artists with images from Deezer
  const normalizedArtists = artistsWithTags.map((artist, index) => {
    const deezerImage = imageMap.get(artist.name.toLowerCase())

    return {
      id: artist.mbid || `lastfm-${artist.name.replace(/\s+/g, '-').toLowerCase()}`,
      name: artist.name,
      genres: artist.tags || [],
      popularity: Math.max(0, 100 - index),
      followers: { total: parseInt(artist.playcount) || 0 },
      images: deezerImage ? [{ url: deezerImage, height: 300, width: 300 }] : [],
      external_urls: { lastfm: artist.url },
      lastfmUrl: artist.url,
      playcount: parseInt(artist.playcount) || 0,
      source: 'lastfm'
    }
  })

  progress('done', 500, 'Done!')

  return {
    artists: normalizedArtists,
    similarityMap
  }
}
