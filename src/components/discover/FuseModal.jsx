import { useEffect } from 'react'
import './DiscoverMode.css'

function FuseModal({
  isOpen,
  onClose,
  onConfirm,
  selectedType,
  onSelectType,
  sourceLabel,
  myCount,
  theirCount,
  preview
}) {
  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleBackdrop = (event) => {
    event.stopPropagation()
    if (event.target === event.currentTarget) {
      onClose?.()
    }
  }

  return (
    <div
      className="discover-fuse-overlay"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Fuse constellations"
    >
      <div className="discover-fuse">
        <div className="discover-fuse__header">
          <h3>Fuse Constellations</h3>
          <button className="discover-fuse__close" onClick={onClose} type="button" aria-label="Close">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p className="discover-fuse__summary">
          Your Constellation ({myCount || 0}) + {sourceLabel} ({theirCount || 0})
        </p>

        <div className="discover-fuse__options">
          <button
            type="button"
            className={`discover-fuse__option ${selectedType === 'union' ? 'is-selected' : ''}`}
            onClick={() => onSelectType?.('union')}
          >
            <span className="discover-fuse__option-title">Union</span>
            <span className="discover-fuse__option-subtitle">All artists combined</span>
            <span className="discover-fuse__option-meta">
              ~{preview?.union || 0} unique artists
            </span>
          </button>

          <button
            type="button"
            className={`discover-fuse__option ${selectedType === 'intersection' ? 'is-selected' : ''}`}
            onClick={() => onSelectType?.('intersection')}
          >
            <span className="discover-fuse__option-title">Intersection</span>
            <span className="discover-fuse__option-subtitle">Shared artists only</span>
            <span className="discover-fuse__option-meta">
              ~{preview?.intersection || 0} shared artists
            </span>
          </button>
        </div>

        <button
          className="btn btn--primary discover-fuse__confirm"
          onClick={onConfirm}
          disabled={!selectedType}
          type="button"
        >
          Create Fused Constellation
        </button>

        <p className="discover-fuse__note">
          Fused constellations are saved and appear in Discovered.
        </p>
      </div>
    </div>
  )
}

export default FuseModal
