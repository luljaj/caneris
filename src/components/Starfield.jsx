import './Starfield.css'

// Generate stars once, outside component
const generateStars = (count) => {
  return [...Array(count)].map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.5 + 0.3
  }))
}

const STARS = generateStars(80)

function Starfield() {
  return (
    <div className="starfield">
      {/* Stars */}
      <div className="starfield__stars">
        {STARS.map((star) => (
          <div 
            key={star.id} 
            className="starfield__star"
            style={{
              '--x': `${star.x}%`,
              '--y': `${star.y}%`,
              '--size': `${star.size}px`,
              '--duration': `${star.duration}s`,
              '--delay': `${star.delay}s`,
              '--opacity': star.opacity
            }}
          />
        ))}
      </div>
      
      {/* Subtle nebula glow */}
      <div className="starfield__nebula"></div>
    </div>
  )
}

export default Starfield

