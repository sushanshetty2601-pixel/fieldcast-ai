import { useState } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import './PredictionResult.css'

function ScoreRing({ score, color }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const colorMap = {
    green: '#4ade80', sky: '#60a5fa', amber: '#fbbf24',
    orange: '#f97316', red: '#f87171', teal: '#2dd4bf',
    violet: '#a78bfa', indigo: '#818cf8',
  }
  const strokeColor = colorMap[color] || '#60a5fa'

  return (
    <svg className="score-ring" viewBox="0 0 88 88">
      <circle cx="44" cy="44" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
      <circle
        cx="44" cy="44" r={radius}
        fill="none"
        stroke={strokeColor}
        strokeWidth="8"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 44 44)"
        style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 8px ${strokeColor})` }}
      />
      <text x="44" y="48" textAnchor="middle" fill="white" fontSize="18" fontWeight="800" fontFamily="Inter">
        {score}
      </text>
    </svg>
  )
}

function FactorBadge({ factor }) {
  const icons = { positive: '↑', negative: '↓', neutral: '→' }
  return (
    <div className={`factor-badge factor-badge--${factor.impact}`}>
      <span className="factor-icon">{icons[factor.impact]}</span>
      <span className="factor-label">{factor.label}</span>
      <span className="factor-text">{factor.text}</span>
    </div>
  )
}

export default function PredictionResult({ result, moduleName, formData, onReset }) {
  const { saveActivity } = useApp()
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    saveActivity({
      moduleId: result.moduleId,
      moduleName,
      headline: result.headline,
      score: result.score,
      formData,
      result,
    })
    setSaved(true)
  }

  return (
    <div className="prediction-result animate-slide-up">
      {/* Demo label */}
      <div className="prediction-demo-notice">
        <span className="badge badge-demo">📊 Demonstration Estimate</span>
        <span className="demo-notice-text">
          This is a heuristic estimate for illustration purposes — not a validated AI prediction.
        </span>
      </div>

      {/* Score header */}
      <div className="prediction-header glass-card">
        <div className="prediction-score-area">
          <ScoreRing score={result.score} color={result.scoreLabel?.color} />
          <div className="prediction-score-info">
            <span className={`prediction-verdict verdict--${result.scoreLabel?.color}`}>
              {result.scoreLabel?.label}
            </span>
            <h2 className="prediction-headline">{result.headline}</h2>
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="prediction-metrics">
        {result.metrics?.map((m, i) => (
          <div key={i} className="metric-card glass-card">
            <span className="metric-label">{m.label}</span>
            <span className="metric-value">{m.value}</span>
            {m.note && <span className="metric-note">{m.note}</span>}
          </div>
        ))}
      </div>

      {/* Species list (BirdForecast) */}
      {result.species && (
        <div className="prediction-section glass-card">
          <h3 className="prediction-section-title">🐦 Likely Species</h3>
          <div className="species-grid">
            {result.species.map((s, i) => (
              <div key={i} className="species-chip">{s}</div>
            ))}
          </div>
        </div>
      )}

      {/* Garden tasks (GardenEye) */}
      {result.tasks && (
        <div className="prediction-section glass-card">
          <h3 className="prediction-section-title">📋 Care Tasks</h3>
          <div className="tasks-list">
            {result.tasks.map((t, i) => (
              <div key={i} className={`task-item task-item--${t.priority.toLowerCase()}`}>
                <span className="task-priority">{t.priority}</span>
                <span className="task-text">{t.task}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk list (PlanShield) */}
      {result.risks && (
        <div className="prediction-section glass-card">
          <h3 className="prediction-section-title">⚠️ Risk Factors</h3>
          <ul className="risks-list">
            {result.risks.map((r, i) => (
              <li key={i} className="risk-item">{r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Gear (TrailGuard) */}
      {result.gear && (
        <div className="prediction-section glass-card">
          <h3 className="prediction-section-title">🎒 Recommended Gear</h3>
          <div className="gear-list">
            {result.gear.map((g, i) => (
              <div key={i} className="gear-item">
                <span className="gear-check">✓</span> {g}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Factors */}
      {result.factors && (
        <div className="prediction-section glass-card">
          <h3 className="prediction-section-title">📊 Influencing Factors</h3>
          <div className="factors-list">
            {result.factors.map((f, i) => (
              <FactorBadge key={i} factor={f} />
            ))}
          </div>
        </div>
      )}

      {/* Alternatives */}
      {result.alternatives && result.alternatives.length > 0 && (
        <div className="prediction-section glass-card">
          <h3 className="prediction-section-title">🔄 Alternative Scenarios</h3>
          <div className="alternatives-list">
            {result.alternatives.map((a, i) => (
              <div key={i} className="alternative-item">
                <span className="alternative-label">{a.label}</span>
                <span className="alternative-note">{a.note}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation */}
      <div className="prediction-recommendation glass-card">
        <h3 className="prediction-section-title">💡 Recommended Action</h3>
        <p className="recommendation-text">{result.recommendation}</p>
      </div>

      {/* Actions */}
      <div className="prediction-actions">
        <button
          className={`btn ${saved ? 'btn-secondary' : 'btn-primary'}`}
          onClick={handleSave}
          disabled={saved}
        >
          {saved ? '✓ Saved' : '💾 Save Result'}
        </button>
        <button className="btn btn-ghost" onClick={onReset}>
          ← New Prediction
        </button>
      </div>
    </div>
  )
}
