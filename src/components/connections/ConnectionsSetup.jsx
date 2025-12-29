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
