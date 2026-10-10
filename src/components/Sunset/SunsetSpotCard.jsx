import './SunsetSpotCard.css'

export default function SunsetSpotCard({ spot, isSelected, onClick, onMapClick }) {
  const images = [
    '/images/sunset/media_1791623252839_b46b7b8c.jpg',
    '/images/sunset/media_1791623252853_049c5949.jpg',
    '/images/sunset/media_1791623252886_69b9fa1c.jpg',
    '/images/sunset/media_1791623252915_bce8471c.jpg',
    '/images/sunset/media_1791623252919_75543e50.jpg'
  ];
  // Simple hash of id to pick consistent image
  const imgIndex = (spot.id?.toString().charCodeAt(0) || 0) % images.length;
  const imageUrl = images[imgIndex];

  return (
    <div 
      className={`sunset-card glass-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="sunset-card-image" style={{ backgroundImage: `url(${imageUrl})` }}>
        <div className="sunset-card-category badge badge-info">{spot.category}</div>
      </div>
      <div className="sunset-card-content">
        <h3 className="sunset-card-title">{spot.name}</h3>
        <p className="sunset-card-desc">{spot.description}</p>
        
        <div className="sunset-card-meta">
          <span className="meta-item">📍 {spot.distance.toFixed(1)} km away</span>
          <span className="meta-item">🌅 Great visibility</span>
        </div>

        <div className="sunset-card-actions">
          <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); onClick(); }}>
            View Details
          </button>
          <button className="btn btn-sm btn-secondary" onClick={(e) => { e.stopPropagation(); onMapClick(); }}>
            Show on Map
          </button>
        </div>
      </div>
    </div>
  )
}
