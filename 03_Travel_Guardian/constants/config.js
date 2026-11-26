import { Platform } from 'react-native';

// Travel Guardian - Global Application Configuration
// Centralized settings for network endpoints, timeouts, and storage keys

// Backend REST API base URL
// On Web browser: uses localhost:5001
// On Physical mobile devices (Expo Go / Android / iOS): uses the PC's current local Wi-Fi IP (192.168.1.93)
export const API_BASE_URL =
  Platform.OS === 'web'
    ? 'http://localhost:5001/api'
    : 'http://192.168.1.93:5001/api';

// Network request timeout in milliseconds
export const DEFAULT_REQUEST_TIMEOUT = 10000;

// OpenStreetMap Overpass API mirror endpoints
export const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

// Safety place search radius in meters (3 km)
export const SEARCH_RADIUS_METERS = 3000;

// Centralized AsyncStorage storage keys
export const STORAGE_KEYS = {
  USER_TOKEN: 'userToken',
  THEME_MODE: 'user_theme_mode',
  TRIPS_CACHE: 'travel_guardian_trips_cache',
  NEARBY_CACHE: 'travel_guardian_nearby_places_cache',
  DOCUMENTS_CACHE: 'travel_guardian_documents_cache',
  MEDIA_VAULT: 'travel_guardian_media_vault',
};

export default {
  API_BASE_URL,
  DEFAULT_REQUEST_TIMEOUT,
  OVERPASS_ENDPOINTS,
  SEARCH_RADIUS_METERS,
  STORAGE_KEYS,
};
