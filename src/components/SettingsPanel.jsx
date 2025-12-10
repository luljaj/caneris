import './SettingsPanel.css'

function SettingsPanel({ showGenreLabels, onToggleGenreLabels }) {
  return (
    <div className="settings-panel">
      <div className="settings-panel__header">
        <svg className="settings-panel__icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
        <span>Settings</span>
      </div>
      
      <div className="settings-panel__content">
        <label className="toggle">
          <span className="toggle__label">Genre Labels</span>
          <div className="toggle__switch">
            <input
              type="checkbox"
              checked={showGenreLabels}
              onChange={onToggleGenreLabels}
            />
            <span className="toggle__slider"></span>
          </div>
        </label>
      </div>
    </div>
  )
}

export default SettingsPanel

