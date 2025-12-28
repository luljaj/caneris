import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import './Login.css'

// Orbit configuration
const ORBIT_CONFIG = {
  radiusX: 210,    // Horizontal radius
  radiusY: 70,     // Vertical radius
  tilt: 18 * (Math.PI / 180),  // 18 degrees in radians
  baseSpeed: 0.0006,
  slowedSpeed: 0.0002,
}

function Login({ onLastFmLogin }) {
  const [lastfmUsername, setLastfmUsername] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState('')
  const [showInfo, setShowInfo] = useState(false)
  const [formRevealed, setFormRevealed] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  // Refs for orbit animation
  const titleWrapperRef = useRef(null)
  const particleRef = useRef(null)
  const orbitStateRef = useRef({
    angle: 0,
    currentSpeed: ORBIT_CONFIG.baseSpeed,
    targetSpeed: ORBIT_CONFIG.baseSpeed,
  })

  // Orbit animation loop
  useEffect(() => {
    const particle = particleRef.current
    const titleWrapper = titleWrapperRef.current
    if (!particle || !titleWrapper) return

    let lastTime = performance.now()
    let animationId

    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime
      lastTime = currentTime

      const state = orbitStateRef.current

      // Smoothly interpolate speed
      const speedEasing = 0.03
      state.currentSpeed += (state.targetSpeed - state.currentSpeed) * speedEasing

      // Update angle
      state.angle += state.currentSpeed * deltaTime
      if (state.angle > Math.PI * 2) {
        state.angle -= Math.PI * 2
      }

      // Calculate position on ellipse
      const x = ORBIT_CONFIG.radiusX * Math.cos(state.angle)
      const y = ORBIT_CONFIG.radiusY * Math.sin(state.angle)

      // Apply tilt rotation
      const cosT = Math.cos(ORBIT_CONFIG.tilt)
      const sinT = Math.sin(ORBIT_CONFIG.tilt)
      const rotatedX = x * cosT - y * sinT
      const rotatedY = x * sinT + y * cosT

      // Get center of title wrapper
      const rect = titleWrapper.getBoundingClientRect()
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      // Position particle
      particle.style.left = (centerX + rotatedX) + 'px'
      particle.style.top = (centerY + rotatedY) + 'px'

      // 3D depth effect
      const isBehind = rotatedY < 0
      particle.style.zIndex = isBehind ? '1' : '10'

      // Scale and opacity for depth
      const depthFactor = (rotatedY + ORBIT_CONFIG.radiusY) / (ORBIT_CONFIG.radiusY * 2)
      const scale = 0.6 + (depthFactor * 0.4)
      const opacity = 0.4 + (depthFactor * 0.6)

      particle.style.transform = `translate(-50%, -50%) scale(${scale})`
      particle.style.opacity = opacity

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [])

  // Update orbit speed on hover
  useEffect(() => {
    orbitStateRef.current.targetSpeed = isHovering
      ? ORBIT_CONFIG.slowedSpeed
      : ORBIT_CONFIG.baseSpeed
  }, [isHovering])

  const handleLastFmSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!lastfmUsername.trim()) {
      setError('Please enter your Last.fm username')
      return
    }

    setIsValidating(true)
    setError('')

    try {
      await onLastFmLogin(lastfmUsername.trim())
    } catch (err) {
      setError(err.message || 'Failed to connect to Last.fm')
    } finally {
      setIsValidating(false)
    }
  }

  const handleRevealForm = useCallback((e) => {
    // Don't reveal if clicking on form elements or if already revealed
    if (formRevealed) return

    setFormRevealed(true)
  }, [formRevealed])

  const inputRef = useRef(null)

  // Focus input when form is revealed
  useEffect(() => {
    if (formRevealed && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current.focus()
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [formRevealed])

  return (
    <div className="login" onClick={handleRevealForm}>
      <div className="login__content">
        {/* Title wrapper with orbit */}
        <div
          className={`login__title-wrapper ${formRevealed ? 'login__title-wrapper--shifted' : ''}`}
          ref={titleWrapperRef}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <Link
            to="/info"
            className={`login__info-link ${showInfo ? 'login__info-link--visible' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            INFO
          </Link>
          <h1
            className="login__title"
            onClick={(e) => {
              e.stopPropagation()
              // Only toggle info after form is revealed
              if (formRevealed) {
                setShowInfo(!showInfo)
              }
            }}
          >
            CANERIS
          </h1>

          {/* Orbiting particle */}
          <div className="login__orbit-particle" ref={particleRef} />
        </div>

        {/* Etymology */}
        <div className={`login__etymology ${formRevealed ? 'login__etymology--shifted' : ''}`}>
          <span className="login__etymology-word">caneris</span>
          <span className="login__etymology-divider">—</span>
          <span className="login__etymology-meaning">from Latin "canere": to sing</span>
        </div>

        {/* Login form - hidden until clicked */}
        <form
          className={`login__form ${formRevealed ? 'login__form--visible' : ''}`}
          onSubmit={handleLastFmSubmit}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="login__input-wrapper">
            <input
              ref={inputRef}
              type="text"
              className="login__input"
              placeholder="Last.fm username"
              value={lastfmUsername}
              onChange={(e) => setLastfmUsername(e.target.value)}
              disabled={isValidating}
            />
            {error && <p className="login__error">{error}</p>}
          </div>

          <button
            type="submit"
            className="login__button login__button--lastfm"
            disabled={isValidating}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M10.584 17.21l-.88-2.392s-1.43 1.594-3.573 1.594c-1.897 0-3.244-1.649-3.244-4.288 0-3.382 1.704-4.591 3.381-4.591 2.42 0 3.189 1.567 3.849 3.574l.88 2.749c.88 2.666 2.529 4.81 7.285 4.81 3.409 0 5.718-1.044 5.718-3.793 0-2.227-1.265-3.381-3.63-3.931l-1.758-.385c-1.21-.275-1.567-.77-1.567-1.595 0-.934.742-1.484 1.952-1.484 1.32 0 2.034.495 2.144 1.677l2.749-.33c-.22-2.474-1.924-3.492-4.729-3.492-2.474 0-4.893.935-4.893 3.932 0 1.87.907 3.051 3.189 3.601l1.87.44c1.402.33 1.869.907 1.869 1.704 0 1.017-.99 1.43-2.86 1.43-2.776 0-3.93-1.457-4.59-3.464l-.907-2.75c-1.155-3.573-2.997-4.893-6.653-4.893C2.144 5.333 0 7.89 0 12.233c0 4.18 2.144 6.434 5.993 6.434 3.106 0 4.591-1.457 4.591-1.457z"/>
            </svg>
            {isValidating ? 'Connecting...' : 'Explore with Last.fm'}
          </button>
        </form>

        {/* Click hint */}
        <div className={`login__hint ${formRevealed ? 'login__hint--hidden' : ''}`}>
          Click anywhere to enter
        </div>
      </div>
    </div>
  )
}

export default Login
