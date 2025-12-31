import './DiscoverMode.css'

const formatGenreLabel = (genre) => {
  if (!genre) return ''
  return genre
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const formatCount = (value) => {
  if (!Number.isFinite(value)) return '0'
  return value.toLocaleString()
}

function DiscoverCard({
  title,
  subtitle,
  artistCount,
  connectionCount,
  topGenres,
  meta,
  badges = [],
  iconActions = [],
  actions = [],
  isFeatured = false,
  isActive = false,
  isHighlighted = false
}) {
  const cardClasses = [
    'discover-card',
    isFeatured && 'discover-card--featured',
    isActive && 'discover-card--active',
    isHighlighted && 'discover-card--highlight'
  ].filter(Boolean).join(' ')

  const hasHeaderActions = badges.length > 0 || iconActions.length > 0

  return (
    <div className={cardClasses}>
      <div className="discover-card__header">
        <div className="discover-card__titles">
          <div className="discover-card__title">{title}</div>
          {subtitle && (
            <div className="discover-card__subtitle">{subtitle}</div>
          )}
        </div>

        {hasHeaderActions && (
          <div className="discover-card__header-actions">
            {iconActions.length > 0 && (
              <div className="discover-card__icon-actions">
                {iconActions.map((action) => {
                  const actionClass = [
                    'discover-card__icon-button',
                    action.tone === 'danger' && 'discover-card__icon-button--danger',
                    action.loading && 'is-loading'
                  ].filter(Boolean).join(' ')

                  return (
                    <button
                      key={action.key}
                      className={actionClass}
                      onClick={action.onClick}
                      disabled={action.disabled || action.loading}
                      title={action.title || action.label}
                      aria-label={action.label}
                      type="button"
                    >
                      {action.icon}
                    </button>
                  )
                })}
              </div>
            )}

            {badges.length > 0 && (
              <div className="discover-card__badges">
                {badges.map((badge) => (
                  <span
                    key={badge.label}
                    className={`discover-card__badge${badge.tone ? ` discover-card__badge--${badge.tone}` : ''}`}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="discover-card__stats">
        <span>{formatCount(artistCount)} artists</span>
        <span>{formatCount(connectionCount)} connections</span>
      </div>

      {topGenres?.length > 0 && (
        <div className="discover-card__genres">
          {topGenres.map((genre) => formatGenreLabel(genre)).join(', ')}
        </div>
      )}

      {meta && (
        <div className="discover-card__meta">{meta}</div>
      )}

      {actions.length > 0 && (
        <div className="discover-card__actions">
          {actions.map((action) => {
            const baseClass = action.variant === 'primary' ? 'btn btn--primary' : 'btn btn--ghost'
            const actionClass = [
              baseClass,
              action.tone === 'danger' && 'discover-card__action--danger',
              action.loading && 'discover-card__action--loading'
            ].filter(Boolean).join(' ')

            return (
              <button
                key={action.key}
                className={actionClass}
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
                title={action.title || action.label}
                type="button"
              >
                {action.loading ? (action.loadingLabel || 'Working...') : action.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default DiscoverCard
