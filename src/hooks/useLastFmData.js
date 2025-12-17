import { useState, useEffect } from 'react'
import { fetchTopArtistsWithTags, normalizeLastFmArtists } from '../utils/lastfm'
import { artistsToGraphData } from '../utils/graphUtils'

export function useLastFmData(username) {
  const [artists, setArtists] = useState([])
  const [graphData, setGraphData] = useState({ nodes: [], links: [], genreClusters: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState('')

  useEffect(() => {
    if (!username) {
      setArtists([])
      setGraphData({ nodes: [], links: [], genreClusters: [] })
      return
    }

    let cancelled = false

    const loadData = async () => {
      setIsLoading(true)
      setError(null)
      setProgress('Fetching your top artists...')

      try {
        // Fetch top artists with tags
        if (!cancelled) setProgress('Loading artist tags (this may take a moment)...')
        const lastfmArtists = await fetchTopArtistsWithTags(username, 100, 'overall')
        
        // Prevent state updates if component unmounted
        if (cancelled) return

        // Normalize to common format
        const normalizedArtists = normalizeLastFmArtists(lastfmArtists)
        setArtists(normalizedArtists)

        // Convert to graph data
        setProgress('Building graph...')
        const data = artistsToGraphData(normalizedArtists)
        setGraphData(data)
      } catch (err) {
        if (cancelled) return
        console.error('Failed to load Last.fm data:', err)
        setError(err.message || 'Failed to load your music data from Last.fm')
      } finally {
        if (!cancelled) {
          setIsLoading(false)
          setProgress('')
        }
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [username])

  return {
    artists,
    graphData,
    isLoading,
    error,
    progress
  }
}


