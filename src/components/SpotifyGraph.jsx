import { useRef, useCallback, useEffect, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { calculateClusterCenters } from '../utils/graphUtils'
import './SpotifyGraph.css'

function SpotifyGraph({ data, onNodeClick, showGenreLabels }) {
  const graphRef = useRef()
  const containerRef = useRef()
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [hoveredNode, setHoveredNode] = useState(null)
  const [clusterCenters, setClusterCenters] = useState([])

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Update cluster centers after graph simulation
  useEffect(() => {
    if (graphRef.current && data.genreClusters?.length > 0) {
      // Wait for simulation to settle
      const timer = setTimeout(() => {
        const centers = calculateClusterCenters(data.nodes, data.genreClusters)
        setClusterCenters(centers)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [data])

  // Custom node rendering
  const nodeCanvasObject = useCallback((node, ctx, globalScale) => {
    const size = node.val || 5
    const isHovered = hoveredNode?.id === node.id
    
    // Draw node circle
    ctx.beginPath()
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI)
    
    // Fill with gradient-like effect
    ctx.fillStyle = node.color || '#1DB954'
    ctx.fill()
    
    // Add glow effect on hover
    if (isHovered) {
      ctx.shadowColor = node.color || '#1DB954'
      ctx.shadowBlur = 20
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.shadowBlur = 0
    }

    // Draw artist image if available and node is large enough
    if (node.image && size > 8) {
      const img = new Image()
      img.src = node.image
      
      if (img.complete) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(node.x, node.y, size - 2, 0, 2 * Math.PI)
        ctx.clip()
        ctx.drawImage(img, node.x - size + 2, node.y - size + 2, (size - 2) * 2, (size - 2) * 2)
        ctx.restore()
      }
    }

    // Draw label on hover
    if (isHovered) {
      const label = node.name
      const fontSize = Math.max(12, size * 0.8)
      ctx.font = `600 ${fontSize}px 'Instrument Sans', sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      
      // Background for label
      const textWidth = ctx.measureText(label).width
      const padding = 6
      const labelY = node.y + size + 8
      
      ctx.fillStyle = 'rgba(10, 10, 15, 0.9)'
      ctx.beginPath()
      ctx.roundRect(
        node.x - textWidth / 2 - padding,
        labelY - padding / 2,
        textWidth + padding * 2,
        fontSize + padding,
        4
      )
      ctx.fill()
      
      // Label text
      ctx.fillStyle = '#f0f0f5'
      ctx.fillText(label, node.x, labelY)
    }
  }, [hoveredNode])

  // Custom link rendering
  const linkCanvasObject = useCallback((link, ctx) => {
    const start = link.source
    const end = link.target
    
    if (!start.x || !end.x) return
    
    // Calculate opacity based on edge weight (more shared genres = more opaque)
    const maxWeight = 5
    const opacity = 0.1 + (Math.min(link.value, maxWeight) / maxWeight) * 0.4
    
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.strokeStyle = `rgba(29, 185, 84, ${opacity})`
    ctx.lineWidth = Math.max(0.5, link.value * 0.3)
    ctx.stroke()
  }, [])

  // Handle node hover
  const handleNodeHover = useCallback((node) => {
    setHoveredNode(node)
    if (containerRef.current) {
      containerRef.current.style.cursor = node ? 'pointer' : 'grab'
    }
  }, [])

  // Handle node click
  const handleNodeClick = useCallback((node) => {
    if (node && onNodeClick) {
      onNodeClick(node)
    }
  }, [onNodeClick])

  // Zoom to fit on load
  useEffect(() => {
    if (graphRef.current && data.nodes.length > 0) {
      setTimeout(() => {
        graphRef.current.zoomToFit(400, 50)
      }, 500)
    }
  }, [data.nodes.length])

  return (
    <div className="graph-container" ref={containerRef}>
      <ForceGraph2D
        ref={graphRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={data}
        nodeCanvasObject={nodeCanvasObject}
        linkCanvasObject={linkCanvasObject}
        onNodeHover={handleNodeHover}
        onNodeClick={handleNodeClick}
        nodeLabel={() => null}
        linkDirectionalParticles={0}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        warmupTicks={100}
        cooldownTicks={200}
        backgroundColor="transparent"
        linkColor={() => 'rgba(29, 185, 84, 0.2)'}
        nodeRelSize={1}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
      />
      
      {/* Genre cluster labels */}
      {showGenreLabels && clusterCenters.length > 0 && (
        <div className="cluster-labels">
          {clusterCenters.map((cluster) => (
            <div
              key={cluster.id}
              className="cluster-label"
              style={{
                '--cluster-color': getClusterColor(cluster.colorIndex)
              }}
            >
              {cluster.name}
            </div>
          ))}
        </div>
      )}

      {/* Hover tooltip */}
      {hoveredNode && (
        <div className="node-tooltip">
          <span className="node-tooltip__name">{hoveredNode.name}</span>
          {hoveredNode.genres?.length > 0 && (
            <span className="node-tooltip__genres">
              {hoveredNode.genres.slice(0, 3).join(' • ')}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function getClusterColor(index) {
  const colors = [
    '#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3',
    '#f38181', '#aa96da', '#fcbad3', '#a8d8ea'
  ]
  return colors[index % colors.length]
}

export default SpotifyGraph

