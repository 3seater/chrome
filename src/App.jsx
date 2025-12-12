import { useState, useRef, useEffect } from 'react'
import Spline from '@splinetool/react-spline'
import Dither from './Dither'
import './App.css'

function App() {
  const [copied, setCopied] = useState(false)
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
    }, 100)
    return () => clearTimeout(ditherTimer)
  }, [])

  // Preloader - hide after 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText('$CHROME')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const toggleChart = () => {
    const newState = !chartOpen
    setChartOpen(newState)
    // Prevent body scroll when chart is open
    if (newState) {
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
    } else {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }

  const handleMouseDown = (e) => {
    if (e.target.closest('.chart-header')) {
      setIsDragging(true)
      const rect = chartRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset])

  // Generate circular text - each letter positioned manually
  const letters = ['C', 'H', 'R', 'O', 'M', 'E']
  const [radius, setRadius] = useState(45)

  // Adjust radius based on screen size
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
          <Dither
            imageSrc="/MainImage/download.jpg"
            colorNum={6}
            pixelSize={2.5}
            disableAnimation={false}
            brightness={0.25}
            enableMouseInteraction={false}
            mouseRadius={0}
          />
        )}
      </div>

      {/* Preloader */}
      {loading && (
        <div className="preloader">
          <div className="preloader-circle">
            {letters.map((letter, index) => {
              const angle = (index * 360) / letters.length - 90 // Start from top
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

      {/* Navigation */}
      <nav className="top-nav">
        <span className="nav-item nav-logo">CHROME</span>
        <div className="nav-right">
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
        </div>
      </nav>

      {/* Hero Section - 100vh */}
      <section className="hero-section">
        {/* Left Side - Helvetica Stack */}
        <div className="left-stack">
          <h1 className="helvetica-chrome filled">CHROME</h1>
          <h1 className="helvetica-chrome outline">CHROME</h1>
        </div>

        {/* Cat Image - Aligned with left text */}
        <div className="cat-image-container">
          <img 
            src="/MainImage/download.jpg" 
            alt="Chrome Cat"
            className="cat-image"
          />
        </div>

        {/* 3D Spline Assets Container */}
        <div className="spline-container">
          {/* Second 3D Spline Asset */}
          <div className="spline-cross-secondary">
            <Spline 
              scene="https://prod.spline.design/cau2LAbdkh4Z9hKn/scene.splinecode"
            />
          </div>

          {/* 3D Spline Cross */}
          <div className="spline-cross">
            <Spline 
              scene="https://prod.spline.design/rnkDTG3pfuDvWg70/scene.splinecode?v=2"
            />
          </div>
        </div>

        {/* Right Side - Gothic Stack */}
        <div className="right-stack">
          <h1 className="gothic-chrome outline">CHROME</h1>
          <h1 className="gothic-chrome filled">CHROME</h1>
        </div>
      </section>

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
            ></iframe>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
