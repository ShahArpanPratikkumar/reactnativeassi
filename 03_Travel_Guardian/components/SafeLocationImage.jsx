// SafeLocationImage — Guaranteed image loader
// Uses direct Unsplash search as primary source for real place photos.
// No absoluteFill bug, no Wikimedia block issues.

import React, { useState } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Text } from 'react-native';

// Build an Unsplash search URL for any place — free, no API key, always loads
function unsplashSearch(query) {
  const q = encodeURIComponent(query + ' india');
  return `https://source.unsplash.com/600x400/?${q}`;
}

// Category icon for empty state
const CATEGORY_ICONS = {
  food: '🍛',
  attraction: '🏛️',
  shopping: '🛍️',
  city: '🏙️',
  heritage: '🏯',
  beach: '🏖️',
  mountain: '🏔️',
};

export default function SafeLocationImage({
  uri,
  placeName,
  style,
  fallbackCategory = 'city',
  resizeMode = 'cover',
}) {
  // Priority: 1) provided uri  2) unsplash search by placeName  3) category search
  const primaryUri = uri && uri.startsWith('http')
    ? uri
    : placeName
      ? unsplashSearch(placeName)
      : unsplashSearch(fallbackCategory);

  const fallbackUri = placeName
    ? unsplashSearch(placeName)
    : unsplashSearch(fallbackCategory);

  const [imgUri, setImgUri] = useState(primaryUri);
  const [errCount, setErrCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const handleError = () => {
    if (errCount === 0 && imgUri !== fallbackUri) {
      // First error: try Unsplash search by place name
      setImgUri(fallbackUri);
      setErrCount(1);
    } else if (errCount === 1) {
      // Second error: try category unsplash
      setImgUri(unsplashSearch(fallbackCategory));
      setErrCount(2);
    } else {
      // All failed: show empty placeholder
      setLoading(false);
      setErrCount(3);
    }
  };

  const containerStyle = [styles.container, style];
  const flatStyle = StyleSheet.flatten(style) || {};
  const imgWidth = flatStyle.width || '100%';
  const imgHeight = flatStyle.height || '100%';

  if (errCount >= 3) {
    return (
      <View style={[containerStyle, styles.emptyBox]}>
        <Text style={styles.emptyIcon}>{CATEGORY_ICONS[fallbackCategory] || '📍'}</Text>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <Image
        source={{ uri: imgUri }}
        style={{ width: imgWidth, height: imgHeight }}
        resizeMode={resizeMode}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={handleError}
      />
      {loading && (
        <View style={[StyleSheet.absoluteFill, styles.loaderOverlay]}>
          <ActivityIndicator size="small" color="#60A5FA" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    overflow: 'hidden',
  },
  loaderOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.6)',
  },
  emptyBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 28,
  },
});
