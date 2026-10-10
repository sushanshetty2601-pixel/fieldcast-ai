import { useState } from 'react'
import { getModule } from '../data/modules.js'
import { runPrediction } from '../utils/predictions.js'
import ActivityForm from '../components/ActivityForm/ActivityForm.jsx'
import PredictionResult from '../components/PredictionResult/PredictionResult.jsx'
import { MODULES } from '../data/modules.js'
import './ModulePage.css'

export default function ModulePage({ module: moduleId, navigateTo }) {
  const module = getModule(moduleId)
  const [result, setResult] = useState(null)
  const [formData, setFormData] = useState(null)

  if (!module) {
    return (
      <div className="module-error container">
        <h2>Module not found</h2>
        <button className="btn btn-primary" onClick={() => navigateTo('home')}>
          ← Back to Home
        </button>
      </div>
    )
  }

  const handleSubmit = (data) => {
    const prediction = runPrediction(module.id, data)
    setFormData(data)
    setResult(prediction)
  }

  const handleReset = () => {
    setResult(null)
    setFormData(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Sibling modules (same category or just related)
  const siblings = MODULES.filter(m => m.id !== module.id && m.category === module.category).slice(0, 3)

  return (
    <div className="module-page">
      {/* Module hero banner */}
      <div
        className="module-hero"
        style={{ '--module-gradient': module.gradient, '--module-glow': module.glowColor }}
      >
        <div className="module-hero-bg" />
        <div className="container module-hero-content">
          <button className="module-back-btn" onClick={() => navigateTo('home')}>
            ← Back
          </button>
          <div className="module-hero-main">
            <div className="module-hero-icon">{module.icon}</div>
            <div>
              <h1 className="module-hero-name">{module.name}</h1>
              <p className="module-hero-tagline">{module.tagline}</p>
            </div>
          </div>
          <p className="module-hero-desc">{module.description}</p>
        </div>
      </div>

      {/* Main content */}
      <div className="module-body container">
        <div className="module-main">
          {!result ? (
            <div className="module-form-section glass-card">
              <h2 className="module-form-title">Enter Your Details</h2>
              <p className="module-form-subtitle">
                Fill in the information below to generate your outdoor intelligence estimate.
              </p>
              <ActivityForm module={module} onSubmit={handleSubmit} />
            </div>
          ) : (
            <PredictionResult
              result={result}
              moduleName={module.name}
              formData={formData}
              onReset={handleReset}
            />
          )}
        </div>

        {/* Sidebar */}
        <aside className="module-sidebar">
          {/* About this module */}
          <div className="sidebar-card glass-card">
            <h3 className="sidebar-title">About {module.name}</h3>
            <p className="sidebar-text">{module.description}</p>
            <div className="sidebar-tag">
              <span className="badge badge-info">{module.category}</span>
            </div>
          </div>

          {/* Related modules */}
          {siblings.length > 0 && (
            <div className="sidebar-card glass-card">
              <h3 className="sidebar-title">Related Modules</h3>
              <div className="sidebar-related">
                {siblings.map(m => (
                  <button
                    key={m.id}
                    className="sidebar-related-item"
                    onClick={() => {
                      setResult(null)
                      setFormData(null)
                      navigateTo('module', m.id)
                    }}
                  >
                    <span>{m.icon}</span>
                    <div>
                      <div className="sidebar-related-name">{m.name}</div>
                      <div className="sidebar-related-tag">{m.tagline}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Honesty notice */}
          <div className="sidebar-card sidebar-card--notice glass-card">
            <h3 className="sidebar-title">📣 Transparency</h3>
            <p className="sidebar-text">
              All predictions are heuristic demonstration estimates. They are not connected to live weather data, GPS, or validated AI models.
              Real data integrations are planned for the next development stage.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
