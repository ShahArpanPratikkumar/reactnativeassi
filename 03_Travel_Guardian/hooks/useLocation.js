// Custom Hook: useLocation
// Manages GPS location, reverse geocoding, and live location watching with automatic cleanup

import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';

// Reliable regional default coordinates (so map always renders immediately)
const DEFAULT_COORDS = { latitude: 23.0225, longitude: 72.5714 };
const DEFAULT_ADDRESS = 'Gujarat, India (Default GPS)';

export const useLocation = () => {
  // State variables for coordinates, address, status, and errors
  const [location, setLocation] = useState(DEFAULT_COORDS);
  const [latitude, setLatitude] = useState(DEFAULT_COORDS.latitude);
  const [longitude, setLongitude] = useState(DEFAULT_COORDS.longitude);
  const [address, setAddress] = useState(DEFAULT_ADDRESS);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [isWatching, setIsWatching] = useState(false);

  // Store watcher subscription object in a ref so we can unsubscribe easily
  const watcherRef = useRef(null);

  // Helper: Reverse geocode latitude/longitude into human-readable street/city address
  const getAddressFromCoords = async (coords) => {
    try {
      const results = await Location.reverseGeocodeAsync(coords);
      if (results && results.length > 0) {
        const place = results[0];
        const parts = [
          place.streetNumber,
          place.street,
          place.city || place.subregion,
          place.region,
          place.country,
        ].filter(Boolean);

        const formattedAddress = parts.join(', ');
        return formattedAddress || `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
      }
      return `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
    } catch (error) {
      console.log('Reverse geocoding error:', error.message);
      return `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
    }
  };

  // 1. Request foreground location permission and check device location services
  const requestLocationPermission = async () => {
    try {
      // Check if phone's location services are turned on
      const servicesEnabled = await Location.hasServicesEnabledAsync().catch(() => true);
      if (!servicesEnabled) {
        setErrorMsg('GPS is turned off. Showing map for default city.');
        setHasPermission(false);
        return false;
      }

      // Request foreground permission
      const { status } = await Location.requestForegroundPermissionsAsync().catch(() => ({ status: 'denied' }));
      if (status !== 'granted') {
        setErrorMsg('Location permission not granted. Showing default map view.');
        setHasPermission(false);
        return false;
      }

      setHasPermission(true);
      setErrorMsg(null);
      return true;
    } catch (error) {
      setErrorMsg('Permission note: ' + error.message);
      setHasPermission(false);
      return false;
    }
  };

  // 2. Fetch last known location (fast cached GPS position)
  const getLastKnownLocation = async () => {
    try {
      const lastKnown = await Location.getLastKnownPositionAsync({});
      if (lastKnown && lastKnown.coords) {
        const coords = {
          latitude: lastKnown.coords.latitude,
          longitude: lastKnown.coords.longitude,
        };
        setLocation(coords);
        setLatitude(coords.latitude);
        setLongitude(coords.longitude);

        const addr = await getAddressFromCoords(coords);
        setAddress(addr);
      }
    } catch (error) {
      console.log('Last known location notice:', error.message);
    }
  };

  // 3. Fetch current fresh GPS location
  const getCurrentLocation = async () => {
    setLoading(true);

    try {
      // Try fast last known position first
      await getLastKnownLocation();

      const permissionGranted = await requestLocationPermission();
      if (permissionGranted) {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setLocation(coords);
        setLatitude(coords.latitude);
        setLongitude(coords.longitude);

        const readableAddress = await getAddressFromCoords(coords);
        setAddress(readableAddress);
        setErrorMsg(null);
      }
    } catch (error) {
      console.log('[useLocation] GPS lock note:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Start Live Location Tracking using watchPositionAsync
  const startLocationTracking = async () => {
    const permissionGranted = await requestLocationPermission();
    if (!permissionGranted) return;

    // If already watching, stop previous watcher first
    if (watcherRef.current) {
      watcherRef.current.remove();
    }

    try {
      setIsWatching(true);
      setErrorMsg(null);

      // Start watcher with updates every 5 meters or 3 seconds
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 5,
          timeInterval: 3000,
        },
        async (newPosition) => {
          const coords = {
            latitude: newPosition.coords.latitude,
            longitude: newPosition.coords.longitude,
          };
          setLocation(coords);
          setLatitude(coords.latitude);
          setLongitude(coords.longitude);

          const newAddr = await getAddressFromCoords(coords);
          setAddress(newAddr);
        }
      );

      watcherRef.current = subscription;
    } catch (error) {
      setErrorMsg('Tracking error: ' + error.message);
      setIsWatching(false);
    }
  };

  // 5. Stop / Unsubscribe from Live Location Tracking
  const stopLocationTracking = () => {
    if (watcherRef.current) {
      watcherRef.current.remove();
      watcherRef.current = null;
    }
    setIsWatching(false);
  };

  // 6. Search location by text (Forward geocoding with OpenStreetMap fallback)
  const searchLocation = async (queryText) => {
    if (!queryText || queryText.trim() === '') return null;

    try {
      setLoading(true);

      // Step 1: Try native Expo Location geocoding first
      let coords = null;
      let placeName = null;

      try {
        const results = await Location.geocodeAsync(queryText);
        if (results && results.length > 0) {
          coords = {
            latitude: results[0].latitude,
            longitude: results[0].longitude,
          };
        }
      } catch (nativeErr) {
        console.log('[useLocation] Native geocoding note:', nativeErr.message);
      }

      // Step 2: Reliable OpenStreetMap Nominatim fallback (100% free, excellent coverage in India)
      if (!coords) {
        try {
          const cleanQuery = encodeURIComponent(queryText.trim());
          const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${cleanQuery}&format=json&limit=1`, {
            headers: {
              'User-Agent': 'TravelGuardianApp/1.0 (https://github.com/travelguardian)',
              'Accept': 'application/json',
            },
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
              coords = {
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon),
              };
              placeName = data[0].display_name;
            }
          }
        } catch (osmErr) {
          console.log('[useLocation] OSM search error:', osmErr.message);
        }
      }

      if (coords) {
        setLocation(coords);
        setLatitude(coords.latitude);
        setLongitude(coords.longitude);

        const addr = placeName || (await getAddressFromCoords(coords));
        setAddress(addr);
        setErrorMsg(null);
        setLoading(false);
        return coords;
      } else {
        setErrorMsg('Could not locate "' + queryText + '". Try another city or landmark.');
        setLoading(false);
        return null;
      }
    } catch (error) {
      setErrorMsg('Search error: ' + error.message);
      setLoading(false);
      return null;
    }
  };

  // Initial load on component mount
  useEffect(() => {
    getCurrentLocation();

    // Cleanup: Unsubscribe location watcher when component unmounts
    return () => {
      if (watcherRef.current) {
        watcherRef.current.remove();
        watcherRef.current = null;
      }
    };
  }, []);

  return {
    location,
    latitude,
    longitude,
    address,
    errorMsg,
    loading,
    hasPermission,
    isWatching,
    getCurrentLocation,
    getLastKnownLocation,
    startLocationTracking,
    stopLocationTracking,
    searchLocation,
    requestLocationPermission,
  };
};

export default useLocation;
