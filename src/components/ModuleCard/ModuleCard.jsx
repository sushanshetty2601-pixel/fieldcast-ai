import './ModuleCard.css'

export default function ModuleCard({ module, onClick }) {
  return (
    <button
      className={`module-card module-card--${module.color}`}
      onClick={() => onClick(module.id)}
      style={{ '--card-gradient': module.gradient, '--card-glow': module.glowColor }}
    >
      <div className="module-card-icon">{module.icon}</div>
      <div className="module-card-body">
        <h3 className="module-card-name">{module.name}</h3>
        <p className="module-card-tagline">{module.tagline}</p>
      </div>
      <div className="module-card-arrow">→</div>
    </button>
  )
}
