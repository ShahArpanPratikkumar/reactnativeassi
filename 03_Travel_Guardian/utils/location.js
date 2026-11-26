// Travel Guardian - Location Utilities
// Haversine distance formula and coordinate formatting functions

// Calculate straight-line distance between two GPS coordinates in kilometers
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Format kilometer distance into readable string (e.g. "800 m" or "1.2 km")
export const formatDistance = (km) => {
  if (km === null || km === undefined) return '';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
};

// Format GPS coordinates into readable string
export const formatCoordinates = (latitude, longitude) => {
  if (latitude === null || longitude === null || latitude === undefined || longitude === undefined) {
    return 'Acquiring GPS…';
  }
  const latStr = `${Math.abs(latitude).toFixed(5)}° ${latitude >= 0 ? 'N' : 'S'}`;
  const lonStr = `${Math.abs(longitude).toFixed(5)}° ${longitude >= 0 ? 'E' : 'W'}`;
  return `${latStr}, ${lonStr}`;
};

export default {
  haversineDistance,
  formatDistance,
  formatCoordinates,
};
