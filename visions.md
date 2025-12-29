# Caneris — Future Visions

*Brainstorming session: 2025-12-28*

## Core Vision

> "I want this to feel like going through space, but the space is your own music graph."

Transform Caneris from a passive visualization into an interactive, social music exploration experience. Two main pillars:

1. **Connections Mode** — Interactive game/exploration
2. **Social Sharing** — Compare constellations with friends

---

## Feature 1: Connections Mode

### Concept
A "Six Degrees of Separation" game for artists. Given two artists, find a path between them by clicking through similar artists.

### Two Modes

#### Relaxed/Exploration Mode (Default)
- No time pressure or scoring
- Focus on discovery: "Look, Radiohead connects to Billie Eilish through these 4 artists!"
- Reveals unexpected bridges between genres
- Educational — learn about new artists in the connection chain

#### Competitive/Challenge Mode (Optional)
- Timed challenges
- Scoring system (fewer hops = better score)
- Hints available (maybe cost points?)
- Daily challenges
- Potential for leaderboards
- Can challenge friends: "Beat my 3-hop connection!"

### User Flow
1. System selects two artists (or user picks them)
2. Click starting artist → reveals their connections
3. Click a connected artist → reveals *their* connections
4. Continue until you reach the target artist
5. Path is highlighted, stats shown (# of hops, time if competitive)

### Why It Works
- Turns passive graph into active exploration
- Makes similarity data tangible and fun
- Natural bridge to social features (challenge friends)
- Reveals hidden structure in your music taste

---

## Feature 2: Social Sharing & Friends

### Friend Connection Method
**Chosen Approach: Friend Codes** (or share links)

**Rationale:**
- Share links would require hosting everyone's maps on a backend
- Friend codes are simpler: generate a code, share it, they add you
- Could also do simple share links that just reference a Last.fm username

### Friend Map Viewing

#### Primary View: Overlap View
When viewing a friend's constellation:
- **Shared artists** — Glow/highlighted (you both listen to these)
- **Their unique artists** — One color/opacity
- **Your unique artists** — Different color/opacity (if showing both maps merged)
- **Compatibility insights** — "You share 12 artists, both love indie rock, they're way more into jazz"

#### Additional View Ideas (for later)
- Solo view (just explore their map)
- Side-by-side comparison
- Genre breakdown comparison
- "Recommendations" — artists they love that you don't listen to

### Social + Game Synergy
- View friend's map → spot unfamiliar artist
- Ask: "How does this connect to my taste?"
- Launch Connections Mode to find the path
- Challenge friend: "I connected Artist A to Artist B in 3 hops — beat that!"

---

## Technical Considerations

### Backend Requirements
- **Friend codes**: Generate unique codes per user, store friendships
- **Data sharing**: Expose user's graph data to approved friends
- **Challenge system**: Store challenge state, scores, leaderboards (if competitive)
- **Privacy**: User controls who can see their map

### Frontend Changes
- New UI modes: Default view, Connections Mode, Friend View
- Path visualization (highlight connection chain)
- Friend management UI
- Challenge UI (timer, scoring, hints)

### Data Requirements
- Already have: Last.fm similarity data (`getSimilarArtists`)
- Need: User accounts/IDs, friendship graph, challenge state
- Consideration: Cache friend graphs? Or fetch on-demand?

---

## Open Questions

### Connections Mode
- [ ] How are challenge artists selected? (Random? Based on distance? User choice?)
- [ ] What makes a "good" challenge? (Should artists be N hops apart minimum?)
- [ ] Hint system: What info does a hint reveal?
- [ ] Scoring formula: Just hop count, or time-weighted?
- [ ] Should you see the full graph while playing, or only discovered nodes?

### Social Features
- [ ] Authentication: Last.fm only, or add separate accounts?
- [ ] Privacy levels: Public maps? Friends-only? Private?
- [ ] Notifications: When someone views your map? Challenge requests?
- [ ] Discovery: Can you browse public maps? Search for users?
- [ ] Compatibility algorithm: How to calculate "music taste similarity"?

### UI/UX
- [ ] How to switch between modes? (Tab bar? Modal? Button in header?)
- [ ] Where does Connections Mode live? (Overlay? Separate route?)
- [ ] Friend list UI: Sidebar? Dropdown? Dedicated page?
- [ ] Mobile experience: How do these features adapt?

### Technical
- [ ] Backend stack: Simple REST API? Firebase? Supabase?
- [ ] Real-time features: Live challenges? Friend activity feed?
- [ ] Data persistence: Where to store graph snapshots?
- [ ] Performance: Loading friend graphs quickly

---

## Next Steps

1. **Prototype Connections Mode** (can work offline without backend)
   - Build the core path-finding mechanic
   - Test with current graph data
   - Validate the fun factor

2. **Design Social Architecture**
   - Choose backend solution
   - Design friend code system
   - Plan authentication flow

3. **Build Overlap View**
   - Algorithm to merge two graphs
   - Visual design for shared vs unique nodes
   - Compatibility scoring

4. **Iterate & Expand**
   - Daily challenges
   - Leaderboards
   - Discovery features
   - More viewing modes

---

## Wild Ideas (Future Future)

- **Playlist Generation**: "Create a playlist that travels this path"
- **Time Machine**: See how your constellation evolved over time
- **Genre Deep Dives**: Zoom into a genre cluster, see micro-connections
- **Collaborative Playlists**: Merge friend overlap into a shared playlist
- **Music Recommendations**: "Based on your graph structure, you might like..."
- **Live Listening**: See what friends are playing right now, visualized
- **Graph Metrics**: Centrality scores, clustering coefficients, "most connected artist"
- **Artist Pages**: Click artist → full bio, top tracks, where they sit in the broader music universe
