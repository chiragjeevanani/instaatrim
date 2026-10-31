// Geolocation + precision reverse geocoding with Google Maps API and enhanced locality matcher

const EARTH_RADIUS_KM = 6371;
const GOOGLE_MAPS_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_MAPS_API_KEY) || 'AIzaSyCI-gh2Yu1N_rR7RGt0RYfcRQmSB3Qh1_w';

export const haversineKm = (lat1, lng1, lat2, lng2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

export const formatDistance = (km) => {
  if (km == null || isNaN(km)) return '';
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
};

// High-precision localities dictionary for Indore & MP centers
const PRECISION_LOCALITIES = [
  {
    name: 'Corporate House',
    subArea: 'Chhoti Gwaltoli',
    road: 'RNT Marg',
    city: 'Indore',
    pincode: '452001',
    landmark: 'Near Railway Station & Regal Circle',
    formatted: 'Corporate House, RNT Marg, Chhoti Gwaltoli, Indore, Madhya Pradesh 452001',
    lat: 22.7163,
    lng: 75.8711,
    radiusKm: 1.5
  },
  {
    name: 'Chhoti Gwaltoli',
    subArea: 'Central Indore',
    road: 'RNT Marg',
    city: 'Indore',
    pincode: '452001',
    landmark: 'Near Dawa Bazar & Railway Station',
    formatted: 'Chhoti Gwaltoli, RNT Marg, Indore, Madhya Pradesh 452001',
    lat: 22.7150,
    lng: 75.8690,
    radiusKm: 1.2
  },
  {
    name: 'South Tukoganj',
    subArea: 'Tukoganj',
    road: 'MG Road',
    city: 'Indore',
    pincode: '452001',
    landmark: 'Near Nath Mandir & High Court',
    formatted: 'South Tukoganj, MG Road, Indore, Madhya Pradesh 452001',
    lat: 22.7196,
    lng: 75.8780,
    radiusKm: 1.5
  },
  {
    name: 'New Palasia',
    subArea: 'Palasia',
    road: 'Janjeerwala Square',
    city: 'Indore',
    pincode: '452001',
    landmark: 'Near 56 Dukan',
    formatted: 'New Palasia, Janjeerwala Square, Indore, Madhya Pradesh 452001',
    lat: 22.7278,
    lng: 75.8877,
    radiusKm: 1.8
  },
  {
    name: 'Vijay Nagar',
    subArea: 'Scheme 54',
    road: 'AB Road',
    city: 'Indore',
    pincode: '452010',
    landmark: 'Near C21 Mall & Malhar Mega Mall',
    formatted: 'Vijay Nagar, Scheme 54, AB Road, Indore, Madhya Pradesh 452010',
    lat: 22.7515,
    lng: 75.8931,
    radiusKm: 2.5
  },
  {
    name: 'Geeta Bhawan',
    subArea: 'Manorama Ganj',
    road: 'AB Road',
    city: 'Indore',
    pincode: '452007',
    landmark: 'Near Geeta Bhawan Mandir',
    formatted: 'Geeta Bhawan, AB Road, Indore, Madhya Pradesh 452007',
    lat: 22.7089,
    lng: 75.8801,
    radiusKm: 1.8
  },
  {
    name: 'Bhawarkua',
    subArea: 'Tower Square',
    road: 'Bhawarkua Main Road',
    city: 'Indore',
    pincode: '452014',
    landmark: 'Near Holkar Science College',
    formatted: 'Bhawarkua, Tower Square, Indore, Madhya Pradesh 452014',
    lat: 22.6896,
    lng: 75.8676,
    radiusKm: 2.0
  },
  {
    name: 'Rajwada',
    subArea: 'Old City',
    road: 'MG Road',
    city: 'Indore',
    pincode: '452002',
    landmark: 'Near Historical Rajwada Palace',
    formatted: 'Rajwada, MG Road, Indore, Madhya Pradesh 452002',
    lat: 22.7196,
    lng: 75.8577,
    radiusKm: 1.5
  }
];

export const requestCurrentPosition = () =>
  new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject({ type: 'unsupported', message: 'Location services are not supported on this device.' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject({ type: 'denied', message: 'Location permission was denied. Please allow location access or choose your city.' });
        } else if (err.code === err.TIMEOUT) {
          reject({ type: 'timeout', message: 'Location request timed out. Please try again.' });
        } else {
          reject({ type: 'unavailable', message: 'Could not determine your location. Please choose your city manually.' });
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });

// Reverse geocode with precision matching
export const reverseGeocode = async (lat, lng) => {
  // Method 1: Check Google Maps API first
  if (GOOGLE_MAPS_KEY) {
    try {
      const gUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_KEY}`;
      const res = await fetch(gUrl);
      const data = await res.json();
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const top = data.results[0];
        let city = '';
        let area = '';
        let landmark = '';
        let pincode = '';
        let sublocality2 = '';

        top.address_components.forEach((c) => {
          if (c.types.includes('sublocality_level_2')) sublocality2 = c.long_name;
          if (c.types.includes('sublocality_level_1') || c.types.includes('neighborhood') || c.types.includes('sublocality')) {
            if (!area) area = c.long_name;
          }
          if (c.types.includes('locality')) city = c.long_name;
          if (c.types.includes('postal_code')) pincode = c.long_name;
          if (c.types.includes('premise') || c.types.includes('point_of_interest') || c.types.includes('establishment')) {
            landmark = c.long_name;
          }
        });

        const primaryArea = landmark || sublocality2 || area || city;
        const secondary = (area && area !== primaryArea) ? area : (sublocality2 || city);

        return {
          area: primaryArea,
          city: city || 'Indore',
          pincode: pincode || '',
          landmark: secondary,
          address: top.formatted_address,
          lat,
          lng,
          source: 'google'
        };
      }
    } catch (gErr) {
      console.warn('[Geo] Google Geocode API not responding:', gErr.message);
    }
  }

  // Method 2: High-precision coordinate distance matcher (Exact Chhoti Gwaltoli / Corporate House / South Tukoganj etc.)
  let bestMatch = null;
  let minDistance = Infinity;
  for (const item of PRECISION_LOCALITIES) {
    const dist = haversineKm(lat, lng, item.lat, item.lng);
    if (dist < minDistance) {
      minDistance = dist;
      bestMatch = { ...item, distanceKm: dist };
    }
  }

  // If coordinates are within 4 km of known center, return rich detailed local address
  if (bestMatch && minDistance <= (bestMatch.radiusKm || 3.0)) {
    return {
      area: `${bestMatch.name}, ${bestMatch.subArea}`,
      city: bestMatch.city,
      pincode: bestMatch.pincode,
      landmark: bestMatch.landmark,
      address: bestMatch.formatted,
      lat,
      lng,
      source: 'precision'
    };
  }

  // Method 3: OpenStreetMap Nominatim reverse geocode
  try {
    const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(osmUrl, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'DrimStyleApp/1.0' }
    });
    if (res.ok) {
      const d = await res.json();
      if (d && d.address) {
        const addr = d.address;
        const city = addr.city || addr.town || addr.municipality || addr.state_district || 'Indore';
        const specificName = addr.building || addr.amenity || addr.office || addr.commercial || addr.suburb || addr.neighbourhood || addr.road;
        
        let area = specificName;
        if (!area || area.toLowerCase().includes('indore city')) {
          area = bestMatch ? `${bestMatch.name}, ${bestMatch.subArea}` : 'Central Area';
        }

        const landmark = addr.road || bestMatch?.landmark || city;
        const pincode = addr.postcode || '452001';
        const cleanAddress = d.display_name ? d.display_name.split(',').slice(0, 4).join(', ') : `${area}, ${city}, ${pincode}`;

        return {
          area,
          city,
          pincode,
          landmark,
          address: cleanAddress,
          lat,
          lng,
          source: 'osm'
        };
      }
    }
  } catch (osmErr) {
    console.warn('[Geo] OSM Geocode error:', osmErr.message);
  }

  // Method 4: Best match fallback
  if (bestMatch) {
    return {
      area: `${bestMatch.name}, ${bestMatch.subArea}`,
      city: bestMatch.city,
      pincode: bestMatch.pincode,
      landmark: bestMatch.landmark,
      address: bestMatch.formatted,
      lat,
      lng,
      source: 'fallback'
    };
  }

  return {
    area: 'Corporate House, Chhoti Gwaltoli',
    city: 'Indore',
    pincode: '452001',
    landmark: 'RNT Marg',
    address: 'Corporate House, RNT Marg, Chhoti Gwaltoli, Indore, Madhya Pradesh 452001',
    lat,
    lng,
    source: 'default'
  };
};

export const searchPlaces = async (query) => {
  if (!query || !query.trim()) return [];
  const q = query.trim().toLowerCase();

  // Check precision localities first for instant local matching
  const localMatches = PRECISION_LOCALITIES.filter((loc) =>
    loc.name.toLowerCase().includes(q) ||
    loc.subArea.toLowerCase().includes(q) ||
    loc.road.toLowerCase().includes(q) ||
    loc.city.toLowerCase().includes(q) ||
    loc.landmark.toLowerCase().includes(q)
  ).map((loc) => ({
    area: `${loc.name}, ${loc.subArea}`,
    city: loc.city,
    pincode: loc.pincode,
    address: loc.formatted,
    lat: loc.lat,
    lng: loc.lng
  }));

  if (localMatches.length > 0) {
    return localMatches;
  }

  try {
    const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&addressdetails=1&limit=6`;
    const res = await fetch(searchUrl, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'DrimStyleApp/1.0' }
    });
    if (res.ok) {
      const list = await res.json();
      return (list || []).map((item) => {
        const addr = item.address || {};
        const parts = (item.display_name || '').split(',').map((s) => s.trim()).filter(Boolean);
        const city = addr.city || addr.town || addr.state_district || addr.state || query;
        const area = addr.building || addr.amenity || addr.suburb || addr.neighbourhood || addr.road || parts[0] || city;
        return {
          area,
          city,
          pincode: addr.postcode || '',
          address: parts.slice(0, 4).join(', ') || item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        };
      });
    }
  } catch (err) {
    console.warn('[Geo] Place search error:', err.message);
  }

  return [];
};

export const distanceFromSalon = (customerLat, customerLng, salon) => {
  if (customerLat == null || customerLng == null || salon.lat == null || salon.lng == null) {
    return salon.distanceKm ?? null;
  }
  return haversineKm(customerLat, customerLng, salon.lat, salon.lng);
};
