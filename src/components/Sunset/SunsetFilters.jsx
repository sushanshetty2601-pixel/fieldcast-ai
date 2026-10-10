const FILTERS = [
  'All Spots', 'Hilltops', 'Beaches', 'Lakes', 'Parks', 'City Views', 'Quiet Places', 'Popular Viewpoints'
];

const SORTS = [
  'Recommended', 'Nearest', 'Scenic Views'
];

export default function SunsetFilters({ currentFilter, onFilterChange, currentSort, onSortChange }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
        {FILTERS.map(filter => (
          <button 
            key={filter}
            className={`btn btn-sm ${currentFilter === filter ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => onFilterChange(filter)}
            style={{ 
              borderRadius: '20px', 
              border: currentFilter === filter ? 'none' : '1px solid var(--border-subtle)',
              background: currentFilter === filter ? 'var(--orange-500)' : 'transparent',
              color: currentFilter === filter ? '#fff' : 'var(--text-secondary)'
            }}
          >
            {filter}
          </button>
        ))}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Sort by:</span>
        <select 
          className="form-select" 
          style={{ padding: '0.25rem 2rem 0.25rem 0.75rem', minHeight: 'auto', height: '32px', fontSize: '0.875rem' }}
          value={currentSort}
          onChange={e => onSortChange(e.target.value)}
        >
          {SORTS.map(sort => (
            <option key={sort} value={sort}>{sort}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
