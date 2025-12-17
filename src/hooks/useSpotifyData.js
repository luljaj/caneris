import { useState, useEffect } from 'react'
import { fetchAllTopArtists } from '../utils/spotify'
import { artistsToGraphData } from '../utils/graphUtils'

export function useSpotifyData(token) {
  const [artists, setArtists] = useState([])
  const [graphData, setGraphData] = useState({ nodes: [], links: [], genreClusters: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!token) {
      setArtists([])
      setGraphData({ nodes: [], links: [], genreClusters: [] })
      return
    }

    let cancelled = false

    const loadData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch top 200 artists (or as many as available)
        const topArtists = await fetchAllTopArtists(token, 200, 'medium_term')
        
        // Prevent state updates if component unmounted
        if (cancelled) return

        setArtists(topArtists)

        // Convert to graph data
        const data = artistsToGraphData(topArtists)
        setGraphData(data)
      } catch (err) {
        if (cancelled) return
        console.error('Failed to load Spotify data:', err)
        setError(err.message || 'Failed to load your music data')
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [token])

  return {
    artists,
    graphData,
    isLoading,
    error
  }
}

