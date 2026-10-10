import { useState } from 'react'
import './ActivityForm.css'

function Field({ field, value, onChange }) {
  const handleChange = (e) => onChange(field.id, e.target.value)

  if (field.type === 'select') {
    return (
      <div className="form-group">
        <label className="form-label" htmlFor={field.id}>{field.label}</label>
        <select
          id={field.id}
          className="form-select"
          value={value || ''}
          onChange={handleChange}
        >
          <option value="">Select…</option>
          {field.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    )
  }

  if (field.type === 'textarea') {
    return (
      <div className="form-group">
        <label className="form-label" htmlFor={field.id}>{field.label}</label>
        <textarea
          id={field.id}
          className="form-textarea"
          placeholder={field.placeholder}
          value={value || ''}
          onChange={handleChange}
        />
      </div>
    )
  }

  return (
    <div className="form-group">
      <label className="form-label" htmlFor={field.id}>{field.label}</label>
      <input
        id={field.id}
        type={field.type}
        className="form-input"
        placeholder={field.placeholder}
        value={value || ''}
        onChange={handleChange}
        min={field.min}
        max={field.max}
        step={field.step}
      />
    </div>
  )
}

export default function ActivityForm({ module, onSubmit }) {
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    // Simulate async prediction latency
    await new Promise(r => setTimeout(r, 600))
    try {
      onSubmit(formData)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Split fields into halves for 2-column layout
  const fields = module.fields || []
  const half = Math.ceil(fields.length / 2)
  const col1 = fields.slice(0, half)
  const col2 = fields.slice(half)

  return (
    <form className="activity-form" onSubmit={handleSubmit} noValidate>
      <div className="activity-form-fields">
        <div className="form-column">
          {col1.map(field => (
            <Field key={field.id} field={field} value={formData[field.id]} onChange={handleChange} />
          ))}
        </div>
        <div className="form-column">
          {col2.map(field => (
            <Field key={field.id} field={field} value={formData[field.id]} onChange={handleChange} />
          ))}
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="activity-form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <>
              <span className="form-spinner" />
              Analysing…
            </>
          ) : (
            <>🔮 Generate Prediction</>
          )}
        </button>
        <p className="form-disclaimer">
          Results are demonstration estimates. See prediction for details.
        </p>
      </div>
    </form>
  )
}
