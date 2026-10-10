import Hero from '../components/Hero/Hero.jsx'
import ModuleCard from '../components/ModuleCard/ModuleCard.jsx'
import { MODULES } from '../data/modules.js'
import './HomePage.css'

const HOW_IT_WORKS_STEPS = [
  { icon: '📍', title: 'Choose Your Activity', text: 'Select from 10 intelligent outdoor modules — from hiking to birdwatching.' },
  { icon: '📝', title: 'Enter Your Plan', text: 'Fill in relevant details: location, conditions, personal fitness, and preferences.' },
  { icon: '🔮', title: 'Get a Prediction', text: 'Receive a structured estimate with influencing factors and actionable advice.' },
  { icon: '💾', title: 'Save & Compare', text: 'Save results, compare alternatives, and build up your outdoor activity history.' },
]

const EXAMPLE_PREDICTION = {
  module: 'TrailGuard',
  icon: '🥾',
  inputs: [
    { label: 'Trail', value: 'Helvellyn via Striding Edge' },
    { label: 'Distance', value: '14 km' },
    { label: 'Elevation Gain', value: '1,020 m' },
    { label: 'Surface', value: 'Rocky terrain' },
    { label: 'Season', value: 'Autumn (Sep–Nov)' },
    { label: 'Recent Rainfall', value: 'Moderate (5–25mm)' },
  ],
  result: {
    verdict: 'Strenuous Route',
    score: 62,
    recommendation: 'Proceed with caution — wet rocks increase slip risk significantly. Start before 08:00.',
    factors: [
      { label: 'Terrain', text: 'Rocky — high grip demand', impact: 'negative' },
      { label: 'Rainfall', text: 'Moderate recent rain', impact: 'negative' },
      { label: 'Season', text: 'Autumn — shortening daylight', impact: 'neutral' },
    ],
  },
}

export default function HomePage({ navigateTo }) {
  return (
    <div className="home-page">
      <Hero navigateTo={navigateTo} />

      {/* How it works */}
      <section className="section how-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">How It Works</span>
            <h2 className="section-title">From plan to prediction in seconds</h2>
            <p className="section-subtitle">
              FieldCast AI combines environmental context, personal data, and activity knowledge to surface the insights that matter.
            </p>
          </div>
          <div className="how-steps">
            {HOW_IT_WORKS_STEPS.map((step, i) => (
              <div key={i} className="how-step glass-card">
                <div className="how-step-number">{i + 1}</div>
                <div className="how-step-icon">{step.icon}</div>
                <h3 className="how-step-title">{step.title}</h3>
                <p className="how-step-text">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example prediction */}
      <section className="section example-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Live Example</span>
            <h2 className="section-title">See how a prediction looks</h2>
            <p className="section-subtitle">
              Real environmental context → structured outdoor intelligence.
              <span className="badge badge-demo" style={{ marginLeft: '0.5rem' }}>Demonstration Data</span>
            </p>
          </div>
          <div className="example-card glass-card">
            <div className="example-left">
              <div className="example-module-header">
                <span className="example-icon">{EXAMPLE_PREDICTION.icon}</span>
                <div>
                  <div className="example-module-name">{EXAMPLE_PREDICTION.module}</div>
                  <div className="example-module-sub">Route Intelligence</div>
                </div>
              </div>
              <div className="example-inputs">
                {EXAMPLE_PREDICTION.inputs.map((inp, i) => (
                  <div key={i} className="example-input-row">
                    <span className="example-input-label">{inp.label}</span>
                    <span className="example-input-value">{inp.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="example-divider" />
            <div className="example-right">
              <div className="example-verdict-area">
                <div className="example-score-circle">
                  <span className="example-score-num">{EXAMPLE_PREDICTION.result.score}</span>
                  <span className="example-score-label">/ 100</span>
                </div>
                <div>
                  <div className="example-verdict">{EXAMPLE_PREDICTION.result.verdict}</div>
                  <div className="example-verdict-sub">Route Difficulty Index</div>
                </div>
              </div>
              <div className="example-factors">
                {EXAMPLE_PREDICTION.result.factors.map((f, i) => (
                  <div key={i} className={`example-factor example-factor--${f.impact}`}>
                    <span className="example-factor-label">{f.label}</span>
                    <span className="example-factor-text">{f.text}</span>
                  </div>
                ))}
              </div>
              <div className="example-recommendation">
                <span className="example-rec-icon">💡</span>
                <span>{EXAMPLE_PREDICTION.result.recommendation}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All modules */}
      <section className="section modules-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">10 Intelligence Modules</span>
            <h2 className="section-title">Every outdoor activity. One platform.</h2>
            <p className="section-subtitle">
              Specialised prediction tools designed for the real conditions you face outside.
            </p>
          </div>
          <div className="modules-grid">
            {MODULES.map(module => (
              <ModuleCard
                key={module.id}
                module={module}
                onClick={(id) => navigateTo('module', id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-card glass-card">
            <div className="cta-glow" />
            <div className="cta-content">
              <h2 className="cta-title">Know Before You Go.</h2>
              <p className="cta-subtitle">Experience More Outside.</p>
              <p className="cta-text">
                Join the Hacktoberfest Open-Source AI Challenge — Touch Grass 2024.
                FieldCast AI is open-source and designed for real-world outdoor intelligence.
              </p>
              <div className="cta-actions">
                <button
                  className="btn btn-hero"
                  onClick={() => navigateTo('module', 'trailguard')}
                >
                  🥾 Start With TrailGuard
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigateTo('module', 'planshield')}
                >
                  🛡️ Plan My Trip
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              <span>🏔️ FieldCast AI</span>
              <span className="footer-tagline">Know Before You Go. Experience More Outside.</span>
            </div>
            <div className="footer-note">
              All predictions are demonstration estimates. Always check official weather and safety sources before outdoor activities.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
