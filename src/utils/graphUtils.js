/**
 * Convert artists data to graph format for react-force-graph
 * @param {Array} artists - Array of normalized artist objects
 * @param {Map} similarityMap - Optional map of artistName -> array of similar artists with match scores
 */
export function artistsToGraphData(artists, similarityMap = null) {
  if (!artists || artists.length === 0) {
    return { nodes: [], links: [] }
  }

  // Create nodes from artists
  const allNodes = artists.map((artist, index) => ({
    id: artist.id,
    name: artist.name,
    genres: artist.genres || [],
    popularity: artist.popularity,
    followers: artist.followers?.total || 0,
    image: artist.images?.[0]?.url || null,
    spotifyUrl: artist.external_urls?.spotify,
    lastfmUrl: artist.lastfmUrl || artist.external_urls?.lastfm,
    playcount: artist.playcount,
    source: artist.source || 'spotify',
    // Size based on popularity (index used as proxy for listening frequency)
    // Lower index = more listened to (both services return sorted by listen count)
    val: calculateNodeSize(index, artists.length),
    // Color will be assigned based on primary genre
    color: null
  }))

  // Build lookup maps for quick access
  const nodeById = new Map(allNodes.map(n => [n.id, n]))
  const nodeByName = new Map(allNodes.map(n => [n.name.toLowerCase(), n]))

  const links = []
  const addedLinks = new Set()
  const connectedNodeIds = new Set()

  // Helper to add a link (prevents duplicates)
  const addLink = (sourceId, targetId, linkType, value = 1) => {
    const key = [sourceId, targetId].sort().join('|')
    if (addedLinks.has(key)) return false
    addedLinks.add(key)
    links.push({
      source: sourceId,
      target: targetId,
      linkType, // 'similarity' or 'genre'
      value
    })
    connectedNodeIds.add(sourceId)
    connectedNodeIds.add(targetId)
    return true
  }

  // PHASE 1: Add similarity-based connections (if available)
  if (similarityMap && similarityMap.size > 0) {
    console.log('[Graph] Building similarity-based connections...')

    // Collect all potential similarity links first
    const allSimilarityLinks = []

    for (const node of allNodes) {
      const similarArtists = similarityMap.get(node.name.toLowerCase()) || []

      for (const similar of similarArtists) {
        const targetNode = nodeByName.get(similar.name.toLowerCase())
        if (targetNode && targetNode.id !== node.id) {
          allSimilarityLinks.push({
            sourceId: node.id,
            targetId: targetNode.id,
            match: similar.match
          })
        }
      }
    }

    // Sort by match score (strongest first)
    allSimilarityLinks.sort((a, b) => b.match - a.match)

    // Track visible connections per node (only top N are rendered)
    const MAX_VISIBLE_CONNECTIONS = 5
    const visibleConnectionCount = {}

    // Add ALL connections but mark visibility based on strength ranking
    for (const link of allSimilarityLinks) {
      const sourceCount = visibleConnectionCount[link.sourceId] || 0
      const targetCount = visibleConnectionCount[link.targetId] || 0

      // Connection is visible if both nodes have room in their top 5
      const isVisible = sourceCount < MAX_VISIBLE_CONNECTIONS && targetCount < MAX_VISIBLE_CONNECTIONS

      const key = [link.sourceId, link.targetId].sort().join('|')
      if (!addedLinks.has(key)) {
        addedLinks.add(key)
        links.push({
          source: link.sourceId,
          target: link.targetId,
          linkType: 'similarity',
          value: link.match * 10,
          visible: isVisible
        })
        connectedNodeIds.add(link.sourceId)
        connectedNodeIds.add(link.targetId)

        if (isVisible) {
          visibleConnectionCount[link.sourceId] = sourceCount + 1
          visibleConnectionCount[link.targetId] = targetCount + 1
        }
      }
    }

    const visibleCount = links.filter(l => l.visible).length
    console.log(`[Graph] Added ${links.length} connections (${visibleCount} visible, ${links.length - visibleCount} hidden but active)`)
  }

  // PHASE 2: Add genre-based connections for unconnected nodes (fallback)
  const unconnectedNodes = allNodes.filter(n => !connectedNodeIds.has(n.id))

  if (unconnectedNodes.length > 0) {
    console.log(`[Graph] ${unconnectedNodes.length} nodes without similarity connections, using genre fallback...`)

    // For unconnected nodes, try to connect via shared genres
    for (const node of unconnectedNodes) {
      if (node.genres.length === 0) continue

      // Find best genre matches among ALL nodes
      let bestMatches = []

      for (const other of allNodes) {
        if (other.id === node.id) continue
        const sharedGenres = getSharedGenres(node.genres, other.genres)
        if (sharedGenres.length > 0) {
          bestMatches.push({
            node: other,
            sharedCount: sharedGenres.length
          })
        }
      }

      // Sort by shared genre count and take top matches
      bestMatches.sort((a, b) => b.sharedCount - a.sharedCount)
      const topMatches = bestMatches.slice(0, 5)

      for (const match of topMatches) {
        addLink(node.id, match.node.id, 'genre', match.sharedCount)
      }
    }

    console.log(`[Graph] Total connections after genre fallback: ${links.length}`)
  }

  // If no similarityMap provided at all, use pure genre-based (legacy behavior for Spotify)
  if (!similarityMap) {
    console.log('[Graph] No similarity data, using genre-based connections...')
    const MAX_CONNECTIONS_PER_NODE = 8 // Increased from 5

    const allPotentialLinks = []

    for (let i = 0; i < allNodes.length; i++) {
      for (let j = i + 1; j < allNodes.length; j++) {
        const sharedGenres = getSharedGenres(allNodes[i].genres, allNodes[j].genres)

        if (sharedGenres.length > 0) {
          allPotentialLinks.push({
            source: allNodes[i].id,
            target: allNodes[j].id,
            sharedGenres,
            value: sharedGenres.length
          })
        }
      }
    }

    // Sort by strength (most shared genres first)
    allPotentialLinks.sort((a, b) => b.value - a.value)

    // Track connection count per node
    const connectionCount = {}

    for (const link of allPotentialLinks) {
      const sourceCount = connectionCount[link.source] || 0
      const targetCount = connectionCount[link.target] || 0

      if (sourceCount < MAX_CONNECTIONS_PER_NODE && targetCount < MAX_CONNECTIONS_PER_NODE) {
        if (addLink(link.source, link.target, 'genre', link.value)) {
          connectionCount[link.source] = sourceCount + 1
          connectionCount[link.target] = targetCount + 1
        }
      }
    }
  }

  // Filter to only connected nodes
  const nodes = allNodes.filter(node => connectedNodeIds.has(node.id))

  console.log(`[Graph] Final: ${nodes.length} nodes, ${links.length} links`)

  // Calculate genre clusters and assign colors
  const genreClusters = calculateGenreClusters(nodes)
  assignNodeColors(nodes, genreClusters)

  return { nodes, links, genreClusters }
}

/**
 * Calculate node size based on listening rank
 * Higher rank (more listened) = larger node
 */
function calculateNodeSize(index, total) {
  // Exponential decay: top artists are much larger
  const normalizedRank = 1 - (index / total)
  const minSize = 2
  const maxSize = 15
  return minSize + (maxSize - minSize) * Math.pow(normalizedRank, 1.5)
}

/**
 * Find shared genres between two artists
 */
function getSharedGenres(genres1 = [], genres2 = []) {
  return genres1.filter(g => genres2.includes(g))
}

/**
 * Calculate genre clusters for labeling
 */
function calculateGenreClusters(nodes) {
  // Count genre frequencies
  const genreCounts = {}
  
  nodes.forEach(node => {
    node.genres.forEach(genre => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1
    })
  })

  // Get top genres (appear in at least 3 artists)
  const significantGenres = Object.entries(genreCounts)
    .filter(([_, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 24) // Limit to 24 clusters
    .map(([genre]) => genre)

  // Create cluster objects
  const clusters = significantGenres.map((genre, index) => {
    const clusterNodes = nodes.filter(n => n.genres.includes(genre))
    return {
      id: genre,
      name: formatGenreName(genre),
      nodeCount: clusterNodes.length,
      colorIndex: index
    }
  })

  return clusters
}

/**
 * Assign colors to nodes based on their primary genre cluster
 */
function assignNodeColors(nodes, clusters) {
  // Cosmic palette - nebula and celestial colors
  const clusterColors = [
    '#a855f7', // purple
    '#8b5cf6', // violet
    '#6366f1', // indigo
    '#3b82f6', // blue
    '#0ea5e9', // sky
    '#06b6d4', // cyan
    '#14b8a6', // teal
    '#10b981', // emerald
    '#22c55e', // green
    '#84cc16', // lime
    '#eab308', // yellow
    '#f59e0b', // amber
    '#f97316', // orange
    '#ef4444', // red
    '#ec4899', // pink
    '#d946ef', // fuchsia
    '#c084fc', // light purple
    '#818cf8', // light indigo
    '#60a5fa', // light blue
    '#38bdf8', // light sky
    '#2dd4bf', // light teal
    '#4ade80', // light green
    '#a3e635', // light lime
    '#fbbf24'  // light amber
  ]

  const genreToColor = {}
  clusters.forEach((cluster, index) => {
    genreToColor[cluster.id] = clusterColors[index % clusterColors.length]
  })

  nodes.forEach(node => {
    // Find the first genre that matches a cluster
    const matchedGenre = node.genres.find(g => genreToColor[g])
    node.color = matchedGenre ? genreToColor[matchedGenre] : '#6366f1' // Default to cosmic indigo
    node.primaryGenre = matchedGenre || node.genres[0] || 'unknown'
  })
}

/**
 * Format genre name for display
 */
function formatGenreName(genre) {
  return genre
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Calculate cluster positions for labels
 * Returns approximate center of each genre cluster
 */
export function calculateClusterCenters(nodes, clusters) {
  return clusters.map(cluster => {
    const clusterNodes = nodes.filter(n => n.genres.includes(cluster.id))
    
    if (clusterNodes.length === 0) {
      return { ...cluster, x: 0, y: 0 }
    }

    // Calculate centroid (will be updated after graph simulation)
    const avgX = clusterNodes.reduce((sum, n) => sum + (n.x || 0), 0) / clusterNodes.length
    const avgY = clusterNodes.reduce((sum, n) => sum + (n.y || 0), 0) / clusterNodes.length

    return {
      ...cluster,
      x: avgX,
      y: avgY
    }
  })
}

/**
 * Calculate spatial genre regions with mixed names
 * Each label is anchored to a specific node so it moves with the graph
 */
export function calculateSpatialGenreLabels(nodes, gridSize = 150) {
  if (!nodes || nodes.length === 0) return []
  
  // Find bounds of the graph
  const xs = nodes.filter(n => Number.isFinite(n.x)).map(n => n.x)
  const ys = nodes.filter(n => Number.isFinite(n.y)).map(n => n.y)
  
  if (xs.length === 0 || ys.length === 0) return []
  
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  
  // Create grid cells
  const cells = {}
  
  nodes.forEach(node => {
    if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) return
    
    const cellX = Math.floor((node.x - minX) / gridSize)
    const cellY = Math.floor((node.y - minY) / gridSize)
    const cellKey = `${cellX},${cellY}`
    
    if (!cells[cellKey]) {
      cells[cellKey] = {
        nodes: [],
        genres: {}
      }
    }
    
    cells[cellKey].nodes.push(node)
    node.genres.forEach(genre => {
      cells[cellKey].genres[genre] = (cells[cellKey].genres[genre] || 0) + 1
    })
  })
  
  // Process cells to create labels
  const labels = []
  const usedNodeIds = new Set() // Prevent using same anchor node twice
  
  // Sort cells by node count to prioritize larger clusters
  const sortedCells = Object.entries(cells)
    .map(([key, cell]) => ({ key, ...cell }))
    .filter(cell => cell.nodes.length >= 3)
    .sort((a, b) => b.nodes.length - a.nodes.length)
  
  for (const cell of sortedCells) {
    if (labels.length >= 12) break
    
    // Get top genres for this cell
    const sortedGenres = Object.entries(cell.genres)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([genre]) => genre)
    
    if (sortedGenres.length === 0) continue
    
    // Find the best anchor node - prefer larger nodes (higher val) that aren't already used
    const dominantGenre = sortedGenres[0]
    const eligibleNodes = cell.nodes
      .filter(n => !usedNodeIds.has(n.id) && n.genres.includes(dominantGenre))
      .sort((a, b) => (b.val || 0) - (a.val || 0))
    
    if (eligibleNodes.length === 0) continue
    
    const anchorNode = eligibleNodes[0]
    usedNodeIds.add(anchorNode.id)
    
    // Check distance from existing labels (using anchor nodes)
    const tooClose = labels.some(existing => {
      const existingAnchor = existing.anchorNode
      if (!existingAnchor) return false
      const dist = Math.sqrt(
        Math.pow(anchorNode.x - existingAnchor.x, 2) + 
        Math.pow(anchorNode.y - existingAnchor.y, 2)
      )
      return dist < gridSize * 1.2
    })
    
    if (tooClose) continue
    
    // Generate mixed genre name
    const mixedName = generateMixedGenreName(sortedGenres)
    
    labels.push({
      id: cell.key,
      name: mixedName,
      anchorNodeId: anchorNode.id,
      anchorNode: anchorNode, // Direct reference for position tracking
      nodeCount: cell.nodes.length,
      color: anchorNode.color || '#6366f1',
      genres: sortedGenres
    })
  }
  
  return labels
}

/**
 * Generate a creative mixed genre name from multiple genres
 */
function generateMixedGenreName(genres) {
  if (genres.length === 0) return 'Unknown'
  if (genres.length === 1) return formatGenreName(genres[0])
  
  // Extract meaningful parts from genre names
  const parts = genres.map(g => {
    // Split genre into words
    const words = g.toLowerCase().split(/[\s-]+/)
    return { full: g, words }
  })
  
  // Common genre modifiers to potentially combine
  const modifiers = ['indie', 'alt', 'alternative', 'modern', 'neo', 'post', 'new', 'dark', 'lo-fi', 'experimental', 'progressive', 'psychedelic', 'classic', 'deep', 'tropical', 'melodic', 'hard', 'soft']
  const coreGenres = ['rock', 'pop', 'hip hop', 'rap', 'electronic', 'edm', 'house', 'techno', 'jazz', 'soul', 'r&b', 'metal', 'punk', 'folk', 'country', 'blues', 'classical', 'ambient', 'wave', 'core', 'trap', 'bass', 'dance']
  
  // Try to find a modifier and a core genre
  let foundModifier = null
  let foundCore = null
  let uniqueDescriptor = null
  
  for (const part of parts) {
    for (const word of part.words) {
      if (!foundModifier && modifiers.includes(word)) {
        foundModifier = word
      }
      if (!foundCore && coreGenres.some(c => c.includes(word) || word.includes(c.split(' ')[0]))) {
        foundCore = word
      }
      // Look for unique descriptors that aren't common modifiers or cores
      if (!uniqueDescriptor && !modifiers.includes(word) && !coreGenres.some(c => c.includes(word))) {
        if (word.length > 3) {
          uniqueDescriptor = word
        }
      }
    }
  }
  
  // Build the mixed name
  let result = ''
  
  // Strategy 1: Modifier + Core combo
  if (foundModifier && foundCore) {
    result = `${foundModifier} ${foundCore}`
  }
  // Strategy 2: Use first genre with unique twist
  else if (uniqueDescriptor && foundCore) {
    result = `${uniqueDescriptor} ${foundCore}`
  }
  // Strategy 3: Blend first two genres
  else if (genres.length >= 2) {
    const first = parts[0].words[0]
    const second = parts[1].words[parts[1].words.length - 1]
    
    if (first !== second) {
      result = `${first}-${second}`
    } else {
      result = genres[0]
    }
  }
  // Fallback: Just use the first genre
  else {
    result = genres[0]
  }
  
  return formatGenreName(result)
}

