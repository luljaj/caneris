function ConnectionsArtistCard({ artist, showConnections, onToggleConnections }) {
  if (!artist) return null
  const artistName = artist.name || 'Unknown artist'

  return (
    <div className="connections-artist-card">
      <span className="connections-artist-card__label">Now at:</span>
      {artist.image ? (
        <img
          className="connections-artist-card__image"
          src={artist.image}
          alt={artistName}
        />
      ) : (
        <div className="connections-artist-card__image connections-artist-card__image--placeholder" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 18V5l12-2v13"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
        </div>
      )}
      <div className="connections-artist-card__name-slot">
        {artist.lastfmUrl ? (
          <a
            className="connections-artist-card__name"
            href={artist.lastfmUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {artistName}
          </a>
        ) : (
          <span className="connections-artist-card__name">{artistName}</span>
        )}
      </div>
      <button
        type="button"
        className="btn btn--ghost connections-artist-card__toggle"
        onClick={() => onToggleConnections?.()}
      >
        {showConnections ? 'Hide Connections' : 'Show Connections'}
      </button>
    </div>
  )
}

export default ConnectionsArtistCard
