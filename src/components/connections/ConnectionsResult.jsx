import './ConnectionsMode.css'

function ConnectionsResult({
  path,
  hops,
  guessCount,
  optimalHops,
  optimalPath,
  mode,
  score,
  startTime,
  endTime,
  nodes,
  onPlayAgain,
  onExit
}) {
  const timeElapsed = startTime && endTime
    ? ((endTime - startTime) / 1000).toFixed(1)
    : 0

  const wasOptimal = hops === optimalHops

  const nodeMap = new Map(nodes.map(n => [n.id, n]))
  const pathNodes = path.map(id => nodeMap.get(id)).filter(Boolean)

  return (
    <div className="connections-result">
      <div className="connections-result__card">
        <h2 className="connections-result__title">
          🎉 Connection Found!
        </h2>

        <div className="connections-result__path">
          <h3>Your path:</h3>
          <div className="connections-result__path-list">
            {pathNodes.map((node, index) => (
              <div key={node.id} className="connections-result__path-item">
                {node.image && (
                  <img
                    src={node.image}
                    alt={node.name}
                    className="connections-result__path-image"
                  />
                )}
                <span className="connections-result__path-name">
                  {node.name}
                </span>
                {index < pathNodes.length - 1 && (
                  <span className="connections-result__path-arrow">↓</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="connections-result__stats">
          <div className="connections-result__stat">
            <span className="connections-result__stat-value">{hops}</span>
            <span className="connections-result__stat-label">Hops</span>
          </div>

          <div className="connections-result__stat">
            <span className="connections-result__stat-value">{guessCount}</span>
            <span className="connections-result__stat-label">Guesses</span>
          </div>

          {mode === 'competitive' && (
            <>
              <div className="connections-result__stat">
                <span className="connections-result__stat-value">{timeElapsed}s</span>
                <span className="connections-result__stat-label">Time</span>
              </div>

              <div className="connections-result__stat">
                <span className="connections-result__stat-value">{score}</span>
                <span className="connections-result__stat-label">Score</span>
              </div>
            </>
          )}
        </div>

        {wasOptimal ? (
          <p className="connections-result__optimal">
            ✨ Perfect! You found the optimal path!
          </p>
        ) : (
          <p className="connections-result__suboptimal">
            Optimal was {optimalHops} hops
          </p>
        )}

        <div className="connections-result__actions">
          <button
            className="btn btn--ghost"
            onClick={onExit}
          >
            ✕ Exit
          </button>
          <button
            className="btn btn--primary"
            onClick={onPlayAgain}
          >
            🔄 New Challenge
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConnectionsResult
