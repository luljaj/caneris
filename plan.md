# Plan to Clear Unused State

## Findings
- No unused useState variables in active components or hooks.
- Spotify hooks are defined but not referenced; their internal state is effectively unused because the feature is not wired.

## Plan
1. Confirm whether Spotify support is still desired.
2. If removing Spotify: delete src/hooks/useSpotifyAuth.js, src/hooks/useSpotifyData.js, and src/utils/spotify.js; remove any lingering references in docs or styles.
3. If keeping Spotify: wire the hooks into src/App.jsx with UI and data flow so their state is used.
4. Re-scan for unused state after changes to ensure everything is referenced.
