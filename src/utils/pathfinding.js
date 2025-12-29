export function buildAdjacencyList(links) {
  const adjacency = new Map()

  for (const link of links) {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source
    const targetId = typeof link.target === 'object' ? link.target.id : link.target

    if (!adjacency.has(sourceId)) adjacency.set(sourceId, new Set())
    if (!adjacency.has(targetId)) adjacency.set(targetId, new Set())

    adjacency.get(sourceId).add(targetId)
    adjacency.get(targetId).add(sourceId)
  }

  return adjacency
}

export function normalizeArtistName(value = '') {
  return value
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export function findShortestPath(adjacency, startId, targetId) {
  if (startId === targetId) return [startId]
  if (!adjacency.has(startId) || !adjacency.has(targetId)) return null

  const queue = [[startId]]
  const visited = new Set([startId])

  while (queue.length > 0) {
    const path = queue.shift()
    const current = path[path.length - 1]

    const neighbors = adjacency.get(current) || new Set()

    for (const neighbor of neighbors) {
      if (neighbor === targetId) {
        return [...path, neighbor]
      }

      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push([...path, neighbor])
      }
    }
  }

  return null
}

export function getDistance(adjacency, startId, targetId) {
  const path = findShortestPath(adjacency, startId, targetId)
  return path ? path.length - 1 : -1
}

export function findArtistsAtDistance(adjacency, startId, distance) {
  if (distance === 0) return [startId]
  if (!adjacency.has(startId)) return []

  const visited = new Set([startId])
  let currentLevel = [startId]

  for (let d = 0; d < distance; d++) {
    const nextLevel = []

    for (const artistId of currentLevel) {
      const neighbors = adjacency.get(artistId) || new Set()

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          nextLevel.push(neighbor)
        }
      }
    }

    currentLevel = nextLevel
    if (currentLevel.length === 0) break
  }

  return currentLevel
}

export function generateChallenge(nodes, adjacency, options = {}) {
  const {
    minHops = 3,
    maxHops = 6,
    preferPopular = true
  } = options

  if (nodes.length < 2) return null

  const sortedNodes = [...nodes].sort((a, b) => (b.val || 0) - (a.val || 0))

  const maxAttempts = 50

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const startIndex = preferPopular
      ? Math.floor(Math.random() * Math.min(20, sortedNodes.length))
      : Math.floor(Math.random() * sortedNodes.length)

    const startArtist = sortedNodes[startIndex]

    const candidates = []

    for (let dist = minHops; dist <= maxHops; dist++) {
      const atDistance = findArtistsAtDistance(adjacency, startArtist.id, dist)
      candidates.push(...atDistance.map(id => ({ id, distance: dist })))
    }

    if (candidates.length === 0) continue

    const targetCandidate = candidates[Math.floor(Math.random() * candidates.length)]
    const targetArtist = nodes.find(n => n.id === targetCandidate.id)

    if (!targetArtist) continue

    const optimalPath = findShortestPath(adjacency, startArtist.id, targetArtist.id)

    if (optimalPath && optimalPath.length - 1 >= minHops) {
      return {
        startArtist,
        targetArtist,
        optimalPath,
        optimalHops: optimalPath.length - 1
      }
    }
  }

  return null
}

export function getConnectedArtists(adjacency, artistId, nodes) {
  const neighborIds = adjacency.get(artistId) || new Set()
  const nodeMap = new Map(nodes.map(n => [n.id, n]))

  return Array.from(neighborIds)
    .map(id => nodeMap.get(id))
    .filter(Boolean)
}

export function isValidMove(adjacency, currentId, targetId) {
  const neighbors = adjacency.get(currentId)
  return neighbors ? neighbors.has(targetId) : false
}

/**
 * Fuzzy search for artist names (for autocomplete)
 * @param {string} query - Search query
 * @param {Array} nodes - Graph nodes array
 * @param {number} limit - Maximum results to return
 * @returns {Array} - Matching artist nodes
 */
export function fuzzySearchArtists(query, nodes, limit = 10) {
  if (!query || query.length === 0) return []

  const normalizedQuery = normalizeArtistName(query)

  // Score each artist based on match quality
  const scored = nodes
    .map(node => {
      const name = normalizeArtistName(node.name)
      let score = 0

      // Exact match
      if (name === normalizedQuery) {
        score = 100
      }
      // Starts with query
      else if (name.startsWith(normalizedQuery)) {
        score = 80
      }
      // Contains query
      else if (name.includes(normalizedQuery)) {
        score = 60
      }
      // Check for word matches
      else {
        const words = name.split(/\s+/)
        for (const word of words) {
          if (word.startsWith(normalizedQuery)) {
            score = 40
            break
          }
        }
      }

      return { node, score }
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.node)

  return scored
}
