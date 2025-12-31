import { useEffect, useMemo, useRef, useState } from 'react'
import DiscoverCard from './DiscoverCard'
import FuseModal from './FuseModal'
import './DiscoverMode.css'

const formatDateLabel = (timestamp) => {
  if (!timestamp) return ''
  const diffMs = Date.now() - timestamp
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return 'Updated today'
  if (diffDays === 1) return 'Updated 1 day ago'
  return `Updated ${diffDays} days ago`
}

const formatGenres = (artists, limit = 3) => {
  const genreCounts = {}
  artists.forEach((artist) => {
    artist.genres?.forEach((genre) => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1
    })
  })
  return Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([genre]) => genre)
}

const formatNumber = (value) => {
  if (!Number.isFinite(value)) return '0'
  return value.toLocaleString()
}

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-2.6-6.4" />
    <path d="M21 3v6h-6" />
  </svg>
)

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
)

function DiscoverMode({
  isOpen,
  onClose,
  currentUsername,
  originalArtists,
  originalGraphData,
  activeConstellation,
  onViewConstellation,
  onStartConnections,
  discover
}) {
  const {
    discovered,
    fused,
    isOffline,
    storageStatus,
    searchUser,
    addDiscovered,
    refreshDiscovered,
    removeDiscovered,
    removeFused,
    createFusion,
    getGraphData,
    isOutdated
  } = discover

  const [query, setQuery] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [searchError, setSearchError] = useState(null)
  const [actionMessage, setActionMessage] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [actionState, setActionState] = useState({ key: null, action: null })
  const [storageDismissed, setStorageDismissed] = useState(false)
  const [fuseTarget, setFuseTarget] = useState(null)
  const [fuseType, setFuseType] = useState(null)
  const [newlyAddedKey, setNewlyAddedKey] = useState(null)
  const inputRef = useRef(null)

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

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setSearchResult(null)
      setSearchError(null)
      setActionMessage(null)
      setIsSearching(false)
      setIsAdding(false)
      setActionState({ key: null, action: null })
      setFuseTarget(null)
      setFuseType(null)
      setStorageDismissed(false)
      return
    }

    setTimeout(() => {
      inputRef.current?.focus()
    }, 0)
  }, [isOpen])

  useEffect(() => {
    if (!newlyAddedKey) return
    const timer = setTimeout(() => setNewlyAddedKey(null), 1200)
    return () => clearTimeout(timer)
  }, [newlyAddedKey])

  const originalTopGenres = useMemo(() => formatGenres(originalArtists || []), [originalArtists])
  const originalArtistCount = originalArtists?.length || 0
  const originalConnectionCount = originalGraphData?.links?.length || 0

  const activeUsername = activeConstellation?.type === 'discovered'
    ? activeConstellation?.username?.toLowerCase()
    : null
  const activeFusedId = activeConstellation?.type === 'fused'
    ? activeConstellation?.id
    : null

  const previewFusion = useMemo(() => {
    if (!fuseTarget || !originalArtists?.length) return null
    const myIds = new Set(originalArtists.map((artist) => artist.id))
    const theirIds = new Set(fuseTarget.artists.map((artist) => artist.id))
    const sharedCount = [...myIds].filter((id) => theirIds.has(id)).length
    const unionCount = new Set([...myIds, ...theirIds]).size
    return {
      union: unionCount,
      intersection: sharedCount
    }
  }, [fuseTarget, originalArtists])

  if (!isOpen) return null

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.()
    }
  }

  const handleSearch = async () => {
    const trimmed = query.trim()
    if (!trimmed) return
    setSearchError(null)
    setActionMessage(null)
    setIsSearching(true)
    const result = await searchUser(trimmed)
    setIsSearching(false)
    if (result.error) {
      setSearchResult(null)
      setSearchError(result.error.message)
      return
    }
    setSearchResult(result.user)
  }

  const handleAdd = async () => {
    if (!searchResult?.name) return
    setIsAdding(true)
    setActionMessage(null)
    try {
      const entry = await addDiscovered(searchResult.name)
      setSearchResult(null)
      setQuery('')
      setNewlyAddedKey(entry.username)
    } catch (error) {
      setActionMessage(error.message || 'Unable to add constellation')
    } finally {
      setIsAdding(false)
    }
  }

  const handleView = (entry, type) => {
    if (!entry && type !== 'original') return
    let graphData = originalGraphData
    let payload = { type: 'original', username: null, id: null, data: originalGraphData, label: null }

    if (type === 'discovered') {
      graphData = getGraphData('discovered', entry.username)
      payload = {
        type: 'discovered',
        username: entry.username,
        id: null,
        data: graphData,
        label: `${entry.username}'s Constellation`
      }
      if (isOutdated(entry)) {
        refreshDiscovered(entry.username).catch((error) => {
          setActionMessage(error.message || 'Unable to refresh constellation')
        })
      }
    } else if (type === 'fused') {
      graphData = getGraphData('fused', entry.id)
      payload = { type: 'fused', username: null, id: entry.id, data: graphData, label: entry.name }
    }

    onViewConstellation?.(payload)
  }

  const handleConnections = (entry, type) => {
    if (!entry) return
    let graphData = null
    let payload = { type: 'discovered', username: entry.username, id: null, data: null, label: `${entry.username}'s Constellation` }

    if (type === 'fused') {
      graphData = getGraphData('fused', entry.id)
      payload = { type: 'fused', username: null, id: entry.id, data: graphData, label: entry.name }
    } else {
      graphData = getGraphData('discovered', entry.username)
      payload = {
        type: 'discovered',
        username: entry.username,
        id: null,
        data: graphData,
        label: `${entry.username}'s Constellation`
      }
      if (isOutdated(entry)) {
        refreshDiscovered(entry.username).catch((error) => {
          setActionMessage(error.message || 'Unable to refresh constellation')
        })
      }
    }

    onStartConnections?.(payload)
  }

  const handleRefresh = async (entry) => {
    if (!entry) return
    setActionState({ key: entry.username, action: 'refresh' })
    setActionMessage(null)
    try {
      await refreshDiscovered(entry.username)
    } catch (error) {
      setActionMessage(error.message || 'Unable to refresh constellation')
    } finally {
      setActionState({ key: null, action: null })
    }
  }

  const handleDelete = (entry, type) => {
    if (!entry) return
    const label = type === 'fused' ? entry.name : entry.username
    const confirmed = window.confirm(`Remove ${label} from Discovered?`)
    if (!confirmed) return
    if (type === 'fused') {
      removeFused(entry.id)
    } else {
      removeDiscovered(entry.username)
    }
  }

  const handleOpenFuse = (entry) => {
    if (!entry) return
    setFuseTarget(entry)
    setFuseType('union')
  }

  const handleCreateFuse = () => {
    if (!fuseTarget || !fuseType) return
    setActionMessage(null)
    try {
      const entry = createFusion(fuseTarget.username, fuseType)
      if (entry?.id) {
        setNewlyAddedKey(entry.id)
      }
      setFuseTarget(null)
      setFuseType(null)
    } catch (error) {
      setActionMessage(error.message || 'Unable to create fusion')
    }
  }

  const searchDisabled = isOffline || isSearching
  const addDisabled = isOffline || isAdding || storageStatus.isFull
  const offlineTitle = isOffline ? 'Available when online' : ''
  const storageFullTitle = storageStatus.isFull ? 'Storage is full' : ''

  const registeredEpoch = Number(searchResult?.registered?.unixtime)
  const registeredYear = Number.isFinite(registeredEpoch) && registeredEpoch > 0
    ? new Date(registeredEpoch * 1000).getFullYear()
    : 'Unknown'
  const searchMeta = searchResult
    ? `${formatNumber(Number(searchResult.playcount || 0))} total scrobbles - Member since ${registeredYear}`
    : ''

  const storageBanner = storageStatus.isWarning && !storageDismissed
  const showEmptyState = discovered.length === 0 && fused.length === 0

  return (
    <div className="discover-overlay open" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label="Discover">
      <div className="discover-panel">
        <div className="discover-panel__header">
          <button className="discover-panel__close" onClick={onClose} type="button">
            Close
          </button>
          <h2>Discover</h2>
          <div className="discover-panel__spacer" />
        </div>

        <div className="discover-panel__content">
          {isOffline && (
            <div className="discover-banner discover-banner--offline">
              You are offline. Cached constellations are still available.
            </div>
          )}

          {storageBanner && (
            <div className="discover-banner discover-banner--storage">
              <span>
                Storage almost full ({(storageStatus.bytes / (1024 * 1024)).toFixed(1)} MB / 5 MB). Remove constellations to add more.
              </span>
              <button type="button" onClick={() => setStorageDismissed(true)}>
                Dismiss
              </button>
            </div>
          )}

          {actionMessage && (
            <div className="discover-banner discover-banner--error">
              {actionMessage}
            </div>
          )}

          <div className="discover-search">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                if (searchError) {
                  setSearchError(null)
                }
              }}
              placeholder="Search Last.fm username..."
              aria-label="Search Last.fm username"
              disabled={searchDisabled}
              title={offlineTitle}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSearch()
                }
              }}
            />
            <button
              className="btn btn--primary"
              onClick={handleSearch}
              disabled={searchDisabled || !query.trim()}
              title={offlineTitle}
              type="button"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {searchError && (
            <div className="discover-search__error">{searchError}</div>
          )}

          {searchResult && (
            <div className="discover-preview">
              <div>
                <div className="discover-preview__title">{searchResult.name} found</div>
                <div className="discover-preview__meta">{searchMeta}</div>
              </div>
              <div className="discover-preview__actions">
                <button
                  className="btn btn--primary"
                  onClick={handleAdd}
                  disabled={addDisabled}
                  title={storageFullTitle || offlineTitle}
                  type="button"
                >
                  {isAdding ? 'Adding...' : 'Add to Discovered'}
                </button>
                <button
                  className="btn btn--ghost"
                  onClick={() => setSearchResult(null)}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="discover-section">
            <div className="discover-section__title">Original Path</div>
            <DiscoverCard
              title="Your Constellation"
              subtitle={currentUsername ? `@${currentUsername}` : 'Original Path'}
              artistCount={originalArtistCount}
              connectionCount={originalConnectionCount}
              topGenres={originalTopGenres}
              meta="Original Path"
              badges={activeConstellation?.type === 'original' ? [{ label: 'Viewing', tone: 'active' }] : []}
              actions={[
                {
                  key: 'view',
                  label: 'View',
                  variant: 'primary',
                  onClick: () => handleView(null, 'original')
                }
              ]}
              isFeatured
              isActive={activeConstellation?.type === 'original'}
            />
          </div>

          <div className="discover-section">
            <div className="discover-section__title">Discovered</div>

            {showEmptyState && (
              <div className="discover-empty">
                <p>Explore other music universes.</p>
                <p>Search a Last.fm username to view their constellation, play Connections, or fuse your libraries.</p>
              </div>
            )}

            {discovered.map((entry) => {
              const outdated = isOutdated(entry)
              const isActive = activeUsername === entry.username.toLowerCase()
              const isLoadingRefresh = actionState.key === entry.username && actionState.action === 'refresh'

              return (
                <DiscoverCard
                  key={entry.username}
                  title={`${entry.username}'s Constellation`}
                  subtitle={newlyAddedKey === entry.username ? 'Just added' : null}
                  artistCount={entry.artistCount}
                  connectionCount={entry.connectionCount}
                  topGenres={entry.topGenres}
                  meta={formatDateLabel(entry.lastChecked)}
                  badges={[
                    isActive && { label: 'Viewing', tone: 'active' },
                    outdated && { label: 'Outdated', tone: 'warn' }
                  ].filter(Boolean)}
                  iconActions={[
                    {
                      key: 'refresh',
                      label: 'Refresh',
                      onClick: () => handleRefresh(entry),
                      disabled: isOffline,
                      loading: isLoadingRefresh,
                      title: offlineTitle,
                      icon: <RefreshIcon />
                    },
                    {
                      key: 'delete',
                      label: 'Remove',
                      tone: 'danger',
                      onClick: () => handleDelete(entry, 'discovered'),
                      icon: <TrashIcon />
                    }
                  ]}
                  actions={[
                    {
                      key: 'view',
                      label: 'View',
                      variant: 'primary',
                      onClick: () => handleView(entry, 'discovered')
                    },
                    {
                      key: 'fuse',
                      label: 'Fuse',
                      onClick: () => handleOpenFuse(entry),
                      disabled: !originalArtists?.length,
                      title: !originalArtists?.length ? 'Load your Original Path to fuse' : ''
                    },
                    {
                      key: 'connections',
                      label: 'Connections',
                      onClick: () => handleConnections(entry, 'discovered')
                    }
                  ]}
                  isActive={isActive}
                  isHighlighted={newlyAddedKey === entry.username}
                />
              )
            })}

            {fused.map((entry) => {
              const isActive = activeFusedId === entry.id

              return (
                <DiscoverCard
                  key={entry.id}
                  title={entry.name}
                  subtitle={newlyAddedKey === entry.id ? 'Just fused' : null}
                  artistCount={entry.artistCount}
                  connectionCount={entry.connectionCount}
                  topGenres={entry.topGenres}
                  meta={`Fused on ${new Date(entry.createdAt).toLocaleDateString()}`}
                  badges={[
                    { label: 'Fused', tone: 'info' },
                    isActive && { label: 'Viewing', tone: 'active' }
                  ].filter(Boolean)}
                  iconActions={[
                    {
                      key: 'delete',
                      label: 'Remove',
                      tone: 'danger',
                      onClick: () => handleDelete(entry, 'fused'),
                      icon: <TrashIcon />
                    }
                  ]}
                  actions={[
                    {
                      key: 'view',
                      label: 'View',
                      variant: 'primary',
                      onClick: () => handleView(entry, 'fused')
                    },
                    {
                      key: 'connections',
                      label: 'Connections',
                      onClick: () => handleConnections(entry, 'fused')
                    }
                  ]}
                  isActive={isActive}
                  isHighlighted={newlyAddedKey === entry.id}
                />
              )
            })}
          </div>
        </div>
      </div>

      <FuseModal
        isOpen={Boolean(fuseTarget)}
        onClose={() => {
          setFuseTarget(null)
          setFuseType(null)
        }}
        onConfirm={handleCreateFuse}
        selectedType={fuseType}
        onSelectType={setFuseType}
        sourceLabel={fuseTarget?.username}
        myCount={originalArtistCount}
        theirCount={fuseTarget?.artistCount}
        preview={previewFusion}
      />
    </div>
  )
}

export default DiscoverMode

