import { useState, useEffect } from 'react'
import { fetchLastFmDataComplete } from '../utils/lastfm'
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
        // Fetch complete data with artists, similarity, and images
        const { artists: fetchedArtists, similarityMap } = await fetchLastFmDataComplete(
          username,
          500,
          'overall',
          ({ stage, percent, message }) => {
            if (!cancelled) {
              setProgress(message)
            }
          }
        )

        // Prevent state updates if component unmounted
        if (cancelled) return

        setArtists(fetchedArtists)

        // Convert to graph data with similarity-based connections
        setProgress('Building constellation...')
        const data = artistsToGraphData(fetchedArtists, similarityMap)
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


