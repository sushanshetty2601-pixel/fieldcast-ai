export const getCoordinates = async (query) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        name: data[0].display_name.split(',')[0],
        fullName: data[0].display_name
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

export const getSunsetSpots = async (lat, lon, radius = 10000) => {
  // Query for viewpoints, parks, beaches, lakes
  const overpassQuery = `
    [out:json][timeout:25];
    (
      node["tourism"="viewpoint"](around:${radius},${lat},${lon});
      way["tourism"="viewpoint"](around:${radius},${lat},${lon});
      node["leisure"="park"](around:${radius},${lat},${lon});
      way["leisure"="park"](around:${radius},${lat},${lon});
      node["natural"="beach"](around:${radius},${lat},${lon});
      way["natural"="beach"](around:${radius},${lat},${lon});
      node["natural"="water"](around:${radius},${lat},${lon});
      way["natural"="water"](around:${radius},${lat},${lon});
    );
    out center;
  `;

  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: overpassQuery
    });
    const data = await res.json();
    
    return data.elements
      .filter(el => el.tags && (el.tags.name || el.tags["name:en"]))
      .map(el => {
        const category = el.tags.tourism === 'viewpoint' ? 'Viewpoint' :
                         el.tags.natural === 'beach' ? 'Beach' :
                         el.tags.natural === 'water' ? 'Lake' :
                         el.tags.leisure === 'park' ? 'Park' : 'Spot';
        
        return {
          id: el.id,
          name: el.tags.name || el.tags["name:en"],
          lat: el.lat || el.center.lat,
          lon: el.lon || el.center.lon,
          category,
          description: el.tags.description || `A scenic ${category.toLowerCase()} perfect for golden hour.`,
          distance: calculateDistance(lat, lon, el.lat || el.center.lat, el.lon || el.center.lon)
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 15); // limit to 15 spots
  } catch (error) {
    console.error("Overpass error:", error);
    return null;
  }
};

// Helper: Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export const getDemoSunsetSpots = (lat, lon) => {
  return [
    {
      id: "demo1",
      name: "Golden Peak Viewpoint",
      category: "Hilltop",
      description: "A stunning elevated view facing west, offering uninterrupted views of the setting sun over the horizon.",
      lat: lat + 0.01,
      lon: lon - 0.02,
      distance: 2.5
    },
    {
      id: "demo2",
      name: "Serenity Lake Park",
      category: "Lake",
      description: "Quiet lakeside park where the sunset reflects beautifully on the calm waters.",
      lat: lat - 0.015,
      lon: lon - 0.01,
      distance: 1.8
    },
    {
      id: "demo3",
      name: "Sunset Beach",
      category: "Beach",
      description: "Popular local beach offering wide open skies and ocean views for the perfect golden hour.",
      lat: lat + 0.02,
      lon: lon + 0.02,
      distance: 3.1
    },
    {
      id: "demo4",
      name: "City Skyline Terrace",
      category: "City View",
      description: "An urban viewpoint where the setting sun creates striking silhouettes of the city buildings.",
      lat: lat - 0.005,
      lon: lon + 0.015,
      distance: 1.2
    }
  ];
};
