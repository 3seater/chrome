import { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react'
import Spline from '@splinetool/react-spline'
import './App.css'

// Lazy load Dither for better initial load
const Dither = lazy(() => import('./Dither'))

function App() {
  const [chartOpen, setChartOpen] = useState(false)
  const [position, setPosition] = useState({ x: 100, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [loading, setLoading] = useState(true)
  const [ditherReady, setDitherReady] = useState(false)
  const chartRef = useRef(null)

  // Mount dither after a short delay to avoid Three.js conflicts
  useEffect(() => {
    const ditherTimer = setTimeout(() => {
      setDitherReady(true)
    }, 200)
    return () => clearTimeout(ditherTimer)
  }, [])

  // Preloader - hide after 3.5 seconds (extended 1s for optimization)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 3500)
    return () => clearTimeout(timer)
  }, [])

  const toggleChart = useCallback(() => {
    setChartOpen(prev => {
      const newState = !prev
      if (newState) {
        document.body.style.overflow = 'hidden'
        document.body.style.touchAction = 'none'
      } else {
        document.body.style.overflow = ''
        document.body.style.touchAction = ''
      }
      return newState
    })
  }, [])

  const handleMouseDown = useCallback((e) => {
    if (e.target.closest('.chart-header')) {
      setIsDragging(true)
      const rect = chartRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      })
    }
  }, [isDragging, dragOffset])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Generate circular text for preloader
  const letters = ['C', 'H', 'R', 'O', 'M', 'E']
  const [radius, setRadius] = useState(45)

  useEffect(() => {
    const updateRadius = () => {
      if (window.innerWidth <= 480) {
        setRadius(28)
      } else if (window.innerWidth <= 600) {
        setRadius(32)
      } else if (window.innerWidth <= 768) {
        setRadius(38)
      } else {
        setRadius(45)
      }
    }
    updateRadius()
    window.addEventListener('resize', updateRadius)
    return () => window.removeEventListener('resize', updateRadius)
  }, [])
  
  return (
    <div className={`app ${!loading ? 'loaded' : ''}`}>
      {/* Dither Background */}
      <div className="dither-background">
        {ditherReady && (
          <Suspense fallback={null}>
            <Dither
              imageSrc="/MainImage/download.jpg"
              colorNum={6}
              pixelSize={2.5}
              disableAnimation={false}
              brightness={0.2}
              enableMouseInteraction={false}
              mouseRadius={0}
            />
          </Suspense>
        )}
      </div>

      {/* Preloader */}
      {loading && (
        <div className="preloader">
          <div className="preloader-circle">
            {letters.map((letter, index) => {
              const angle = (index * 360) / letters.length - 90
              const radian = (angle * Math.PI) / 180
              const x = Math.cos(radian) * radius
              const y = Math.sin(radian) * radius
              return (
                <span
                  key={index}
                  className="circle-letter"
                  style={{
                    transform: `translate(${x}px, ${y}px) rotate(${angle + 90}deg)`
                  }}
                >
                  {letter}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Navigation - Small white centered links */}
      <nav className="top-nav">
        <a 
          href="https://pump.fun" 
          target="_blank" 
          rel="noopener noreferrer"
          className="nav-item"
        >
          PUMP.FUN
        </a>
        <a 
          href="https://twitter.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="nav-item"
        >
          TWITTER
        </a>
        <button className="nav-item" onClick={toggleChart}>
          CHART
        </button>
      </nav>

      {/* Main Content */}
      <section className="hero-section">
        {/* Cat Image with Splines - All framed together */}
        <div className="cat-spline-wrapper">
          {/* Second 3D Spline Asset - Top Left of cat */}
          <div className="spline-top-left">
            <Spline 
              scene="https://prod.spline.design/cau2LAbdkh4Z9hKn/scene.splinecode"
            />
          </div>

          {/* Cat Image - Centered */}
          <div className="cat-image-container">
            <img 
              src="/MainImage/download.jpg" 
              alt="Chrome Cat"
              className="cat-image"
              loading="eager"
            />
          </div>

          {/* First 3D Spline Asset - Bottom Right of cat */}
          <div className="spline-bottom-right">
            <Spline 
              scene="https://prod.spline.design/rnkDTG3pfuDvWg70/scene.splinecode?v=2"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        © 2025 <span className="footer-chrome">CHROME</span>
      </footer>

      {/* Draggable Chart Popup */}
      {chartOpen && (
        <div 
          className="chart-popup"
          ref={chartRef}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`
          }}
          onMouseDown={handleMouseDown}
        >
          <div className="chart-header">
            <span>CHART</span>
            <button className="chart-close" onClick={toggleChart}>✕</button>
          </div>
          <div className="chart-content">
            <iframe
              src="https://dexscreener.com/solana/H2yHLoC24dM5v1Vjh2Poqx7fZ9mp8EfR2MYseXScpump?embed=1&theme=dark&info=0"
              frameBorder="0"
              width="100%"
              height="100%"
              title="DexScreener Chart"
              className="dexscreener-chart"
              loading="lazy"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
