import { useState } from 'react'
import { MODULES, ACTIVITY_CARDS } from '../../data/modules.js'
import './Hero.css'

export default function Hero({ navigateTo }) {
  const [query, setQuery] = useState('')

  const handlePlan = () => {
    if (!query.trim()) return
    // Find best matching module from query
    const q = query.toLowerCase()
    const match = MODULES.find(m =>
      m.name.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.tagline.toLowerCase().includes(q) ||
      q.includes(m.category)
    )
    navigateTo('module', match?.id || 'planshield')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handlePlan()
  }

  return (
    <section className="hero">
      {/* Sky / atmosphere layers */}
      <div className="hero-sky">
        <div className="hero-gradient-1" />
        <div className="hero-gradient-2" />
        <div className="hero-stars" />
      </div>

      {/* Animated clouds */}
      <div className="hero-clouds">
        <div className="cloud cloud-1" />
        <div className="cloud cloud-2" />
        <div className="cloud cloud-3" />
      </div>

      {/* Mountain silhouette */}
      <div className="hero-mountains">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="mountain-svg mountain-back">
          <path d="M0,320 L0,200 L120,120 L240,180 L360,80 L480,160 L600,40 L720,140 L840,60 L960,150 L1080,70 L1200,160 L1320,90 L1440,180 L1440,320 Z" />
        </svg>
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="mountain-svg mountain-mid">
          <path d="M0,320 L0,240 L180,150 L320,220 L480,120 L620,200 L760,100 L900,190 L1060,130 L1200,200 L1320,150 L1440,220 L1440,320 Z" />
        </svg>
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="mountain-svg mountain-front">
          <path d="M0,320 L0,280 L200,210 L360,260 L520,190 L680,250 L840,180 L1000,240 L1160,200 L1320,250 L1440,220 L1440,320 Z" />
        </svg>
        {/* Sun / moon glow */}
        <div className="hero-sun" />
      </div>

      {/* Content */}
      <div className="hero-content container">
        <div className="hero-badge animate-fade-in">
          <span className="badge badge-demo">🚀 Hacktoberfest 2024 — Touch Grass Challenge</span>
        </div>

        <h1 className="hero-title animate-slide-up">
          <span className="hero-title-main">FieldCast AI</span>
          <span className="hero-title-sub">Outdoor Intelligence Platform</span>
        </h1>

        <p className="hero-tagline animate-slide-up">
          Make better outdoor decisions <em>before</em> you step outside.
        </p>

        <div className="hero-search animate-slide-up">
          <div className="hero-search-box">
            <span className="hero-search-icon">🔍</span>
            <input
              type="text"
              className="hero-search-input"
              placeholder="Trail run, sunset spot, camping trip..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="btn btn-hero" onClick={handlePlan}>
              Plan My Outdoor Experience
            </button>
          </div>
          <p className="hero-search-hint">
            Or choose an activity below ↓
          </p>
        </div>

        {/* Quick activity cards */}
        <div className="hero-activities animate-fade-in">
          {ACTIVITY_CARDS.map(card => (
            <button
              key={card.id}
              className="hero-activity-chip"
              onClick={() => navigateTo('module', card.modules[0])}
            >
              <span>{card.icon}</span>
              <span>{card.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll-indicator">
        <div className="scroll-dot" />
      </div>
    </section>
  )
}
