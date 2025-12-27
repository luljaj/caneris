# Caneris: Last.fm Migration Plan

## Current Problems

### 1. Connection Limit Issue
**Location:** `src/utils/graphUtils.js:29`
```js
const MAX_CONNECTIONS_PER_NODE = 5
```

**Problem:** With 130+ artists and only 5 connections per node based on shared genre tags, the graph becomes:
- Too sparse to form meaningful clusters
- Many isolated nodes (artists with unique tags)
- Poor visual cohesion - doesn't feel like a "constellation"

**Root cause:** Genre tags alone are weak connectors. Two artists might both be "rock" but that's a very loose relationship.

### 2. No Artist Images
**Problem:** Last.fm deprecated their artist image API in 2020. The `normalizeLastFmArtists()` function tries to extract images but gets empty URLs.

**Current code:** `src/utils/lastfm.js:156-160`
```js
const images = artist.image || []
const largeImage = images.find(img => img.size === 'extralarge')...
const imageUrl = largeImage?.['#text'] || null  // Always null now
```

### 3. `getSimilar` Not Used for Connections
**Location:** `src/utils/lastfm.js:85-104`

The function `fetchSimilarArtists()` exists and works, but it's **never called** to build graph connections. Instead, connections rely solely on shared genre tags.

**This is the key insight:** Last.fm's similar artists data is far richer than genre matching. It's based on actual listening patterns across millions of users.

---

## Proposed Solution

### Phase 1: Use Similar Artists for Connections

**Strategy:** For each artist in the user's top artists, fetch their similar artists. If a similar artist is also in the user's library, create a connection.

```
User's Top Artists: [A, B, C, D, E...]

For artist A:
  Similar to A: [X, B, Y, D, Z]  ← B and D are also in user's library
  Create links: A↔B, A↔D

For artist B:
  Similar to B: [A, C, W, V]  ← A and C are in user's library
  Create links: B↔A (skip, exists), B↔C
```

**Benefits:**
- Much richer connections based on real listener data
- No arbitrary limit needed - natural clustering emerges
- Artists cluster by actual musical similarity, not just tag overlap

**Implementation:**
1. Fetch user's top artists (existing)
2. For each artist, call `fetchSimilarArtists()`
3. Build a similarity map: `{ artistName → Set of similar artist names }`
4. When building graph, create links where both artists are in user's library AND one is similar to the other

**Rate limiting consideration:**
- 130 artists × 1 API call each = 130 calls
- Batch with delays (10 concurrent, 200ms between batches)
- Cache results in sessionStorage

### Phase 2: Fix Artist Images

**Options:**

| Source | Pros | Cons |
|--------|------|------|
| **MusicBrainz** | Free, no key needed, has MBID | Requires cover art archive lookup, inconsistent |
| **Deezer API** | Free, no auth, good images | Need to search by name, may not match |
| **Spotify Web API** | High quality images | Requires OAuth (our original problem) |
| **Discogs** | Good coverage | Requires API key, rate limited |
| **TheAudioDB** | Good coverage | Limited free tier |

**Recommended: Deezer API**
- No authentication required
- Simple search endpoint: `https://api.deezer.com/search/artist?q={name}`
- Returns `picture_medium`, `picture_big`, `picture_xl`
- Good coverage of artists

**Implementation:**
```js
async function fetchArtistImage(artistName) {
  const response = await fetch(
    `https://api.deezer.com/search/artist?q=${encodeURIComponent(artistName)}`
  )
  const data = await response.json()
  return data.data?.[0]?.picture_xl || null
}
```

### Phase 3: Remove Spotify Code

Once Last.fm is fully working:
1. Delete `src/hooks/useSpotifyAuth.js`
2. Delete `src/utils/spotify.js`
3. Simplify `Login.jsx` to username-only input
4. Clean up `App.jsx` Spotify state
5. Remove Spotify env vars

---

## Technical Details

### New Graph Building Algorithm

```js
// Pseudocode for new connection strategy
async function buildSimilarityConnections(artists) {
  const artistNames = new Set(artists.map(a => a.name.toLowerCase()))
  const links = []

  // Fetch similar artists for each (with rate limiting)
  for (const artist of artists) {
    const similar = await fetchSimilarArtists(artist.name, 50)

    for (const simArtist of similar) {
      // Only connect if similar artist is in user's library
      if (artistNames.has(simArtist.name.toLowerCase())) {
        links.push({
          source: artist.id,
          target: /* find matching artist id */,
          similarity: simArtist.match // Last.fm provides 0-1 similarity score
        })
      }
    }
  }

  return links
}
```

### Image Fetching Strategy

- Fetch images in parallel with similar artists (hide latency)
- Cache in sessionStorage to avoid re-fetching
- Fallback to colored circle if image unavailable
- Use intersection observer for lazy loading

---

## Questions to Resolve

1. **Connection threshold:** Should we require a minimum similarity score? (Last.fm returns 0-1)

2. **Hybrid approach:** Keep genre-based connections as fallback for artists with no similar matches in library?

3. **Loading UX:** This will be slower (more API calls). Show progress? Load graph incrementally?

4. **Image priority:** Fetch images for top 50 artists only? Or all?

---

## File Changes Summary

| File | Action |
|------|--------|
| `src/utils/lastfm.js` | Add batch similar artist fetching, add image fetching |
| `src/utils/graphUtils.js` | New connection algorithm using similarity data |
| `src/hooks/useLastFmData.js` | Orchestrate new data fetching flow |
| `src/components/Login.jsx` | Remove Spotify tab |
| `src/App.jsx` | Remove Spotify auth logic |
| `src/hooks/useSpotifyAuth.js` | DELETE |
| `src/utils/spotify.js` | DELETE |

---

## Implementation Status

### Completed
1. [x] `fetchSimilarArtistsForAll()` - batch fetch similar artists with rate limiting
2. [x] `fetchArtistImageFromDeezer()` - fetch images from Deezer API
3. [x] `fetchArtistImagesForAll()` - batch fetch images
4. [x] `fetchLastFmDataComplete()` - unified function with progress callbacks
5. [x] Updated `artistsToGraphData()` to use similarity-based connections
6. [x] Genre fallback for unconnected artists
7. [x] Updated `useLastFmData` hook with new data flow

### Pending
- [ ] Remove Spotify code (keeping for now per user request)
- [ ] Test end-to-end with real Last.fm username
