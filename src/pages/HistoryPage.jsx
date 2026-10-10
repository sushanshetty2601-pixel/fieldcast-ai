import { useApp } from '../context/AppContext.jsx'
import { getModule } from '../data/modules.js'
import './HistoryPage.css'

function formatDate(isoString) {
  const d = new Date(isoString)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function ScoreBadge({ score, color }) {
  const colorClass = color || 'sky'
  return (
    <div className={`history-score history-score--${colorClass}`}>
      {score}
    </div>
  )
}

export default function HistoryPage({ navigateTo }) {
  const { savedActivities, deleteActivity } = useApp()

  if (savedActivities.length === 0) {
    return (
      <div className="history-page history-empty">
        <div className="container history-empty-content">
          <div className="history-empty-icon">🏕️</div>
          <h2 className="history-empty-title">No saved activities yet</h2>
          <p className="history-empty-text">
            Use any module to generate a prediction, then save it to review here.
          </p>
          <button className="btn btn-primary" onClick={() => navigateTo('home')}>
            ← Explore Modules
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="history-page">
      <div className="history-hero">
        <div className="container">
          <h1 className="history-title">Activity History</h1>
          <p className="history-subtitle">
            Your saved outdoor intelligence predictions — {savedActivities.length} saved.
          </p>
        </div>
      </div>

      <div className="container history-list-wrap">
        <div className="history-list">
          {savedActivities.map(activity => {
            const module = getModule(activity.moduleId)
            return (
              <div key={activity.id} className="history-item glass-card">
                <div className="history-item-header">
                  <div className="history-item-meta">
                    <span className="history-item-icon">{module?.icon || '📍'}</span>
                    <div>
                      <div className="history-item-module">{activity.moduleName}</div>
                      <div className="history-item-date">{formatDate(activity.timestamp)}</div>
                    </div>
                  </div>
                  <ScoreBadge score={activity.score} color={activity.result?.scoreLabel?.color} />
                </div>

                <h3 className="history-item-headline">{activity.headline}</h3>

                {activity.result?.recommendation && (
                  <p className="history-item-rec">{activity.result.recommendation}</p>
                )}

                <div className="history-item-footer">
                  <span className="badge badge-demo">Demonstration estimate</span>
                  <div className="history-item-actions">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => navigateTo('module', activity.moduleId)}
                    >
                      Run Again
                    </button>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => deleteActivity(activity.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
