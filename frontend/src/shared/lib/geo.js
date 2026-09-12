// Geolocation + distance helpers.
//
// There is no paid maps/geocoding provider wired into this prototype (SRS
// §17 lists Maps as a third-party integration still to be selected), so
// this does the two things that don't require one: read the device's real
// GPS coordinates through the browser's own Geolocation API, and compute
// real straight-line distance from them. Turning coordinates into a human
// address ("reverse geocoding") is approximated by nearest-known-locality
// matching, labelled honestly as an approximation rather than presented as
// a real address lookup.

const EARTH_RADIUS_KM = 6371;

export const haversineKm = (lat1, lng1, lat2, lng2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

export const formatDistance = (km) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`);

// Permission-state-aware wrapper around navigator.geolocation. Resolves
// with coordinates or a typed error the caller can render copy for —
// 'unsupported' | 'denied' | 'unavailable' | 'timeout'.
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
          reject({ type: 'denied', message: 'Location permission was denied. Enable it in your browser settings, or add your address manually.' });
        } else if (err.code === err.TIMEOUT) {
          reject({ type: 'timeout', message: 'Location request timed out. Please try again.' });
        } else {
          reject({ type: 'unavailable', message: 'Could not determine your location. Please add your address manually.' });
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  });

// A small set of known Indore localities used to approximate "reverse
// geocoding" from raw coordinates without a paid provider.
const KNOWN_LOCALITIES = [
  { area: 'South Tukoganj', city: 'Indore', pincode: '452001', lat: 22.7196, lng: 75.8577 },
  { area: 'Vijay Nagar', city: 'Indore', pincode: '452010', lat: 22.7515, lng: 75.8931 },
  { area: 'New Palasia', city: 'Indore', pincode: '452001', lat: 22.7278, lng: 75.8877 },
  { area: 'Geeta Bhawan', city: 'Indore', pincode: '452007', lat: 22.7089, lng: 75.8801 }
];

export const nearestKnownLocality = (lat, lng) => {
  let best = null;
  let bestDist = Infinity;
  KNOWN_LOCALITIES.forEach((loc) => {
    const d = haversineKm(lat, lng, loc.lat, loc.lng);
    if (d < bestDist) {
      bestDist = d;
      best = loc;
    }
  });
  return { ...best, distanceKm: bestDist };
};

export const distanceFromSalon = (customerLat, customerLng, salon) => {
  if (customerLat == null || customerLng == null || salon.lat == null || salon.lng == null) {
    return salon.distanceKm ?? null;
  }
  return haversineKm(customerLat, customerLng, salon.lat, salon.lng);
};
