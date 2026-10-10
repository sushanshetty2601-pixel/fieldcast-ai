import { useState, useEffect } from 'react'
import { getCoordinates, getSunsetSpots, getDemoSunsetSpots } from '../../utils/sunsetApi.js'
import LocationSearch from '../../components/Sunset/LocationSearch.jsx'
import SunsetFilters from '../../components/Sunset/SunsetFilters.jsx'
import SunsetSpotCard from '../../components/Sunset/SunsetSpotCard.jsx'
import SunsetMap from '../../components/Sunset/SunsetMap.jsx'
import SunsetSpotDetails from '../../components/Sunset/SunsetSpotDetails.jsx'
import SunsetTripPlanner from '../../components/Sunset/SunsetTripPlanner.jsx'
import * as SunCalc from 'suncalc'
import './SunsetExplorerPage.css'

export default function SunsetExplorerPage({ navigateTo }) {
  const [locationInfo, setLocationInfo] = useState({ name: 'Bengaluru, India', lat: 12.9716, lon: 77.5946 });
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [spots, setSpots] = useState([]);
  const [isUsingDemo, setIsUsingDemo] = useState(false);
  const [sunsetTime, setSunsetTime] = useState(null);

  const [filter, setFilter] = useState('All Spots');
  const [sort, setSort] = useState('Recommended');

  const [selectedSpotId, setSelectedSpotId] = useState(null);
  const [viewState, setViewState] = useState('explore'); // 'explore', 'details', 'plan'

  useEffect(() => {
    fetchSpots(locationInfo.lat, locationInfo.lon, locationInfo.name);
  }, []);

  const fetchSpots = async (lat, lon, name) => {
    setIsSearching(true);
    setError(null);
    try {
      // Get real spots
      let realSpots = await getSunsetSpots(lat, lon);
      if (realSpots && realSpots.length > 0) {
        setSpots(realSpots);
        setIsUsingDemo(false);
      } else {
        // Fallback to demo
        setSpots(getDemoSunsetSpots(lat, lon));
        setIsUsingDemo(true);
      }
      setLocationInfo({ name, lat, lon });
      
      // Calculate real sunset time using SunCalc
      const times = SunCalc.getTimes(new Date(), lat, lon);
      setSunsetTime(times.sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      
    } catch (err) {
      setError('Failed to load places. Using demonstration data.');
      setSpots(getDemoSunsetSpots(lat, lon));
      setIsUsingDemo(true);
    } finally {
      setIsSearching(false);
      setViewState('explore');
      setSelectedSpotId(null);
    }
  };

  const handleSearch = async (query) => {
    setIsSearching(true);
    setError(null);
    const coords = await getCoordinates(query);
    if (coords) {
      fetchSpots(coords.lat, coords.lon, coords.name);
    } else {
      setError(`Could not find location: "${query}"`);
      setIsSearching(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setIsSearching(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchSpots(position.coords.latitude, position.coords.longitude, "Your Location");
      },
      (err) => {
        setError("Unable to retrieve your location. " + err.message);
        setIsSearching(false);
      }
    );
  };

  // Filter and Sort
  const filteredSpots = spots.filter(s => {
    if (filter === 'All Spots') return true;
    if (filter === 'Hilltops' && s.category === 'Hilltop') return true;
    if (filter === 'City Views' && s.category === 'City View') return true;
    if (filter === 'Quiet Places' || filter === 'Popular Viewpoints') return true; // Just show all for these in demo/basic mode since we don't have this specific data
    return s.category === filter.slice(0, -1) || s.category === filter; // e.g., 'Beaches' -> 'Beach'
  }).sort((a, b) => {
    if (sort === 'Nearest') return a.distance - b.distance;
    // For Demo, just return original order for 'Recommended'
    return 0; 
  });

  const selectedSpot = spots.find(s => s.id === selectedSpotId);

  const renderContent = () => {
    if (viewState === 'details' && selectedSpot) {
      return (
        <SunsetSpotDetails 
          spot={selectedSpot} 
          locationInfo={locationInfo} 
          onBack={() => setViewState('explore')} 
          onShowOnMap={() => setViewState('explore')}
          onPlanTrip={() => setViewState('plan')}
        />
      )
    }

    if (viewState === 'plan' && selectedSpot) {
      return (
        <SunsetTripPlanner 
          spot={selectedSpot} 
          locationInfo={locationInfo}
          onCancel={() => setViewState('details')}
          onSave={(plan) => {
            alert("Trip saved! Your destination is waiting. Close the app and enjoy the sunset.");
            setViewState('explore');
          }}
        />
      )
    }

    return (
      <div className="sunset-layout">
        <div className="sunset-left">
          <SunsetFilters 
            currentFilter={filter} 
            onFilterChange={setFilter} 
            currentSort={sort} 
            onSortChange={setSort} 
          />
          
          <div className="sunset-cards-grid">
            {filteredSpots.length > 0 ? filteredSpots.map(spot => (
              <SunsetSpotCard 
                key={spot.id} 
                spot={spot} 
                isSelected={selectedSpotId === spot.id}
                onClick={() => setSelectedSpotId(spot.id)}
                onMapClick={() => setSelectedSpotId(spot.id)}
              />
            )) : (
              <div className="glass-card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No spots found for this category.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="sunset-right">
          <div className="sunset-map-wrapper glass-card">
            <SunsetMap 
              center={locationInfo} 
              spots={filteredSpots} 
              selectedSpotId={selectedSpotId}
              onMarkerClick={(id) => {
                setSelectedSpotId(id);
                setViewState('details');
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="sunset-page">
      {/* Hero Section */}
      <div className="sunset-hero">
        <div className="sunset-hero-bg" />
        <div className="container sunset-hero-content">
          <button className="module-back-btn" onClick={() => navigateTo('home')}>
            ← Back to Home
          </button>
          
          <LocationSearch 
            onSearch={handleSearch} 
            onUseMyLocation={handleUseMyLocation} 
            isSearching={isSearching}
            error={error}
          />

          <div className="sunset-hero-main mt-4">
            <h1 className="sunset-hero-title">Find Your Golden Hour</h1>
            <p className="sunset-hero-subtitle">
              Explore scenic viewpoints, waterfronts, hilltops and peaceful places to watch the sun go down.
            </p>
          </div>

          <div className="sunset-meta glass-card">
            <div className="meta-item">
              <span className="meta-label">Destination</span>
              <span className="meta-value">{locationInfo.name}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Sunset Today</span>
              <span className="meta-value">{sunsetTime || 'Calculating...'}</span>
            </div>
            {isUsingDemo && (
              <div className="meta-item demo-badge-wrap">
                 <span className="badge badge-demo">Demonstration Data</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container sunset-body">
        <div className="section-header" style={{ alignItems: 'flex-start', textAlign: 'left', marginBottom: 'var(--space-6)' }}>
          <h2 className="section-title">Top Sunset Spots</h2>
          <p className="section-subtitle" style={{ textAlign: 'left' }}>Places worth visiting for the view.</p>
        </div>
        
        {renderContent()}
      </div>
    </div>
  )
}
