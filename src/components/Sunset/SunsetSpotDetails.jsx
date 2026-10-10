import { useApp } from '../../context/AppContext.jsx'
import './SunsetSpotDetails.css'

export default function SunsetSpotDetails({ spot, locationInfo, onBack, onShowOnMap, onPlanTrip }) {
  const { saveActivity } = useApp();

  const images = [
    '/images/sunset/media_1791623252839_b46b7b8c.jpg',
    '/images/sunset/media_1791623252853_049c5949.jpg',
    '/images/sunset/media_1791623252886_69b9fa1c.jpg',
    '/images/sunset/media_1791623252915_bce8471c.jpg',
    '/images/sunset/media_1791623252919_75543e50.jpg'
  ];
  const imgIndex = (spot.id?.toString().charCodeAt(0) || 0) % images.length;
  const imageUrl = images[imgIndex];

  const handleSaveSpot = () => {
    saveActivity({
      moduleId: 'suncast',
      moduleName: 'SunCast',
      headline: `Saved Spot: ${spot.name}`,
      score: 100, // Dummy score
      formData: { spot, locationInfo },
      result: { recommendation: 'Saved from Sunset Explorer' }
    });
    alert('Spot saved to History!');
  };

  return (
    <div className="sunset-details">
      <button className="btn btn-ghost details-back-btn" onClick={onBack}>
        ← Back to Sunset Spots
      </button>

      <div className="details-hero glass-card" style={{ backgroundImage: `url(${imageUrl})` }}>
        <div className="details-hero-overlay">
          <div className="badge badge-info mb-2">{spot.category}</div>
          <h1 className="details-title">{spot.name}</h1>
          <p className="details-location">📍 {locationInfo.name} • {spot.distance.toFixed(1)} km away</p>
        </div>
      </div>

      <div className="details-grid">
        <div className="details-main glass-card">
          <h2 className="details-section-title">About this viewpoint</h2>
          <p className="details-desc">{spot.description}</p>
          
          <h3 className="details-subtitle">Why watch the sunset here?</h3>
          <p className="details-desc">
            This {spot.category.toLowerCase()} offers an excellent vantage point facing the western horizon. 
            The elevation and lack of obstructions make it ideal for golden hour photography and peaceful evening viewing.
          </p>

          <h3 className="details-subtitle">Amenities & Access</h3>
          <ul className="details-list">
            <li>✓ Public access</li>
            <li>✓ Open 24 hours</li>
            <li>ℹ️ Exact facilities vary by location</li>
          </ul>
        </div>

        <div className="details-sidebar">
          <div className="glass-card sidebar-widget">
            <h3 className="details-subtitle">AI Sunset Insights</h3>
            <div className="ai-insight">
              <span className="insight-icon">🔮</span>
              <p>
                <strong>High Visibility Predicted:</strong> Based on the elevation and viewpoint orientation, 
                this spot is likely to offer an unobstructed view of the horizon. 
              </p>
            </div>
            <div className="insight-note">
              <span className="badge badge-demo">Demo AI Analysis</span>
            </div>
          </div>

          <div className="glass-card sidebar-widget action-widget">
            <h3 className="details-subtitle">Location Info</h3>
            <p><strong>Coordinates:</strong> {spot.lat.toFixed(4)}, {spot.lon.toFixed(4)}</p>
            <div className="details-actions">
              <button className="btn btn-secondary w-full" onClick={onShowOnMap}>
                🗺️ Show on Map
              </button>
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lon}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary w-full"
              >
                🧭 Get Directions
              </a>
              <button className="btn btn-secondary w-full" onClick={handleSaveSpot}>
                ⭐ Save Spot
              </button>
              <button className="btn btn-hero w-full mt-2" onClick={onPlanTrip}>
                Plan My Sunset Trip
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
