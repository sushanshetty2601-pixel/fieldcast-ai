import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import './SunsetMap.css'

// Fix for default Leaflet icon in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for selected spot
const selectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map bounds and centering
function MapController({ spots, selectedSpotId }) {
  const map = useMap();

  useEffect(() => {
    if (spots.length > 0) {
      if (selectedSpotId) {
        const selectedSpot = spots.find(s => s.id === selectedSpotId);
        if (selectedSpot) {
          map.flyTo([selectedSpot.lat, selectedSpot.lon], 14, { duration: 1 });
        }
      } else {
        const bounds = L.latLngBounds(spots.map(s => [s.lat, s.lon]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [spots, selectedSpotId, map]);

  return null;
}

export default function SunsetMap({ center, spots, selectedSpotId, onMarkerClick }) {
  return (
    <div className="sunset-map-container">
      <MapContainer 
        center={[center.lat, center.lon]} 
        zoom={12} 
        scrollWheelZoom={true}
        className="sunset-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController spots={spots} selectedSpotId={selectedSpotId} />
        
        {spots.map((spot) => (
          <Marker 
            key={spot.id} 
            position={[spot.lat, spot.lon]}
            icon={selectedSpotId === spot.id ? selectedIcon : new L.Icon.Default()}
            eventHandlers={{
              click: () => onMarkerClick(spot.id),
            }}
          >
            <Popup>
              <div className="map-popup">
                <strong>{spot.name}</strong>
                <p>{spot.category}</p>
                <button className="btn btn-sm btn-primary" onClick={() => onMarkerClick(spot.id)}>View Details</button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
