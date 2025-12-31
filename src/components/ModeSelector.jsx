import { useState, useRef, useEffect } from 'react'
import './ModeSelector.css'

const MODES = [
  { id: 'explore', label: 'Explore', icon: '' },
  { id: 'connections', label: 'Connections', icon: '' },
  { id: 'discover', label: 'Discover', icon: '', badge: 'New' },
]

function ModeSelector({ currentMode, onModeChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const currentModeData = MODES.find(m => m.id === currentMode) || MODES[0]

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleModeSelect = (modeId) => {
    onModeChange(modeId)
    setIsOpen(false)
  }

  return (
    <div className="mode-selector" ref={dropdownRef}>
      <button
        className="mode-selector__button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>{currentModeData.label}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={isOpen ? 'rotated' : ''}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div className={`mode-selector__dropdown ${isOpen ? 'open' : ''}`}>
        {MODES.map(mode => (
          <button
            key={mode.id}
            className={`mode-selector__option ${currentMode === mode.id ? 'active' : ''}`}
            onClick={() => handleModeSelect(mode.id)}
          >
            <span className="mode-selector__option-icon">{mode.icon}</span>
            <span className="mode-selector__option-label">{mode.label}</span>
            {mode.badge && (
              <span className="mode-selector__badge">{mode.badge}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ModeSelector
