// Travel Guardian - Nearby Safety Places Service
// Uses OpenStreetMap Overpass API (free, real OpenStreetMap database, no API key required)
// to find real hospitals, police stations, pharmacies, fire stations, and emergency services
// near the user's actual GPS coordinates.

import AsyncStorage from '@react-native-async-storage/async-storage';

// Public Overpass API mirror endpoints for maximum reliability
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

// Storage key for caching nearby places
const NEARBY_CACHE_KEY = 'travel_guardian_nearby_places_cache';

// Search radius in meters (3000m = 3 km default)
const SEARCH_RADIUS_METERS = 3000;

import { haversineDistance, formatDistance } from '../utils/location';
export { haversineDistance, formatDistance };

// ─────────────────────────────────────────────────────────────────────────────
// AsyncStorage Caching Helpers
// ─────────────────────────────────────────────────────────────────────────────
export const getCachedNearbyPlaces = async () => {
  try {
    const raw = await AsyncStorage.getItem(NEARBY_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.places || null;
  } catch (err) {
    console.log('[NearbyPlaces] Cache read error:', err.message);
    return null;
  }
};

export const cacheNearbyPlaces = async (places, lat, lon) => {
  try {
    const payload = {
      places,
      timestamp: Date.now(),
      latitude: lat,
      longitude: lon,
    };
    await AsyncStorage.setItem(NEARBY_CACHE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.log('[NearbyPlaces] Cache write error:', err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Query Overpass with Automatic Server Fallbacks & Required User-Agent
// ─────────────────────────────────────────────────────────────────────────────
export const fetchNearbyPlaces = async (latitude, longitude) => {
  if (!latitude || !longitude) {
    return [];
  }

  // Overpass QL query: hospitals, police, pharmacies, fire stations
  const query = `
    [out:json][timeout:15];
    (
      node["amenity"="hospital"](around:${SEARCH_RADIUS_METERS},${latitude},${longitude});
      way["amenity"="hospital"](around:${SEARCH_RADIUS_METERS},${latitude},${longitude});
      node["amenity"="police"](around:${SEARCH_RADIUS_METERS},${latitude},${longitude});
      way["amenity"="police"](around:${SEARCH_RADIUS_METERS},${latitude},${longitude});
      node["amenity"="pharmacy"](around:${SEARCH_RADIUS_METERS},${latitude},${longitude});
      way["amenity"="pharmacy"](around:${SEARCH_RADIUS_METERS},${latitude},${longitude});
      node["amenity"="fire_station"](around:${SEARCH_RADIUS_METERS},${latitude},${longitude});
      way["amenity"="fire_station"](around:${SEARCH_RADIUS_METERS},${latitude},${longitude});
    );
    out center;
  `;

  let lastError = null;

  // Try each public mirror until one succeeds
  for (const endpoint of OVERPASS_ENDPOINTS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s per mirror

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          // User-Agent is REQUIRED by Overpass API policy to prevent 406 Not Acceptable
          'User-Agent': 'TravelGuardianApp/1.0 (https://github.com/travelguardian; contact: student-travel-safety-app)',
          'Accept': 'application/json',
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Overpass server ${endpoint} returned HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.elements || !Array.isArray(data.elements)) {
        return [];
      }

      // Map raw OSM elements to clean place objects
      const places = data.elements
        .map((element) => {
          const lat = element.lat || (element.center && element.center.lat);
          const lon = element.lon || (element.center && element.center.lon);
          if (!lat || !lon) return null;

          const tags = element.tags || {};
          const amenity = tags.amenity || 'unknown';
          const distanceKm = haversineDistance(latitude, longitude, lat, lon);

          // Real name from OSM tags
          const name = tags.name || getDefaultName(amenity);

          // Real address if available in OSM tags
          let address = null;
          if (tags['addr:full']) {
            address = tags['addr:full'];
          } else if (tags['addr:street']) {
            address = `${tags['addr:housenumber'] ? tags['addr:housenumber'] + ' ' : ''}${tags['addr:street']}${tags['addr:city'] ? ', ' + tags['addr:city'] : ''}`;
          }

          // Real phone if available in OSM tags
          const rawPhone = tags.phone || tags['contact:phone'] || tags['contact:mobile'] || tags.mobile || null;
          const phone = rawPhone ? rawPhone.split(';')[0].trim() : null;

          return {
            id: String(element.id),
            name,
            amenity,
            type: mapAmenityToType(amenity),
            categoryLabel: getCategoryLabel(amenity),
            latitude: lat,
            longitude: lon,
            distance: distanceKm,
            distanceText: formatDistance(distanceKm),
            address: address || 'Address unavailable',
            phone: phone || null,
            openingHours: tags.opening_hours || null,
          };
        })
        .filter(Boolean)
        // Sort by distance ascending (nearest first)
        .sort((a, b) => a.distance - b.distance);

      // Cache the successful result
      await cacheNearbyPlaces(places, latitude, longitude);

      return places;
    } catch (err) {
      clearTimeout(timeoutId);
      console.log(`[NearbyPlaces] Endpoint ${endpoint} failed:`, err.message);
      lastError = err;
      // Continue to next endpoint in loop
    }
  }

  // If all live endpoints failed, attempt to return cached places if available
  const cached = await getCachedNearbyPlaces();
  if (cached && cached.length > 0) {
    console.log('[NearbyPlaces] Returning cached places due to network issues');
    return cached;
  }

  throw lastError || new Error('Nearby places are taking too long to respond.');
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mapAmenityToType = (amenity) => {
  switch (amenity) {
    case 'hospital': return 'hospital';
    case 'police': return 'police';
    case 'pharmacy': return 'pharmacy';
    case 'fire_station': return 'fire_station';
    default: return 'emergency';
  }
};

export const getCategoryLabel = (type) => {
  switch (type) {
    case 'hospital': return 'Hospital';
    case 'police': return 'Police Station';
    case 'pharmacy': return 'Pharmacy';
    case 'fire_station': return 'Fire Station';
    default: return 'Emergency Service';
  }
};

const getDefaultName = (amenity) => {
  switch (amenity) {
    case 'hospital': return 'Nearby Hospital';
    case 'police': return 'Police Station';
    case 'pharmacy': return 'Pharmacy';
    case 'fire_station': return 'Fire Station';
    default: return 'Emergency Safe Haven';
  }
};

// ─── Icon / Color Helpers for UI ─────────────────────────────────────────────

export const getPlaceIcon = (type) => {
  switch (type) {
    case 'hospital': return 'medical';
    case 'police': return 'shield-checkmark';
    case 'pharmacy': return 'medkit';
    case 'fire_station': return 'flame';
    default: return 'location';
  }
};

export const getPlaceColor = (type) => {
  switch (type) {
    case 'hospital': return '#EF4444';     // Red
    case 'police': return '#3B82F6';       // Safety blue
    case 'pharmacy': return '#10B981';     // Green
    case 'fire_station': return '#F59E0B'; // Amber
    default: return '#8B5CF6';             // Purple
  }
};

export const getPlaceBgColor = (type) => {
  switch (type) {
    case 'hospital': return '#FEE2E2';
    case 'police': return '#DBEAFE';
    case 'pharmacy': return '#D1FAE5';
    case 'fire_station': return '#FEF3C7';
    default: return '#EDE9FE';
  }
};

export default {
  fetchNearbyPlaces,
  getCachedNearbyPlaces,
  haversineDistance,
  formatDistance,
  getCategoryLabel,
  getPlaceIcon,
  getPlaceColor,
  getPlaceBgColor,
};
