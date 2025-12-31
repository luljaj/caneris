import { useEffect, useRef, useState } from 'react'
import './ConnectionsMode.css'

function ConnectionsSetup({
  startArtist,
  targetArtist,
  optimalHops,
  onStart,
  onNewChallenge,
  onExit,
  constellationLabel
}) {
  const [isExiting, setIsExiting] = useState(false)
  const exitTimeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current)
      }
    }
  }, [])

  if (!startArtist || !targetArtist) return null

  const handleExit = () => {
    if (isExiting) return
    setIsExiting(true)
    exitTimeoutRef.current = setTimeout(() => {
      onExit?.()
    }, 250)
  }

  return (
    <div className={`connections-setup ${isExiting ? 'connections-setup--exit' : ''}`}>
      <div className="connections-setup__card">
        <h2 className="connections-setup__title">
          Connections
        </h2>

        <p className="connections-setup__subtitle">
          {constellationLabel && (
            <span className="connections-setup__subtitle-label">
              {constellationLabel}
            </span>
          )}
          <span>Chart a course between these two artists</span>
        </p>

        <div className="connections-setup__artists">
          <div className="connections-setup__artist">
            {startArtist.image ? (
              <img
                src={startArtist.image}
                alt={startArtist.name}
                className="connections-setup__artist-image"
              />
            ) : (
              <div className="connections-setup__artist-image connections-setup__artist-image--placeholder" />
            )}
            <span className="connections-setup__artist-name">
              {startArtist.name}
            </span>
          </div>

          <div className="connections-setup__arrow" aria-hidden="true">
            <svg
              className="connections-setup__arrow-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>

          <div className="connections-setup__artist">
            {targetArtist.image ? (
              <img
                src={targetArtist.image}
                alt={targetArtist.name}
                className="connections-setup__artist-image"
              />
            ) : (
              <div className="connections-setup__artist-image connections-setup__artist-image--placeholder" />
            )}
            <span className="connections-setup__artist-name">
              {targetArtist.name}
            </span>
          </div>
        </div>

        <p className="connections-setup__hint">
          Optimal path length: {optimalHops} jumps
        </p>

        <div className="connections-setup__actions">
          <button
            className="btn btn--ghost connections-setup__random"
            onClick={onNewChallenge}
          >
            Random Trajectory
          </button>
          <button
            className="btn btn--primary"
            onClick={onStart}
          >
            Launch
          </button>
        </div>

        <button
          className="connections-setup__exit"
          onClick={handleExit}
        >
          Exit
        </button>
      </div>
    </div>
  )
}

export default ConnectionsSetup
