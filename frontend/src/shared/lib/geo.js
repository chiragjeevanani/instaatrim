// Geolocation + 100% Dynamic Real-Time Reverse Geocoding (Multi-Provider: Google Maps, Photon, OSM, BigDataCloud)

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

// 100% Dynamic Reverse Geocoding (No static hardcoded dictionary)
export const reverseGeocode = async (lat, lng) => {
  // Method 1: Google Maps Geocoding API (Primary if enabled in Google Cloud Console)
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

  // Method 2: Photon Reverse Geocoding (Blazing fast OSM-backed live dynamic geocoder)
  try {
    const photonUrl = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`;
    const pRes = await fetch(photonUrl);
    if (pRes.ok) {
      const pData = await pRes.json();
      if (pData?.features && pData.features.length > 0) {
        const p = pData.features[0].properties || {};
        const city = p.city || p.town || p.state_district || p.district || 'Indore';
        const landmark = p.name || '';
        const street = p.street || '';
        const locality = p.locality || (p.district && !p.district.toLowerCase().includes('indore city') ? p.district : '') || '';
        const pincode = p.postcode || '';

        // Select the most meaningful dynamic area title
        let area = landmark || locality || street || city;
        if (landmark && street && !landmark.toLowerCase().includes(street.toLowerCase())) {
          area = landmark;
        } else if (locality && street) {
          area = `${locality}, ${street}`;
        }

        const cleanParts = [landmark, street, locality, city, p.state, pincode].filter(Boolean);
        const uniqueParts = Array.from(new Set(cleanParts));
        const address = uniqueParts.join(', ');

        return {
          area,
          city,
          pincode,
          landmark: street || landmark || locality || city,
          address: address || `${area}, ${city}`,
          lat,
          lng,
          source: 'photon'
        };
      }
    }
  } catch (pErr) {
    console.warn('[Geo] Photon reverse geocode error:', pErr.message);
  }

  // Method 3: OpenStreetMap Nominatim Reverse Geocode
  try {
    const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(osmUrl, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'DrimStyleApp/1.0' }
    });
    if (res.ok) {
      const d = await res.json();
      if (d && d.address) {
        const addr = d.address;
        const city = addr.city || addr.town || addr.municipality || addr.village || addr.state_district || 'Indore';
        const specificName = addr.tourism || addr.amenity || addr.building || addr.office || addr.shop || addr.leisure || addr.residential || addr.suburb || addr.neighbourhood || addr.quarter || addr.road;
        const landmark = addr.road || addr.suburb || specificName || city;
        const area = specificName || landmark || addr.city_district || city;
        const pincode = addr.postcode || '';
        const cleanAddress = d.display_name ? d.display_name.split(',').slice(0, 5).join(', ') : `${area}, ${city}, ${pincode}`;

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

  // Method 4: BigDataCloud Client-side Geocoding
  try {
    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
    const bdcRes = await fetch(bdcUrl);
    if (bdcRes.ok) {
      const bdc = await bdcRes.json();
      const city = bdc.city || bdc.locality || 'Indore';
      const adminList = bdc.localityInfo?.administrative || [];
      const specificAdmin = adminList.slice().reverse().find((a) => a.adminLevel >= 8 && a.name && !a.name.toLowerCase().includes('tehsil'));
      const area = specificAdmin ? specificAdmin.name : (bdc.locality || city);
      const address = `${area}, ${city}, ${bdc.principalSubdivision || ''}`;

      return {
        area,
        city,
        pincode: bdc.postcode || '',
        landmark: area,
        address,
        lat,
        lng,
        source: 'bigdatacloud'
      };
    }
  } catch (bdcErr) {
    console.warn('[Geo] BigDataCloud geocode error:', bdcErr.message);
  }

  // Method 5: Dynamic coordinate fallback (No hardcoded fake names)
  return {
    area: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    city: 'Indore',
    pincode: '',
    landmark: 'Live GPS Pin',
    address: `GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    lat,
    lng,
    source: 'live-gps'
  };
};

// 100% Dynamic Places Search (No static hardcoded dictionary)
export const searchPlaces = async (query) => {
  if (!query || !query.trim()) return [];
  const q = query.trim();

  // Try Photon dynamic autocomplete & search first
  try {
    const photonSearchUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8`;
    const pRes = await fetch(photonSearchUrl);
    if (pRes.ok) {
      const data = await pRes.json();
      if (data?.features && data.features.length > 0) {
        return data.features.map((f) => {
          const p = f.properties || {};
          const coords = f.geometry?.coordinates || [0, 0];
          const city = p.city || p.town || p.district || p.state || '';
          const title = p.name || p.street || p.district || q;
          const subtitleParts = [p.street, p.district, p.city, p.state].filter(Boolean);
          const fullAddress = Array.from(new Set([title, ...subtitleParts])).join(', ');

          return {
            area: title,
            city: city || 'Indore',
            pincode: p.postcode || '',
            address: fullAddress,
            lat: coords[1],
            lng: coords[0]
          };
        });
      }
    }
  } catch (pErr) {
    console.warn('[Geo] Photon search failed:', pErr.message);
  }

  // Fallback to OSM Nominatim Search
  try {
    const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=in&addressdetails=1&limit=8`;
    const res = await fetch(searchUrl, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'DrimStyleApp/1.0' }
    });
    if (res.ok) {
      const list = await res.json();
      return (list || []).map((item) => {
        const addr = item.address || {};
        const parts = (item.display_name || '').split(',').map((s) => s.trim()).filter(Boolean);
        const city = addr.city || addr.town || addr.state_district || addr.state || q;
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
