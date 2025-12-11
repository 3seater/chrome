import { useState } from 'react'
import Spline from '@splinetool/react-spline'
import Dither from './Dither'
import './App.css'

function App() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText('$CHROME')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="app">
      {/* Dither Background */}
      <div className="dither-background">
        <Dither
          imageSrc="/Main Image/download.jpg"
          colorNum={6}
          pixelSize={2.5}
          disableAnimation={false}
          brightness={0.25}
          enableMouseInteraction={false}
          mouseRadius={0}
        />
      </div>

      {/* Navigation */}
      <nav className="top-nav">
        <div className="nav-logo">CHROME</div>
        <div className="nav-links">
          <a 
            href="https://pump.fun" 
            target="_blank" 
            rel="noopener noreferrer"
            className="nav-link"
          >
            Pump.fun
          </a>
          <a 
            href="https://twitter.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="nav-link"
          >
            Twitter
          </a>
          <button 
            className="nav-link"
            onClick={handleCopy}
          >
            {copied ? 'Copied!' : 'Copy CA'}
          </button>
        </div>
      </nav>

      {/* Hero Section - Full Screen */}
      <section className="hero-fullscreen">
        {/* Stacked Chrome Text */}
        <div className="chrome-stack">
          <h1 className="chrome-text chrome-1">CHROME</h1>
          <h1 className="chrome-text chrome-2">CHROME</h1>
          <h1 className="chrome-text chrome-3">CHROME</h1>
        </div>

        {/* 3D Spline Cross - On Top */}
        <div className="spline-hero-container">
          <Spline 
            scene="https://prod.spline.design/rnkDTG3pfuDvWg70/scene.splinecode"
          />
        </div>
      </section>

      <div className="container">
        {/* DexScreener Chart */}
        <div className="chart-container">
          <iframe
            src="https://dexscreener.com/solana/H2yHLoC24dM5v1Vjh2Poqx7fZ9mp8EfR2MYseXScpump?embed=1&theme=dark"
            frameBorder="0"
            width="100%"
            height="600"
            title="DexScreener Chart"
            className="dexscreener-chart"
          ></iframe>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        © 2025 CHROME
      </footer>
    </div>
  )
}

export default App

