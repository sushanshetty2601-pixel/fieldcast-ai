import { useState } from 'react'

export default function LocationSearch({ onSearch, onUseMyLocation, isSearching, error }) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  }

  return (
    <div className="location-search-container" style={{ margin: 'var(--space-6) 0' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          className="form-input" 
          placeholder="Enter a city, state, country..." 
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ flexGrow: 1, minWidth: '250px' }}
        />
        <button type="submit" className="btn btn-primary" disabled={isSearching}>
          {isSearching ? 'Searching...' : 'Search'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onUseMyLocation} disabled={isSearching}>
          📍 Use My Location
        </button>
      </form>
      {error && (
        <div style={{ color: 'var(--red-400)', marginTop: 'var(--space-2)', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}
    </div>
  )
}
