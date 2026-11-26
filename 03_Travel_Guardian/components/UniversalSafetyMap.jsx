// Travel Guardian - Universal Interactive Safety Map (Zero API Key Required)
// Powered by OpenStreetMap & Leaflet with CartoDB Voyager & Satellite Tiles.
// Works 100% free with NO Google Maps API keys, eliminating all "API keys" errors on Android, iOS, and Web.

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

// Safely require react-native-webview for native platforms
let WebView = null;
if (Platform.OS !== 'web') {
  try {
    WebView = require('react-native-webview').WebView;
  } catch (err) {
    console.log('[UniversalMap] react-native-webview notice:', err.message);
  }
}

export default function UniversalSafetyMap({
  latitude,
  longitude,
  address = 'Locating position...',
  nearbyPlaces = [],
  height = 320,
  showControls = true,
  onPlaceSelect,
  isWatching = false,
  onMapTouchStart,
  onMapTouchEnd,
}) {
  const { theme, isDarkMode } = useTheme();
  const [mapLayer, setMapLayer] = useState('voyager'); // 'voyager' | 'standard' | 'satellite'
  const [selectedPlace, setSelectedPlace] = useState(null);
  const webViewRef = useRef(null);

  const lat = latitude || 23.0225; // Default to Ahmedabad if null
  const lon = longitude || 72.5714;

  // Tile layer URLs (100% free, no API key needed)
  const tileConfig = useMemo(() => {
    switch (mapLayer) {
      case 'satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: 'Esri Satellite',
          maxZoom: 19,
        };
      case 'standard':
        return {
          url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        };
      case 'voyager':
      default:
        return {
          url: 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
          attribution: '© CARTO, © OpenStreetMap',
          maxZoom: 20,
        };
    }
  }, [mapLayer]);

  // Generate self-contained Leaflet HTML
  const leafletHtml = useMemo(() => {
    const placesJson = JSON.stringify(nearbyPlaces.slice(0, 30));

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background: ${isDarkMode ? '#0F172A' : '#E2E8F0'};
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
      touch-action: manipulation;
    }
    .user-marker {
      width: 22px;
      height: 22px;
      background: #2563EB;
      border: 3px solid #FFFFFF;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(37,99,235,0.7);
    }
    .place-marker {
      width: 28px;
      height: 28px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      border: 2px solid #FFFFFF;
    }
    .place-hospital { background: #EF4444; }
    .place-police { background: #2563EB; }
    .place-pharmacy { background: #10B981; }
    .place-fire { background: #F97316; }
    .place-other { background: #64748B; }
    .leaflet-popup-content-wrapper {
      border-radius: 10px;
      padding: 4px;
      font-family: inherit;
    }
    .popup-title {
      font-weight: bold;
      font-size: 13px;
      color: #0F172A;
      margin-bottom: 2px;
    }
    .popup-sub {
      font-size: 11px;
      color: #64748B;
      margin-bottom: 6px;
    }
    .popup-btn {
      display: inline-block;
      background: #2563EB;
      color: #FFFFFF;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: bold;
      text-decoration: none;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var userLat = ${lat};
    var userLon = ${lon};
    var nearby = ${placesJson};

    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      touchZoom: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      tap: false
    }).setView([userLat, userLon], 15);

    L.tileLayer('${tileConfig.url}', {
      maxZoom: ${tileConfig.maxZoom}
    }).addTo(map);

    // User Location Pin
    var userIcon = L.divIcon({
      className: 'user-pin-wrapper',
      html: '<div class="user-marker"></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    var userMarker = L.marker([userLat, userLon], { icon: userIcon }).addTo(map);
    userMarker.bindPopup('<div class="popup-title">📍 Your GPS Location</div><div class="popup-sub">${address.replace(/'/g, "\\'")}</div>');

    // Nearby Places Pins
    nearby.forEach(function(place) {
      var markerClass = 'place-other';
      var symbol = '📍';
      if (place.type === 'hospital') { markerClass = 'place-hospital'; symbol = '🏥'; }
      else if (place.type === 'police') { markerClass = 'place-police'; symbol = '🛡️'; }
      else if (place.type === 'pharmacy') { markerClass = 'place-pharmacy'; symbol = '💊'; }
      else if (place.type === 'fire_station') { markerClass = 'place-fire'; symbol = '🔥'; }

      var placeIcon = L.divIcon({
        className: 'place-pin-wrapper',
        html: '<div class="place-marker ' + markerClass + '">' + symbol + '</div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      var pMarker = L.marker([place.latitude, place.longitude], { icon: placeIcon }).addTo(map);
      
      var popupContent = '<div class="popup-title">' + place.name + '</div>' +
        '<div class="popup-sub">' + (place.categoryLabel || place.type) + ' • ' + (place.distanceText || '') + '</div>' +
        '<a class="popup-btn" onclick="window.location.href=\\'https://www.google.com/maps/dir/?api=1&destination=' + place.latitude + ',' + place.longitude + '\\'">Directions</a>';

      pMarker.bindPopup(popupContent);
    });

    window.centerOnUser = function() {
      map.flyTo([userLat, userLon], 15, { animate: true, duration: 0.8 });
    };

    window.jumpTo = function(pLat, pLon) {
      map.flyTo([pLat, pLon], 16, { animate: true, duration: 0.8 });
    };

    window.zoomIn = function() {
      map.zoomIn(1);
    };

    window.zoomOut = function() {
      map.zoomOut(1);
    };
  </script>
</body>
</html>
    `;
  }, [lat, lon, address, nearbyPlaces, tileConfig, isDarkMode]);

  // Automatically fly to coordinates when search or GPS updates
  useEffect(() => {
    if (webViewRef.current && lat && lon) {
      webViewRef.current.injectJavaScript(`if(window.jumpTo) { window.jumpTo(${lat}, ${lon}); } true;`);
    }
  }, [lat, lon]);

  // Recenter map handler
  const handleRecenter = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript('if(window.centerOnUser) { window.centerOnUser(); } true;');
    }
  };

  // Jump to nearest hospital or police
  const jumpToNearest = (type) => {
    const matched = nearbyPlaces.find((p) => p.type === type);
    if (matched) {
      setSelectedPlace(matched);
      if (onPlaceSelect) onPlaceSelect(matched);
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`if(window.jumpTo) { window.jumpTo(${matched.latitude}, ${matched.longitude}); } true;`);
      }
      Alert.alert('📍 Nearest ' + (type === 'hospital' ? 'Hospital' : 'Police Station'), `${matched.name} (${matched.distanceText} away)`);
    } else {
      Alert.alert('Searching...', `Scanning area within 3 km for nearby ${type}s...`);
    }
  };

  // Open direct turn-by-turn directions in native Google Maps
  const handleOpenGoogleMaps = () => {
    const url = Platform.select({
      ios: `maps:?q=${lat},${lon}`,
      android: `geo:${lat},${lon}?q=${lat},${lon}(My+Location)`,
      default: `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`,
    });
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`);
    });
  };

  const handleZoomIn = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript('if(window.zoomIn) { window.zoomIn(); } true;');
    }
  };

  const handleZoomOut = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript('if(window.zoomOut) { window.zoomOut(); } true;');
    }
  };

  return (
    <View
      style={[styles.mapContainer, { height, borderColor: theme.border }]}
      onTouchStart={onMapTouchStart}
      onTouchEnd={onMapTouchEnd}
      onTouchCancel={onMapTouchEnd}
    >
      {/* 1. Leaflet OSM Map Renderer */}
      {Platform.OS === 'web' ? (
        <iframe
          srcDoc={leafletHtml}
          style={{ width: '100%', height: '100%', border: 'none', borderRadius: 14 }}
          title="OpenStreetMap Live Safety Map"
        />
      ) : WebView ? (
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: leafletHtml }}
          style={styles.webview}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          overScrollMode="never"
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={[styles.loadingBox, { backgroundColor: theme.card }]}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading Safety Map…</Text>
            </View>
          )}
        />
      ) : (
        <View style={[styles.loadingBox, { backgroundColor: theme.card }]}>
          <Ionicons name="map" size={40} color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>OpenStreetMap Active</Text>
        </View>
      )}

      {/* 2. Layer Selector Bar (Carto OSM, Standard Road, Satellite) */}
      {showControls && (
        <View style={[styles.layerBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {[
            { id: 'voyager', label: 'Carto OSM', icon: 'map' },
            { id: 'standard', label: 'Road', icon: 'navigate' },
            { id: 'satellite', label: 'Satellite', icon: 'earth' },
          ].map((layer) => {
            const isSelected = mapLayer === layer.id;
            return (
              <Pressable
                key={layer.id}
                style={[
                  styles.layerBtn,
                  isSelected && { backgroundColor: colors.primary },
                ]}
                onPress={() => setMapLayer(layer.id)}
              >
                <Ionicons
                  name={layer.icon}
                  size={11}
                  color={isSelected ? '#FFFFFF' : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.layerBtnText,
                    { color: isSelected ? '#FFFFFF' : theme.textSecondary },
                    isSelected && { fontWeight: 'bold' },
                  ]}
                >
                  {layer.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* 3. Floating Action Controls (Zoom In, Zoom Out, Recenter + Google Maps) */}
      {showControls && (
        <View style={styles.floatingControls}>
          <Pressable
            style={[styles.floatBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={handleZoomIn}
            accessibilityLabel="Zoom In"
          >
            <Ionicons name="add" size={18} color={theme.text} />
          </Pressable>

          <Pressable
            style={[styles.floatBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={handleZoomOut}
            accessibilityLabel="Zoom Out"
          >
            <Ionicons name="remove" size={18} color={theme.text} />
          </Pressable>

          <Pressable
            style={[styles.floatBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={handleRecenter}
            accessibilityLabel="Recenter GPS Location"
          >
            <Ionicons name="locate" size={18} color={theme.primary} />
          </Pressable>

          <Pressable
            style={[styles.floatBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={handleOpenGoogleMaps}
            accessibilityLabel="Open in Google Maps"
          >
            <Ionicons name="navigate" size={16} color="#10B981" />
          </Pressable>
        </View>
      )}

      {/* 4. Live Tracking & Zero-Key Verified Badge */}
      <View style={[styles.statusBadge, { backgroundColor: theme.card + 'E6', borderColor: theme.border }]}>
        <View style={[styles.statusDot, { backgroundColor: isWatching ? '#10B981' : theme.primary }]} />
        <Text style={[styles.statusText, { color: theme.text }]}>
          {isWatching ? 'LIVE GPS ACTIVE' : 'OPENSTREETMAP SAFE'}
        </Text>
      </View>

      {/* 5. Quick Jump Emergency Haven Pills */}
      {showControls && (
        <View style={styles.quickPillsRow}>
          <Pressable
            style={[styles.quickPill, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}
            onPress={() => jumpToNearest('hospital')}
          >
            <Ionicons name="medical" size={12} color="#EF4444" />
            <Text style={[styles.quickPillText, { color: '#EF4444' }]}>Nearest Hospital</Text>
          </Pressable>

          <Pressable
            style={[styles.quickPill, { backgroundColor: '#DBEAFE', borderColor: '#BFDBFE' }]}
            onPress={() => jumpToNearest('police')}
          >
            <Ionicons name="shield" size={12} color="#2563EB" />
            <Text style={[styles.quickPillText, { color: '#2563EB' }]}>Nearest Police</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
    backgroundColor: '#E0F2FE',
  },
  webview: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  loadingBox: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  layerBar: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    padding: 3,
    gap: 3,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  layerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    gap: 4,
  },
  layerBtnText: {
    fontSize: 10,
  },
  floatingControls: {
    position: 'absolute',
    top: 10,
    right: 10,
    gap: 6,
  },
  floatBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 42,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  quickPillsRow: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    right: 10,
    flexDirection: 'row',
    gap: 8,
  },
  quickPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickPillText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});
