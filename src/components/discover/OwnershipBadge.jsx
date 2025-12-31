import './OwnershipBadge.css'

function OwnershipBadge({ label, onClick }) {
  if (!label) return null

  return (
    <button
      className="ownership-badge"
      onClick={onClick}
      type="button"
      aria-label={`Viewing ${label}. Open Discover`}
      title={label}
    >
      <span className="ownership-badge__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </span>
      <span className="ownership-badge__text">{label}</span>
    </button>
  )
}

export default OwnershipBadge
