import { useState, useEffect } from 'react'
import ConnectionsArtistCard from './ConnectionsArtistCard'
import './ConnectionsMode.css'

function ConnectionsOverlay({
  currentArtist,
  targetArtist,
  connectedArtists,
  onConnectionSelect,
  showConnections,
  onToggleConnections,
  mode,
  startTime,
  canUndo,
  onUndo,
  constellationLabel
}) {
  const [elapsed, setElapsed] = useState(0)

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

  const connectionsList = connectedArtists || []
  const handleToggleConnections = () => {
    onToggleConnections?.()
  }

  return (
    <div className="connections-overlay">
      <div className="connections-overlay__bar">
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
          {constellationLabel && (
            <span className="connections-overlay__owner">
              {constellationLabel}
            </span>
          )}
          {mode === 'competitive' && (
            <span className="connections-overlay__timer">
              {formatTime(elapsed)}
            </span>
          )}
        </div>

        <div className="connections-overlay__target">
          <span className="connections-overlay__target-label">Destination:</span>
          {targetArtist?.image ? (
            <img
              src={targetArtist.image}
              alt={targetArtist.name}
              className="connections-overlay__target-image"
            />
          ) : (
            <div className="connections-overlay__target-image connections-overlay__target-image--placeholder" />
          )}
          <span className="connections-overlay__target-name">
            {targetArtist?.name}
          </span>
        </div>
      </div>

      <div
        className={`connections-overlay__links-panel ${showConnections ? 'is-open' : ''}`}
        aria-hidden={!showConnections}
      >
        <div className="connections-overlay__links-header">
          <span className="connections-overlay__links-title">
            Connections ({connectionsList.length})
          </span>
          <button
            type="button"
            className="connections-overlay__links-close"
            onClick={handleToggleConnections}
            aria-label="Hide connections"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="connections-overlay__links-content">
          {connectionsList.length > 0 ? (
            <ul className="connections-overlay__links-list">
              {connectionsList.map((artist) => (
                <li key={artist.id} className="connections-overlay__links-item">
                  <button
                    type="button"
                    className="connections-overlay__links-button-item"
                    onClick={() => onConnectionSelect?.(artist.id)}
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
      </div>

      {currentArtist && (
        <div className="connections-overlay__artist-card-container">
          <ConnectionsArtistCard
            key={currentArtist.id}
            artist={currentArtist}
            showConnections={showConnections}
            onToggleConnections={handleToggleConnections}
          />
        </div>
      )}
    </div>
  )
}

export default ConnectionsOverlay
