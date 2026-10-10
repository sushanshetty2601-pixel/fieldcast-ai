import { useState } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import './Navbar.css'

export default function Navbar({ currentPage, navigateTo }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { savedActivities } = useApp()

  const close = () => setMenuOpen(false)

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        <button className="navbar-brand" onClick={() => { navigateTo('home'); close() }}>
          <span className="navbar-logo-icon">🏔️</span>
          <span className="navbar-logo-text">
            <span className="navbar-logo-main">FieldCast</span>
            <span className="navbar-logo-ai"> AI</span>
          </span>
        </button>

        <nav className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <button
            className={`navbar-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => { navigateTo('home'); close() }}
          >
            Home
          </button>
          <button
            className={`navbar-link ${currentPage === 'history' ? 'active' : ''}`}
            onClick={() => { navigateTo('history'); close() }}
          >
            History
            {savedActivities.length > 0 && (
              <span className="navbar-badge">{savedActivities.length}</span>
            )}
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="navbar-link"
            onClick={close}
          >
            GitHub
          </a>
        </nav>

        <button
          className="navbar-hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
          <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
          <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
        </button>
      </div>
    </header>
  )
}
