import { useState } from 'react'
import { useSpotifyAuth } from './hooks/useSpotifyAuth'
import { useSpotifyData } from './hooks/useSpotifyData'
import Login from './components/Login'
import SpotifyGraph from './components/SpotifyGraph'
import SettingsPanel from './components/SettingsPanel'
import ArtistDetails from './components/ArtistDetails'
import './App.css'

function App() {
  const { token, login, logout, isLoading: authLoading } = useSpotifyAuth()
  const { artists, graphData, isLoading: dataLoading, error } = useSpotifyData(token)
  const [selectedArtist, setSelectedArtist] = useState(null)
  const [showGenreLabels, setShowGenreLabels] = useState(true)

  // Export artist data as JSON file
  const exportData = () => {
    const dataStr = JSON.stringify(artists, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'test_data.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (authLoading) {
    return (
      <div className="app app--loading">
        <div className="loader">
          <div className="loader__ring"></div>
          <span>Connecting to Spotify...</span>
        </div>
      </div>
    )
  }

  if (!token) {
    return <Login onLogin={login} />
  }

  if (error) {
    return (
      <div className="app app--error">
        <div className="error-card">
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button className="btn btn--primary" onClick={logout}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header__brand">
          <svg className="header__logo" viewBox="0 0 100 100" width="32" height="32">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1DB954"/>
                <stop offset="100%" stopColor="#1ed760"/>
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="url(#logoGrad)"/>
            <circle cx="35" cy="40" r="8" fill="#0a0a0f"/>
            <circle cx="65" cy="40" r="6" fill="#0a0a0f"/>
            <circle cx="50" cy="65" r="5" fill="#0a0a0f"/>
            <line x1="35" y1="40" x2="65" y2="40" stroke="#0a0a0f" strokeWidth="2"/>
            <line x1="35" y1="40" x2="50" y2="65" stroke="#0a0a0f" strokeWidth="2"/>
            <line x1="65" y1="40" x2="50" y2="65" stroke="#0a0a0f" strokeWidth="2"/>
          </svg>
          <h1 className="header__title">Spotify Graph</h1>
        </div>
        <div className="header__actions">
          {artists.length > 0 && (
            <button className="btn btn--ghost" onClick={exportData}>
              Export Data
            </button>
          )}
          <button className="btn btn--ghost" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="main">
        {dataLoading ? (
          <div className="loader">
            <div className="loader__ring"></div>
            <span>Loading your music taste...</span>
          </div>
        ) : (
          <SpotifyGraph
            data={graphData}
            onNodeClick={setSelectedArtist}
            showGenreLabels={showGenreLabels}
          />
        )}
      </main>

      <SettingsPanel
        showGenreLabels={showGenreLabels}
        onToggleGenreLabels={() => setShowGenreLabels(!showGenreLabels)}
      />

      {selectedArtist && (
        <ArtistDetails
          artist={selectedArtist}
          onClose={() => setSelectedArtist(null)}
        />
      )}
    </div>
  )
}

export default App

