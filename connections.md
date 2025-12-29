# Connections Mode — Frontend Design

*Brainstorming UI/UX for the artist path-finding game*

---

## Core Concept

**The Challenge:** Connect Artist A to Artist B by clicking through similar artists.

**The Experience:** Turn the passive constellation into an interactive exploration game. Each click reveals new connections, building a path across your music universe.

---

## User Journey

### Entry Points

**Where does Connections Mode live?**

**Chosen Solution: Mode Selector Dropdown**

```
Header layout:
┌────────────────────────────────────────────────────┐
│ CANERIS  [Explore ▾]        ⚙️  Logout             │
└────────────────────────────────────────────────────┘
              │
              ↓ (click opens dropdown)
         ┌─────────────────┐
         │ 🌌 Explore      │ ← currently active
         │ 🎮 Connections  │
         └─────────────────┘
```

**Why this works:**
- **Clean header** - Doesn't clutter the cosmic constellation view
- **Scalable** - Easy to add future modes (Friends, etc.) without redesigning
- **Discoverable** - Mode name is always visible ("Explore ▾")
- **Familiar pattern** - Similar to view switchers in other apps
- **One click** - Open dropdown, select mode

**Visual Design:**
- Mode selector sits next to CANERIS logo
- Matches existing frosted glass aesthetic (backdrop-filter blur)
- Dropdown has smooth animations (fade + slide)
- Icons for visual clarity (🌌 Explore, 🎮 Connections)
- Active mode highlighted with accent color
- Mobile responsive (collapses gracefully)

**Implementation:**
See `navigation-mockup.html` for full interactive prototype with cosmic theme styling.

---

## Game Flow — Relaxed Mode

### Step 1: Challenge Setup

**UI appears as overlay/modal:**

```
┌────────────────────────────────────────────┐
│          🌟 Connections Challenge          │
│                                            │
│   Connect these two artists:               │
│                                            │
│   🎵 Radiohead ────────?────────→ 🎵 Doja Cat │
│                                            │
│   [ 🎲 Different Challenge ]  [ ▶ Start ] │
└────────────────────────────────────────────┘
```

**Challenge Selection:**
- **Smart selection:** Picks artists 3-6 hops apart (interesting but not impossible)
- Starts from popular artists (ones you listen to most) for familiarity

---

### Step 2: Playing the Game — Text Input Mode

**Core Mechanic Change:** Instead of clicking visible nodes, you **type artist names** into a text input. This makes it a knowledge/memory game — you have to know which artists are connected.

**The constellation transforms:**

```
┌─────────────────────────────────────────────────┐
│  [X]  Connections Mode                 Hops: 0  │
├─────────────────────────────────────────────────┤
│                                                 │
│                                                 │
│       ●  ●  ●  ●  ●  ●  ●  ●  ●  ●             │
│     ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●            │
│       ●  ●  [RADIOHEAD]  ●  ●  ●  ●            │
│     ●  ●  ●  ●  ●  ●  ●  ●  ●  ●               │
│       ●  ●  ●  ●  ●  ●  [DOJA CAT]  ●          │
│     ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●            │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│   Path: Radiohead → ?                           │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │  Type an artist name...              🔍 │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Visual State:**
- **All artists:** Blacked out / invisible (just dark circles)
- **Starting artist:** Glowing, labeled (e.g., "RADIOHEAD")
- **Target artist:** Glowing, labeled (e.g., "DOJA CAT")
- **Tried artists:** Revealed when guessed (successful or not)
- **Current path:** Shown in a list below the graph

**Why this works:**
- Tests your actual music knowledge, not just clicking
- More challenging — you can't see the connections
- Feels like a trivia/puzzle game
- Failed guesses still reveal that artist on the map

---

### Step 3: Making Guesses

**User types an artist name:**

```
Input: "Bjork"
```

**What happens:**

**If valid connection (Björk IS connected to Radiohead):**
1. ✅ Success feedback (green flash, sound)
2. Björk is revealed on the graph (glows)
3. Path updates: `Radiohead → Björk`
4. Björk becomes new "current" position
5. Hop count increments: `Hops: 1`

**If invalid connection (artist exists but NOT connected):**
1. ❌ Fail feedback (red flash, shake)
2. Artist is revealed on graph (dimmed, marked as tried)
3. Message: "Muse isn't connected to Radiohead"
4. No hop added, but guess is recorded
5. Player learns something about graph structure

**If artist not in graph:**
1. ⚠️ "Artist not found in your listening history"
2. No change to graph

**Visual after a few guesses:**

```
┌─────────────────────────────────────────────────┐
│       ●  ●  ●  ●  ●  ●  ●  ●  ●  ●             │
│     ●  ●  [MUSE ❌]  ●  ●  ●  ●  ●             │
│       ●  ●  [RADIOHEAD]  ●  ●  ●  ●            │
│     ●  ●  ━━━━━━━━━━  ●  ●  ●  ●               │
│       ●  ●  [BJÖRK ✓]  ●  [DOJA CAT]  ●        │
│     ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●            │
│                                                 │
└─────────────────────────────────────────────────┘

Bottom panel:
┌─────────────────────────────────────────────────┐
│                                                 │
│   Your Path (click to go back):                 │
│   ┌─────────────────────────────────────────┐   │
│   │ [Radiohead] → [Björk] → ?               │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │  Type an artist name...              🔍 │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### Interactive Path List

The path list at the bottom is **clickable** — you can go back to any previous point:

```
Your Path (click to go back):
┌──────────────────────────────────────────────────┐
│ [Radiohead] → [Björk] → [FKA twigs] → ?          │
└──────────────────────────────────────────────────┘

User clicks [Björk]...

Your Path (click to go back):
┌──────────────────────────────────────────────────┐
│ [Radiohead] → [Björk] → ?                        │
└──────────────────────────────────────────────────┘
```

**Backtrack behavior:**
- Click any artist in the path to return to that point
- Everything after that point is removed from the path
- Hop count adjusts accordingly
- Artists you've revealed stay visible on the graph (they don't re-hide)
- Useful when you hit a dead end and want to try a different route

---

### Step 4: Completion

**User types "Doja Cat" and she's connected to current artist!**

```
┌────────────────────────────────────────────┐
│          🎉 Connection Found!              │
│                                            │
│   Your path:                               │
│                                            │
│   Radiohead                                │
│      ↓                                     │
│   Björk                                    │
│      ↓                                     │
│   FKA twigs                                │
│      ↓                                     │
│   Doja Cat                                 │
│                                            │
│   ✨ 3 hops • 5 guesses                    │
│                                            │
│   [ 🔄 New Challenge ]  [ ✕ Exit ]        │
│   [ 📤 Share Result ]                      │
└────────────────────────────────────────────┘
```

**The full path is highlighted on the constellation, with all tried artists visible.**

---

### Input UX Details

**Text Input with Autocomplete:**

The text input has autocomplete enabled — as you type, matching artists from your graph appear:

```
┌─────────────────────────────────────────┐
│  bj                                  🔍 │
├─────────────────────────────────────────┤
│  Björk                                  │
│  BJ the Chicago Kid                     │
│  Blackjack                              │
└─────────────────────────────────────────┘
```

**Autocomplete Features:**
- **Fuzzy matching:** "bjork" matches "Björk", handles accents/caps
- **Your artists only:** Only shows artists in YOUR graph (not all artists ever)
- **Click or Enter:** Select from dropdown or press Enter to submit
- **Keyboard navigation:** Arrow keys to move through suggestions

**Why autocomplete is OK:**
- Helps with spelling (especially for artists with unusual names)
- Still requires knowing which artists are likely connected
- Doesn't show connections — just artist names
- Makes the game accessible without being too easy

---

## Game Flow — Competitive Mode

### Differences from Relaxed:

**1. Timer**
```
Top bar:
┌─────────────────────────────────────────────┐
│ ⏱️ 2:34  |  Hops: 2  |  Target: Doja Cat    │
└─────────────────────────────────────────────┘
```

**2. Hints (Optional)**
```
[ 💡 Hint (-10 points) ]

When clicked:
"One path goes through an artist known for experimental R&B"
```

**3. Scoring**
```
Completion screen:
┌────────────────────────────────────────────┐
│          🎉 Connection Found!              │
│                                            │
│   Score: 850 points                        │
│                                            │
│   • Hops: 3 (+300)                         │
│   • Time bonus: +550                       │
│   • Hints used: 0                          │
│                                            │
│   Personal best: 920 pts                   │
│   Today's challenge: Top 10%! 🏆           │
│                                            │
│   [ 📤 Challenge Friend ]                  │
│   [ 🔄 Try Again ]                         │
└────────────────────────────────────────────┘
```

**4. Daily Challenge**
```
Everyone gets the same challenge:
"Daily Challenge: Connect Kendrick Lamar → ABBA"

Leaderboard shows:
1. friend_username - 3 hops, 2:14, 980 pts
2. you - 4 hops, 3:02, 750 pts
3. other_user - 4 hops, 3:45, 690 pts
```

---

## Visual Design

### Color Palette

**Game State Colors:**
- **Current node:** Bright gold/white glow `#FFD700`
- **Active path:** Electric blue trail `#60A5FA`
- **Available connections:** Pulsing white outline
- **Dimmed nodes:** 10% opacity
- **Target node:** Magenta/pink beacon `#EC4899`

### Animations

**Node Reveal:**
```
When you click a node:
1. Its connections fade in (300ms ease-out)
2. Lines draw from center outward (staggered 50ms each)
3. Connected nodes scale from 0.8 → 1.0
```

**Path Building:**
```
When path grows:
1. New line glows bright then settles (500ms)
2. Previous node in path dims slightly
3. Hop counter animates (+1 with bounce)
```

**Completion:**
```
1. Full path pulses bright
2. Stars/particles burst from target
3. Success modal slides up from bottom
```

---

## Component Breakdown

### New Components Needed

**1. `ConnectionsMode.jsx`**
Main container component
- Manages game state (current node, path, hops, timer)
- Handles graph filtering (show only relevant nodes)
- Renders UI overlays

**2. `ConnectionsOverlay.jsx`**
Top bar showing game info
- Hop count
- Timer (competitive mode)
- Target artist
- Exit button

**3. `ConnectionsSetup.jsx`**
Challenge setup modal
- Artist selection/display
- Mode toggle (relaxed/competitive)
- Start button

**4. `ConnectionsResult.jsx`**
Completion screen
- Path visualization (list)
- Stats/scoring
- Share/replay actions

**5. `ConnectionsGraph.jsx`** (or extend existing `Graph.jsx`)
Modified graph rendering for game mode
- Dims irrelevant nodes
- Highlights active path
- Shows target beacon
- Handles special click behavior

### Modified Components

**`Graph.jsx`**
- Needs to accept `mode` prop: `'explore' | 'connections'`
- In connections mode:
  - Filter visible nodes
  - Change click behavior (build path instead of showing details)
  - Highlight current/target nodes

**`App.jsx`**
- Add mode state
- Route to ConnectionsMode when active
- Pass mode to Graph

---

## State Management

### Game State

```javascript
const [connectionsState, setConnectionsState] = useState({
  active: false,
  mode: 'relaxed', // or 'competitive'

  // Challenge
  startArtist: null,
  targetArtist: null,

  // Progress
  currentArtist: null,
  path: [], // Array of artist IDs
  hops: 0,

  // Competitive
  startTime: null,
  hintsUsed: 0,

  // Completion
  completed: false,
  finalStats: null,
})
```

### Available Connections

```javascript
// Which artists can be clicked right now?
const availableConnections = useMemo(() => {
  if (!connectionsState.currentArtist) return []

  // Get all links from current artist
  const links = graphData.links.filter(
    link => link.source.id === connectionsState.currentArtist.id
         || link.target.id === connectionsState.currentArtist.id
  )

  // Return the connected artist nodes
  return links.map(link =>
    link.source.id === connectionsState.currentArtist.id
      ? link.target
      : link.source
  )
}, [connectionsState.currentArtist, graphData])
```

---

## Interaction Details

### Click Behavior in Connections Mode

**Normal mode:**
- Single click → highlight connections
- Double click → open artist modal

**Connections mode:**
- Click available connection → add to path
- Click non-available node → no action (maybe shake animation?)
- Click target artist → WIN! (if it's available)

### Undo/Back

```
Should users be able to undo steps?

Option A: No undo (pure pathfinding)
Option B: Undo last hop (exploration-friendly)
Option C: Restart from beginning

Recommendation: Option B for relaxed, Option A for competitive
```

**Undo UI:**
```
Top bar:
[ ← Undo Last ]  Hops: 3  Target: Doja Cat
```

### Hints System

**What does a hint reveal?**

1. **Direction hint:** "Try exploring more experimental artists"
2. **Genre hint:** "One path goes through trip-hop"
3. **Artist hint:** "Portishead might be a good step"
4. **Reveal connection:** Show one valid next artist (dimmed)

**Recommendation:** Start with genre/direction hints, avoid giving away the answer directly.

---

## Mobile Considerations

### Layout Adjustments

**Challenge Setup:**
- Stack artists vertically instead of horizontal
- Larger touch targets

**Game View:**
- Top bar becomes sticky header
- Target artist in compact form (just name + small image)
- Path visualization: vertical list on left edge?

**Completion:**
- Full-screen modal (slides up from bottom)
- Path as vertical timeline

### Touch Interactions

- Single tap = select (no double-tap needed)
- Pinch to zoom still works
- Pan to explore

---

## Data Requirements

### What We Already Have

✅ Artist similarity data (`getSimilarArtists` from Last.fm)
✅ Graph structure (nodes + links)
✅ Artist metadata (images, genres, etc.)

### What We Need to Add

**Challenge Generation:**
- Algorithm to pick two artists N hops apart
- Fallback for disconnected graph components

**Pathfinding:**
- BFS to verify path exists
- Calculate optimal path length (for scoring)
- Track visited nodes

**Scoring (Competitive):**
- Formula: `baseScore - (hops * hopPenalty) + timeBonus - (hints * hintPenalty)`
- Leaderboard storage (backend needed)

---

## Open Questions

### Game Design

- [ ] What's the ideal hop distance? (3-6? Dynamic based on graph size?)
- [ ] Should target artist be visible at all times, or hidden until close?
- [ ] Can you revisit artists in your path? (probably yes, but it adds hops)
- [ ] What happens if you get stuck? (give up button? auto-hint after N tries?)

### Visual Design

- [ ] Does the full constellation stay visible (dimmed) or hide completely?
- [ ] How do we show the "distance" to target? (spatial? hop counter? both?)
- [ ] Should discovered artists stay clickable? (backtracking)

### UX Flow

- [ ] Can you switch from relaxed to competitive mid-game?
- [ ] Auto-start next challenge or return to explore mode?
- [ ] Save progress if you exit mid-game?

### Performance

- [ ] For large graphs (100+ nodes), how to optimize rendering?
- [ ] Precompute possible paths? Or calculate on-the-fly?

---

## Next Steps

1. **Prototype basic version** (relaxed mode only)
   - Challenge setup screen
   - Path building mechanic
   - Completion screen

2. **Test with real data**
   - Does it feel fun?
   - Are challenges too easy/hard?
   - Is the UI clear?

3. **Add competitive features**
   - Timer
   - Scoring
   - Hints

4. **Polish & iterate**
   - Animations
   - Sound effects?
   - Tutorial/onboarding

---

## Wild Ideas

- **Path Playlist:** Generate a Spotify playlist that "walks" your path (tracks from each artist)
- **Community Challenges:** "Can you beat the community average of 4.2 hops?"
- **Achievement System:** "Speed Demon" (under 1 min), "Scenic Route" (10+ hops), etc.
- **Path Gallery:** Save and browse your favorite paths
- **Multiplayer:** Race against a friend in real-time to find a path first

---
---

# Implementation Guide

This section provides a detailed, step-by-step guide for implementing Connections Mode.

---

## Phase 1: Project Structure

### New Files to Create

```
src/
├── components/
│   ├── connections/
│   │   ├── ConnectionsMode.jsx      # Main container/orchestrator
│   │   ├── ConnectionsMode.css      # Styles for all connections components
│   │   ├── ConnectionsSetup.jsx     # Challenge setup modal
│   │   ├── ConnectionsOverlay.jsx   # In-game HUD (hops, timer, target)
│   │   └── ConnectionsResult.jsx    # Completion screen
│   └── ModeSelector.jsx             # Header dropdown (Explore/Connections)
│   └── ModeSelector.css
├── hooks/
│   └── useConnectionsGame.js        # Game state & logic hook
├── utils/
│   └── pathfinding.js               # BFS, challenge generation algorithms
└── config/
    └── connectionsConfig.js         # Game settings (hop ranges, scoring, etc.)
```

### Files to Modify

```
src/
├── App.jsx                          # Add mode state, render ConnectionsMode
├── App.css                          # Minor adjustments for mode switching
├── components/
│   └── Graph.jsx                    # Accept mode prop, modify rendering/clicks
```

---

## Phase 2: Core Algorithms

### 2.1 Pathfinding Utilities (`src/utils/pathfinding.js`)

```javascript
/**
 * Pathfinding and challenge generation utilities for Connections Mode
 */

/**
 * Build an adjacency list from graph links for fast traversal
 * @param {Array} links - Graph links array
 * @returns {Map} - Map of artistId -> Set of connected artistIds
 */
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

/**
 * BFS to find shortest path between two artists
 * @param {Map} adjacency - Adjacency list
 * @param {string} startId - Starting artist ID
 * @param {string} targetId - Target artist ID
 * @returns {Array|null} - Array of artist IDs representing path, or null if no path
 */
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

  return null // No path exists
}

/**
 * Calculate distance (hop count) between two artists
 * @param {Map} adjacency - Adjacency list
 * @param {string} startId - Starting artist ID
 * @param {string} targetId - Target artist ID
 * @returns {number} - Number of hops, or -1 if no path
 */
export function getDistance(adjacency, startId, targetId) {
  const path = findShortestPath(adjacency, startId, targetId)
  return path ? path.length - 1 : -1
}

/**
 * Find all artists at exactly N hops from a starting artist
 * @param {Map} adjacency - Adjacency list
 * @param {string} startId - Starting artist ID
 * @param {number} distance - Exact hop distance
 * @returns {Array} - Array of artist IDs at that distance
 */
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

/**
 * Generate a challenge (start + target artists)
 * Ensures interesting challenge by picking artists at appropriate distance
 *
 * @param {Array} nodes - Graph nodes array
 * @param {Map} adjacency - Adjacency list
 * @param {Object} options - Challenge options
 * @param {number} options.minHops - Minimum hop distance (default: 3)
 * @param {number} options.maxHops - Maximum hop distance (default: 6)
 * @param {boolean} options.preferPopular - Start from popular artists (default: true)
 * @returns {Object|null} - { startArtist, targetArtist, optimalPath } or null
 */
export function generateChallenge(nodes, adjacency, options = {}) {
  const {
    minHops = 3,
    maxHops = 6,
    preferPopular = true
  } = options

  if (nodes.length < 2) return null

  // Sort nodes by popularity (val = node size based on listening)
  const sortedNodes = [...nodes].sort((a, b) => (b.val || 0) - (a.val || 0))

  // Try to find a valid challenge
  const maxAttempts = 50

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Pick start artist (prefer popular ones for familiarity)
    const startIndex = preferPopular
      ? Math.floor(Math.random() * Math.min(20, sortedNodes.length))
      : Math.floor(Math.random() * sortedNodes.length)

    const startArtist = sortedNodes[startIndex]

    // Find candidates at valid distances
    const candidates = []

    for (let dist = minHops; dist <= maxHops; dist++) {
      const atDistance = findArtistsAtDistance(adjacency, startArtist.id, dist)
      candidates.push(...atDistance.map(id => ({ id, distance: dist })))
    }

    if (candidates.length === 0) continue

    // Pick a random target from candidates
    const targetCandidate = candidates[Math.floor(Math.random() * candidates.length)]
    const targetArtist = nodes.find(n => n.id === targetCandidate.id)

    if (!targetArtist) continue

    // Verify path exists and get optimal path
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

  return null // Could not generate valid challenge
}

/**
 * Get all neighbors (connected artists) for a given artist
 * @param {Map} adjacency - Adjacency list
 * @param {string} artistId - Artist ID
 * @param {Array} nodes - Full nodes array (to return node objects)
 * @returns {Array} - Array of connected artist node objects
 */
export function getConnectedArtists(adjacency, artistId, nodes) {
  const neighborIds = adjacency.get(artistId) || new Set()
  const nodeMap = new Map(nodes.map(n => [n.id, n]))

  return Array.from(neighborIds)
    .map(id => nodeMap.get(id))
    .filter(Boolean)
}

/**
 * Validate if a move is legal (target is connected to current)
 * @param {Map} adjacency - Adjacency list
 * @param {string} currentId - Current artist ID
 * @param {string} targetId - Target artist ID to move to
 * @returns {boolean}
 */
export function isValidMove(adjacency, currentId, targetId) {
  const neighbors = adjacency.get(currentId)
  return neighbors ? neighbors.has(targetId) : false
}
```

---

### 2.2 Game Configuration (`src/config/connectionsConfig.js`)

```javascript
/**
 * Connections Mode configuration
 */

export const CONNECTIONS_CONFIG = {
  // Challenge generation
  challenge: {
    minHops: 3,           // Minimum distance for challenges
    maxHops: 6,           // Maximum distance for challenges
    preferPopular: true,  // Start from well-known artists
  },

  // Gameplay
  gameplay: {
    allowUndo: true,      // Allow undo in relaxed mode
    allowRevisit: true,   // Can revisit artists (adds hops)
    showOptimalPath: true // Show optimal path on completion
  },

  // Competitive mode
  competitive: {
    enabled: false,       // Start with relaxed only
    timeLimit: 180,       // 3 minutes in seconds
    hintCost: 50,         // Points deducted per hint
    scoring: {
      baseScore: 1000,
      hopPenalty: 100,    // Points lost per hop over optimal
      timeBonus: 2,       // Points per second remaining
    }
  },

  // Visual settings
  visuals: {
    dimmedOpacity: 0.15,          // Opacity for non-active nodes
    pathColor: '#60A5FA',         // Electric blue for path
    currentNodeColor: '#FFD700',  // Gold for current position
    targetNodeColor: '#EC4899',   // Pink/magenta for target
    availableNodePulse: true,     // Pulse animation on clickable nodes
  },

  // Animation durations (ms)
  animations: {
    nodeReveal: 300,
    pathDraw: 500,
    hopTransition: 400,
  }
}
```

---

## Phase 3: React Components

### 3.1 Game State Hook (`src/hooks/useConnectionsGame.js`)

```javascript
import { useState, useCallback, useMemo, useEffect } from 'react'
import {
  buildAdjacencyList,
  generateChallenge,
  findShortestPath,
  isValidMove,
  getConnectedArtists
} from '../utils/pathfinding'
import { CONNECTIONS_CONFIG } from '../config/connectionsConfig'

/**
 * Custom hook to manage Connections game state and logic
 */
export function useConnectionsGame(graphData) {
  // Build adjacency list when graph data changes
  const adjacency = useMemo(() => {
    if (!graphData?.links) return new Map()
    return buildAdjacencyList(graphData.links)
  }, [graphData?.links])

  // Game state
  const [gameState, setGameState] = useState({
    phase: 'idle', // 'idle' | 'setup' | 'playing' | 'complete'
    mode: 'relaxed', // 'relaxed' | 'competitive'

    // Challenge
    startArtist: null,
    targetArtist: null,
    optimalPath: null,
    optimalHops: 0,

    // Progress
    currentArtist: null,
    path: [],
    hops: 0,

    // Competitive
    startTime: null,
    endTime: null,
    hintsUsed: 0,
    score: 0,
  })

  // Available connections from current position
  const availableConnections = useMemo(() => {
    if (!gameState.currentArtist || !graphData?.nodes) return []
    return getConnectedArtists(adjacency, gameState.currentArtist.id, graphData.nodes)
  }, [gameState.currentArtist, adjacency, graphData?.nodes])

  // Check if an artist is clickable
  const isClickable = useCallback((artistId) => {
    if (gameState.phase !== 'playing') return false
    if (!gameState.currentArtist) return false
    return isValidMove(adjacency, gameState.currentArtist.id, artistId)
  }, [gameState.phase, gameState.currentArtist, adjacency])

  // Start a new game
  const startGame = useCallback((mode = 'relaxed') => {
    if (!graphData?.nodes || graphData.nodes.length < 2) {
      console.error('Not enough nodes to start game')
      return false
    }

    const challenge = generateChallenge(
      graphData.nodes,
      adjacency,
      CONNECTIONS_CONFIG.challenge
    )

    if (!challenge) {
      console.error('Could not generate challenge')
      return false
    }

    setGameState({
      phase: 'setup',
      mode,
      startArtist: challenge.startArtist,
      targetArtist: challenge.targetArtist,
      optimalPath: challenge.optimalPath,
      optimalHops: challenge.optimalHops,
      currentArtist: null,
      path: [],
      hops: 0,
      startTime: null,
      endTime: null,
      hintsUsed: 0,
      score: 0,
    })

    return true
  }, [graphData?.nodes, adjacency])

  // Begin playing (after setup screen)
  const beginPlaying = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      phase: 'playing',
      currentArtist: prev.startArtist,
      path: [prev.startArtist.id],
      hops: 0,
      startTime: Date.now(),
    }))
  }, [])

  // Make a move to another artist
  const makeMove = useCallback((artist) => {
    if (gameState.phase !== 'playing') return false
    if (!isValidMove(adjacency, gameState.currentArtist.id, artist.id)) return false

    const newPath = [...gameState.path, artist.id]
    const newHops = gameState.hops + 1

    // Check if we reached the target
    const isComplete = artist.id === gameState.targetArtist.id

    if (isComplete) {
      const endTime = Date.now()
      const timeElapsed = (endTime - gameState.startTime) / 1000

      // Calculate score for competitive mode
      let score = 0
      if (gameState.mode === 'competitive') {
        const { baseScore, hopPenalty, timeBonus } = CONNECTIONS_CONFIG.competitive.scoring
        const hopsOverOptimal = Math.max(0, newHops - gameState.optimalHops)
        const timeRemaining = Math.max(0, CONNECTIONS_CONFIG.competitive.timeLimit - timeElapsed)

        score = baseScore
          - (hopsOverOptimal * hopPenalty)
          + Math.floor(timeRemaining * timeBonus)
          - (gameState.hintsUsed * CONNECTIONS_CONFIG.competitive.hintCost)

        score = Math.max(0, score)
      }

      setGameState(prev => ({
        ...prev,
        phase: 'complete',
        currentArtist: artist,
        path: newPath,
        hops: newHops,
        endTime,
        score,
      }))
    } else {
      setGameState(prev => ({
        ...prev,
        currentArtist: artist,
        path: newPath,
        hops: newHops,
      }))
    }

    return true
  }, [gameState, adjacency])

  // Undo last move (relaxed mode only)
  const undoMove = useCallback(() => {
    if (gameState.phase !== 'playing') return false
    if (gameState.mode !== 'relaxed') return false
    if (gameState.path.length <= 1) return false

    const newPath = gameState.path.slice(0, -1)
    const prevArtistId = newPath[newPath.length - 1]
    const prevArtist = graphData.nodes.find(n => n.id === prevArtistId)

    setGameState(prev => ({
      ...prev,
      currentArtist: prevArtist,
      path: newPath,
      hops: prev.hops - 1,
    }))

    return true
  }, [gameState, graphData?.nodes])

  // Use a hint (competitive mode)
  const useHint = useCallback(() => {
    if (gameState.phase !== 'playing') return null

    // Find the next artist in the optimal path
    const currentIndex = gameState.optimalPath.indexOf(gameState.currentArtist.id)
    if (currentIndex === -1 || currentIndex >= gameState.optimalPath.length - 1) return null

    const hintArtistId = gameState.optimalPath[currentIndex + 1]
    const hintArtist = graphData.nodes.find(n => n.id === hintArtistId)

    setGameState(prev => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1,
    }))

    return hintArtist
  }, [gameState, graphData?.nodes])

  // Reset/exit game
  const exitGame = useCallback(() => {
    setGameState({
      phase: 'idle',
      mode: 'relaxed',
      startArtist: null,
      targetArtist: null,
      optimalPath: null,
      optimalHops: 0,
      currentArtist: null,
      path: [],
      hops: 0,
      startTime: null,
      endTime: null,
      hintsUsed: 0,
      score: 0,
    })
  }, [])

  // Generate new challenge (keep current mode)
  const newChallenge = useCallback(() => {
    startGame(gameState.mode)
  }, [startGame, gameState.mode])

  return {
    // State
    gameState,
    availableConnections,

    // Computed
    isPlaying: gameState.phase === 'playing',
    isComplete: gameState.phase === 'complete',
    canUndo: gameState.phase === 'playing'
      && gameState.mode === 'relaxed'
      && gameState.path.length > 1,

    // Actions
    startGame,
    beginPlaying,
    makeMove,
    undoMove,
    useHint,
    exitGame,
    newChallenge,

    // Utilities
    isClickable,
  }
}
```

---

### 3.2 Mode Selector (`src/components/ModeSelector.jsx`)

```javascript
import { useState, useRef, useEffect } from 'react'
import './ModeSelector.css'

const MODES = [
  { id: 'explore', label: 'Explore', icon: '🌌' },
  { id: 'connections', label: 'Connections', icon: '🎮' },
]

function ModeSelector({ currentMode, onModeChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const currentModeData = MODES.find(m => m.id === currentMode) || MODES[0]

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleModeSelect = (modeId) => {
    onModeChange(modeId)
    setIsOpen(false)
  }

  return (
    <div className="mode-selector" ref={dropdownRef}>
      <button
        className="mode-selector__button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>{currentModeData.label}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={isOpen ? 'rotated' : ''}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div className={`mode-selector__dropdown ${isOpen ? 'open' : ''}`}>
        {MODES.map(mode => (
          <button
            key={mode.id}
            className={`mode-selector__option ${currentMode === mode.id ? 'active' : ''}`}
            onClick={() => handleModeSelect(mode.id)}
          >
            <span className="mode-selector__option-icon">{mode.icon}</span>
            <span className="mode-selector__option-label">{mode.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ModeSelector
```

---

### 3.3 Connections Mode Container (`src/components/connections/ConnectionsMode.jsx`)

```javascript
import { useEffect } from 'react'
import { useConnectionsGame } from '../../hooks/useConnectionsGame'
import ConnectionsSetup from './ConnectionsSetup'
import ConnectionsOverlay from './ConnectionsOverlay'
import ConnectionsResult from './ConnectionsResult'
import './ConnectionsMode.css'

function ConnectionsMode({ graphData, onNodeClick, onExit }) {
  const {
    gameState,
    availableConnections,
    isPlaying,
    isComplete,
    canUndo,
    startGame,
    beginPlaying,
    makeMove,
    undoMove,
    useHint,
    exitGame,
    newChallenge,
    isClickable,
  } = useConnectionsGame(graphData)

  // Auto-start game when component mounts
  useEffect(() => {
    if (gameState.phase === 'idle') {
      startGame('relaxed')
    }
  }, []) // Only on mount

  // Handle node clicks from the graph
  const handleNodeClick = (node) => {
    if (!isPlaying) return

    if (isClickable(node.id)) {
      makeMove(node)
    }
    // Could add shake animation for invalid clicks
  }

  // Expose click handler to parent
  useEffect(() => {
    if (onNodeClick) {
      onNodeClick.current = handleNodeClick
    }
  }, [handleNodeClick])

  const handleExit = () => {
    exitGame()
    onExit?.()
  }

  return (
    <div className="connections-mode">
      {/* Setup Screen */}
      {gameState.phase === 'setup' && (
        <ConnectionsSetup
          startArtist={gameState.startArtist}
          targetArtist={gameState.targetArtist}
          optimalHops={gameState.optimalHops}
          onStart={beginPlaying}
          onNewChallenge={newChallenge}
          onExit={handleExit}
        />
      )}

      {/* In-Game Overlay */}
      {isPlaying && (
        <ConnectionsOverlay
          currentArtist={gameState.currentArtist}
          targetArtist={gameState.targetArtist}
          hops={gameState.hops}
          mode={gameState.mode}
          startTime={gameState.startTime}
          canUndo={canUndo}
          onUndo={undoMove}
          onExit={handleExit}
        />
      )}

      {/* Completion Screen */}
      {isComplete && (
        <ConnectionsResult
          path={gameState.path}
          hops={gameState.hops}
          optimalHops={gameState.optimalHops}
          optimalPath={gameState.optimalPath}
          mode={gameState.mode}
          score={gameState.score}
          startTime={gameState.startTime}
          endTime={gameState.endTime}
          nodes={graphData.nodes}
          onPlayAgain={newChallenge}
          onExit={handleExit}
        />
      )}
    </div>
  )
}

export default ConnectionsMode
```

---

### 3.4 Setup Screen (`src/components/connections/ConnectionsSetup.jsx`)

```javascript
import './ConnectionsMode.css'

function ConnectionsSetup({
  startArtist,
  targetArtist,
  optimalHops,
  onStart,
  onNewChallenge,
  onExit
}) {
  if (!startArtist || !targetArtist) return null

  return (
    <div className="connections-setup">
      <div className="connections-setup__card">
        <h2 className="connections-setup__title">
          🌟 Connections Challenge
        </h2>

        <p className="connections-setup__subtitle">
          Connect these two artists:
        </p>

        <div className="connections-setup__artists">
          <div className="connections-setup__artist">
            {startArtist.image && (
              <img
                src={startArtist.image}
                alt={startArtist.name}
                className="connections-setup__artist-image"
              />
            )}
            <span className="connections-setup__artist-name">
              {startArtist.name}
            </span>
          </div>

          <div className="connections-setup__arrow">
            <span>?</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>

          <div className="connections-setup__artist">
            {targetArtist.image && (
              <img
                src={targetArtist.image}
                alt={targetArtist.name}
                className="connections-setup__artist-image"
              />
            )}
            <span className="connections-setup__artist-name">
              {targetArtist.name}
            </span>
          </div>
        </div>

        <p className="connections-setup__hint">
          Can be done in {optimalHops} hops
        </p>

        <div className="connections-setup__actions">
          <button
            className="btn btn--ghost"
            onClick={onNewChallenge}
          >
            🎲 Different Challenge
          </button>
          <button
            className="btn btn--primary"
            onClick={onStart}
          >
            ▶ Start
          </button>
        </div>

        <button
          className="connections-setup__exit"
          onClick={onExit}
        >
          ✕ Exit
        </button>
      </div>
    </div>
  )
}

export default ConnectionsSetup
```

---

### 3.5 In-Game Overlay (`src/components/connections/ConnectionsOverlay.jsx`)

```javascript
import { useState, useEffect } from 'react'
import './ConnectionsMode.css'

function ConnectionsOverlay({
  currentArtist,
  targetArtist,
  hops,
  mode,
  startTime,
  canUndo,
  onUndo,
  onExit
}) {
  const [elapsed, setElapsed] = useState(0)

  // Timer for competitive mode
  useEffect(() => {
    if (mode !== 'competitive' || !startTime) return

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [mode, startTime])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="connections-overlay">
      <div className="connections-overlay__bar">
        <button
          className="connections-overlay__exit"
          onClick={onExit}
          title="Exit game"
        >
          ✕
        </button>

        {canUndo && (
          <button
            className="connections-overlay__undo"
            onClick={onUndo}
            title="Undo last move"
          >
            ← Undo
          </button>
        )}

        <div className="connections-overlay__stats">
          {mode === 'competitive' && (
            <span className="connections-overlay__timer">
              ⏱️ {formatTime(elapsed)}
            </span>
          )}

          <span className="connections-overlay__hops">
            Hops: {hops}
          </span>
        </div>

        <div className="connections-overlay__target">
          <span className="connections-overlay__target-label">Target:</span>
          {targetArtist.image && (
            <img
              src={targetArtist.image}
              alt={targetArtist.name}
              className="connections-overlay__target-image"
            />
          )}
          <span className="connections-overlay__target-name">
            {targetArtist.name}
          </span>
        </div>
      </div>

      {/* Current position indicator */}
      <div className="connections-overlay__current">
        <span>Now at: <strong>{currentArtist?.name}</strong></span>
      </div>
    </div>
  )
}

export default ConnectionsOverlay
```

---

### 3.6 Result Screen (`src/components/connections/ConnectionsResult.jsx`)

```javascript
import './ConnectionsMode.css'

function ConnectionsResult({
  path,
  hops,
  optimalHops,
  optimalPath,
  mode,
  score,
  startTime,
  endTime,
  nodes,
  onPlayAgain,
  onExit
}) {
  const timeElapsed = startTime && endTime
    ? ((endTime - startTime) / 1000).toFixed(1)
    : 0

  const wasOptimal = hops === optimalHops

  // Get node objects for path
  const nodeMap = new Map(nodes.map(n => [n.id, n]))
  const pathNodes = path.map(id => nodeMap.get(id)).filter(Boolean)

  return (
    <div className="connections-result">
      <div className="connections-result__card">
        <h2 className="connections-result__title">
          🎉 Connection Found!
        </h2>

        <div className="connections-result__path">
          <h3>Your path:</h3>
          <div className="connections-result__path-list">
            {pathNodes.map((node, index) => (
              <div key={node.id} className="connections-result__path-item">
                {node.image && (
                  <img
                    src={node.image}
                    alt={node.name}
                    className="connections-result__path-image"
                  />
                )}
                <span className="connections-result__path-name">
                  {node.name}
                </span>
                {index < pathNodes.length - 1 && (
                  <span className="connections-result__path-arrow">↓</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="connections-result__stats">
          <div className="connections-result__stat">
            <span className="connections-result__stat-value">{hops}</span>
            <span className="connections-result__stat-label">Hops</span>
          </div>

          {mode === 'competitive' && (
            <>
              <div className="connections-result__stat">
                <span className="connections-result__stat-value">{timeElapsed}s</span>
                <span className="connections-result__stat-label">Time</span>
              </div>

              <div className="connections-result__stat">
                <span className="connections-result__stat-value">{score}</span>
                <span className="connections-result__stat-label">Score</span>
              </div>
            </>
          )}
        </div>

        {wasOptimal ? (
          <p className="connections-result__optimal">
            ✨ Perfect! You found the optimal path!
          </p>
        ) : (
          <p className="connections-result__suboptimal">
            Optimal was {optimalHops} hops
          </p>
        )}

        <div className="connections-result__actions">
          <button
            className="btn btn--ghost"
            onClick={onExit}
          >
            ✕ Exit
          </button>
          <button
            className="btn btn--primary"
            onClick={onPlayAgain}
          >
            🔄 New Challenge
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConnectionsResult
```

---

## Phase 4: Graph Integration

### 4.1 Modify `Graph.jsx`

Key changes needed in the existing Graph component:

```javascript
// Add to Graph.jsx props
function Graph({
  data,
  onNodeClick,
  // ... existing props
  mode = 'explore',              // NEW: 'explore' | 'connections'
  connectionsState = null,       // NEW: game state from useConnectionsGame
  onConnectionsNodeClick = null, // NEW: handler for connections mode clicks
}) {

  // Determine if a node should be highlighted
  const getNodeHighlightState = useCallback((node) => {
    if (mode !== 'connections' || !connectionsState) {
      return 'normal'
    }

    const { currentArtist, targetArtist, path } = connectionsState

    if (node.id === currentArtist?.id) return 'current'
    if (node.id === targetArtist?.id) return 'target'
    if (path?.includes(node.id)) return 'path'

    // Check if node is a valid next move
    const isAvailable = connectionsState.availableConnections?.some(
      n => n.id === node.id
    )
    if (isAvailable) return 'available'

    return 'dimmed'
  }, [mode, connectionsState])

  // Modified node rendering
  const nodeCanvasObject = useCallback((node, ctx, globalScale) => {
    // ... existing guard clauses

    const highlightState = getNodeHighlightState(node)

    // Apply visual treatment based on state
    let nodeOpacity = 1
    let glowIntensity = 1
    let ringColor = 'rgba(255, 255, 255, 0.15)'

    switch (highlightState) {
      case 'current':
        glowIntensity = 3
        ringColor = '#FFD700' // Gold
        break
      case 'target':
        glowIntensity = 2.5
        ringColor = '#EC4899' // Pink
        break
      case 'path':
        glowIntensity = 1.5
        ringColor = '#60A5FA' // Blue
        break
      case 'available':
        glowIntensity = 1.8
        ringColor = 'rgba(255, 255, 255, 0.5)'
        // Add pulse animation via CSS or manual animation
        break
      case 'dimmed':
        nodeOpacity = 0.15
        glowIntensity = 0.3
        break
    }

    // Apply opacity
    ctx.globalAlpha = nodeOpacity

    // ... rest of existing node rendering with modified glow/ring

    ctx.globalAlpha = 1 // Reset
  }, [/* deps including getNodeHighlightState */])

  // Modified click handler
  const handleNodeClick = useCallback((node) => {
    if (!node) return

    if (mode === 'connections' && onConnectionsNodeClick) {
      onConnectionsNodeClick(node)
      return
    }

    // ... existing click handling for explore mode
  }, [mode, onConnectionsNodeClick, /* existing deps */])

  // ... rest of component
}
```

---

## Phase 5: App Integration

### 5.1 Modify `App.jsx`

```javascript
import { useState, useRef } from 'react'
// ... existing imports
import ModeSelector from './components/ModeSelector'
import ConnectionsMode from './components/connections/ConnectionsMode'

function App() {
  // ... existing state

  // NEW: App mode state
  const [appMode, setAppMode] = useState('explore') // 'explore' | 'connections'

  // NEW: Ref for connections node click handler
  const connectionsClickHandler = useRef(null)

  // ... existing code

  // Handle mode change
  const handleModeChange = (newMode) => {
    setAppMode(newMode)
    // Clear any selections when switching modes
    setSelectedArtist(null)
    setShowSettings(false)
  }

  // Handle connections mode exit
  const handleConnectionsExit = () => {
    setAppMode('explore')
  }

  return (
    <div className={appClasses}>
      <Starfield cameraOffset={cameraOffset} />

      <header className={headerClasses}>
        <div className="header__brand">
          <h1 className="header__title">CANERIS</h1>

          {/* NEW: Mode Selector */}
          {artists.length > 0 && (
            <ModeSelector
              currentMode={appMode}
              onModeChange={handleModeChange}
            />
          )}
        </div>

        {/* ... existing header actions */}
      </header>

      <main className="main">
        {dataLoading && artists.length === 0 ? (
          <Loader progress={progress} />
        ) : (
          <>
            <Graph
              data={graphData}
              onNodeClick={appMode === 'explore' ? setSelectedArtist : null}
              mode={appMode}
              // ... existing props
            />

            {/* NEW: Connections Mode Overlay */}
            {appMode === 'connections' && graphData.nodes.length > 0 && (
              <ConnectionsMode
                graphData={graphData}
                onNodeClick={connectionsClickHandler}
                onExit={handleConnectionsExit}
              />
            )}
          </>
        )}
      </main>

      {/* ... existing modals, but only show in explore mode */}
      {appMode === 'explore' && selectedArtist && (
        <ArtistDetails /* ... */ />
      )}

      {/* ... rest */}
    </div>
  )
}
```

---

## Phase 6: Styling

### 6.1 Connections Mode Styles (`src/components/connections/ConnectionsMode.css`)

```css
/* ========== SETUP SCREEN ========== */
.connections-setup {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(5, 5, 16, 0.85);
  backdrop-filter: blur(8px);
  z-index: 150;
  animation: fadeIn 0.3s ease;
}

.connections-setup__card {
  background: rgba(26, 26, 36, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  max-width: 500px;
  width: 90%;
  text-align: center;
  position: relative;
  box-shadow:
    0 0 60px rgba(100, 120, 180, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.5);
}

.connections-setup__title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.8rem;
  font-weight: 400;
  margin-bottom: var(--spacing-sm);
  color: var(--color-text-primary);
}

.connections-setup__subtitle {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xl);
}

.connections-setup__artists {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.connections-setup__artist {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.connections-setup__artist-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.connections-setup__artist-name {
  font-weight: 500;
  color: var(--color-text-primary);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.connections-setup__arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--color-text-muted);
}

.connections-setup__arrow span {
  font-size: 1.5rem;
  margin-bottom: var(--spacing-xs);
}

.connections-setup__arrow svg {
  width: 40px;
  height: 40px;
  opacity: 0.5;
}

.connections-setup__hint {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin-bottom: var(--spacing-xl);
}

.connections-setup__actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

.connections-setup__exit {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: var(--spacing-sm);
  transition: color 0.2s;
}

.connections-setup__exit:hover {
  color: var(--color-text-primary);
}

/* ========== IN-GAME OVERLAY ========== */
.connections-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 150;
  pointer-events: none;
}

.connections-overlay__bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  padding-top: calc(var(--spacing-md) + 60px); /* Below header */
  background: linear-gradient(to bottom, rgba(5, 5, 16, 0.9), transparent);
  pointer-events: auto;
}

.connections-overlay__exit,
.connections-overlay__undo {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.connections-overlay__exit:hover,
.connections-overlay__undo:hover {
  background: rgba(255, 255, 255, 0.2);
  color: var(--color-text-primary);
}

.connections-overlay__stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  flex: 1;
}

.connections-overlay__timer,
.connections-overlay__hops {
  font-size: 1rem;
  color: var(--color-text-primary);
  font-weight: 500;
}

.connections-overlay__target {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: rgba(236, 72, 153, 0.2);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  border: 1px solid rgba(236, 72, 153, 0.3);
}

.connections-overlay__target-label {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}

.connections-overlay__target-image {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.connections-overlay__target-name {
  color: #EC4899;
  font-weight: 500;
}

.connections-overlay__current {
  position: fixed;
  bottom: var(--spacing-lg);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(26, 26, 36, 0.9);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-full);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--color-text-secondary);
  pointer-events: auto;
}

/* ========== RESULT SCREEN ========== */
.connections-result {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(5, 5, 16, 0.9);
  backdrop-filter: blur(8px);
  z-index: 150;
  animation: fadeIn 0.3s ease;
}

.connections-result__card {
  background: rgba(26, 26, 36, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  max-width: 400px;
  width: 90%;
  text-align: center;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow:
    0 0 60px rgba(100, 120, 180, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.5);
}

.connections-result__title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 1.8rem;
  font-weight: 400;
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-primary);
}

.connections-result__path {
  margin-bottom: var(--spacing-lg);
}

.connections-result__path h3 {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-md);
}

.connections-result__path-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.connections-result__path-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.connections-result__path-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: var(--spacing-xs);
}

.connections-result__path-name {
  font-size: 0.85rem;
  color: var(--color-text-primary);
}

.connections-result__path-arrow {
  color: #60A5FA;
  font-size: 1.2rem;
  margin: var(--spacing-xs) 0;
}

.connections-result__stats {
  display: flex;
  justify-content: center;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
}

.connections-result__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.connections-result__stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.connections-result__stat-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

.connections-result__optimal {
  color: var(--color-accent);
  margin-bottom: var(--spacing-lg);
}

.connections-result__suboptimal {
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-lg);
}

.connections-result__actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

/* ========== ANIMATIONS ========== */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

/* ========== MOBILE ========== */
@media (max-width: 768px) {
  .connections-setup__artists {
    flex-direction: column;
  }

  .connections-setup__arrow {
    transform: rotate(90deg);
  }

  .connections-overlay__bar {
    flex-wrap: wrap;
    padding-top: calc(var(--spacing-sm) + 50px);
  }

  .connections-overlay__target {
    width: 100%;
    justify-content: center;
    margin-top: var(--spacing-sm);
  }
}
```

---

## Implementation Order

**Recommended sequence:**

1. **Phase 2** — Create `pathfinding.js` and test algorithms in isolation
2. **Phase 3.1** — Build `useConnectionsGame` hook
3. **Phase 3.2** — Create `ModeSelector` component
4. **Phase 5** — Integrate ModeSelector into `App.jsx`
5. **Phase 3.3-3.6** — Build Connections UI components
6. **Phase 4** — Modify `Graph.jsx` for connections mode rendering
7. **Phase 6** — Add CSS styling
8. **Testing** — Test full flow end-to-end

**Estimated effort:** 8-12 hours for MVP (relaxed mode only)
