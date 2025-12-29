import { useState, useEffect, useRef } from 'react'
import './ConnectionsMode.css'

function ConnectionsOverlay({
  currentArtist,
  targetArtist,
  connectedArtists,
  onConnectionSelect,
  hops,
  hintCount,
  mode,
  startTime,
  canUndo,
  onUndo,
  onExit
}) {
  const [elapsed, setElapsed] = useState(0)
  const [showConnections, setShowConnections] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const closeTimerRef = useRef(null)

  useEffect(() => {
    if (mode !== 'competitive' || !startTime) return

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [mode, startTime])

  useEffect(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
    }
    setShowConnections(false)
    setIsClosing(false)
  }, [currentArtist?.id])

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const connectionsList = connectedArtists || []
  const isOpen = showConnections || isClosing

  const handleToggleConnections = () => {
    if (showConnections) {
      if (isClosing) return
      setIsClosing(true)
      closeTimerRef.current = setTimeout(() => {
        setShowConnections(false)
        setIsClosing(false)
      }, 280)
      return
    }

    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
    }
    setIsClosing(false)
    setShowConnections(true)
  }

  return (
    <div className="connections-overlay">
      <div className="connections-overlay__bar">
        <button
          className="btn btn--ghost"
          onClick={onExit}
          title="Exit game"
        >
          Exit
        </button>

        {canUndo && (
          <button
            className="btn btn--ghost"
            onClick={onUndo}
            title="Undo last move"
          >
            ← Undo
          </button>
        )}

        <div className="connections-overlay__stats">
          {mode === 'competitive' && (
            <span className="connections-overlay__timer">
              {formatTime(elapsed)}
            </span>
          )}
        </div>

        <div className="connections-overlay__target">
          <span className="connections-overlay__target-label">Destination:</span>
          {targetArtist.image ? (
            <img
              src={targetArtist.image}
              alt={targetArtist.name}
              className="connections-overlay__target-image"
            />
          ) : (
            <div className="connections-overlay__target-image connections-overlay__target-image--placeholder" />
          )}
          <span className="connections-overlay__target-name">
            {targetArtist.name}
          </span>
        </div>
      </div>

      <div className="connections-overlay__current">
        {isOpen && (
          <div className={`connections-overlay__links-popover ${isClosing ? 'is-closing' : ''}`}>
            <div className="connections-overlay__links-title">
              Connections ({connectionsList.length})
            </div>
            {connectionsList.length > 0 ? (
              <ul className="connections-overlay__links-list">
                {connectionsList.map((artist) => (
                  <li key={artist.id} className="connections-overlay__links-item">
                    <button
                      type="button"
                      className="connections-overlay__links-button-item"
                      onClick={() => {
                        onConnectionSelect?.(artist.id)
                        handleToggleConnections()
                      }}
                    >
                      {artist.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="connections-overlay__links-empty">No connections found</div>
            )}
          </div>
        )}
        <span>Now at: <strong>{currentArtist?.name}</strong></span>
        <button
          type="button"
          className={`connections-overlay__links-button ${showConnections && !isClosing ? 'is-active' : ''}`}
          onClick={handleToggleConnections}
          title="Show connections"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 007.07 0l1.41-1.41a5 5 0 00-7.07-7.07L9 5"/>
            <path d="M14 11a5 5 0 00-7.07 0L5.5 12.5a5 5 0 007.07 7.07L15 19"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default ConnectionsOverlay
