// Travel Guardian - Video Player Component
// Clean and reliable video preview & playback using expo-video

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';

export function VideoPlayerView({ uri, style, autoPlay = true }) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  // Initialize video player hook from expo-video
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    if (autoPlay) {
      p.play();
    }
  });

  // Track playback status changes
  useEffect(() => {
    if (!player) return;
    const subscription = player.addListener('playingChange', (status) => {
      setIsPlaying(status.isPlaying);
    });
    return () => {
      subscription.remove();
    };
  }, [player]);

  if (!uri) {
    return (
      <View style={[styles.container, styles.center, style]}>
        <Ionicons name="videocam-off" size={40} color={colors.textLight} />
        <Text style={styles.errorText}>No video source available</Text>
      </View>
    );
  }

  const togglePlay = () => {
    if (!player) return;
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleReplay = () => {
    if (!player) return;
    player.currentTime = 0;
    player.play();
  };

  return (
    <View style={[styles.container, style]}>
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen
        nativeControls={true}
      />

      {/* Simple overlay controls for quick preview actions */}
      <View style={styles.controlOverlay}>
        <Pressable style={styles.controlBtn} onPress={togglePlay}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={22}
            color={colors.white}
          />
        </Pressable>

        <Pressable style={styles.controlBtn} onPress={handleReplay}>
          <Ionicons name="reload" size={18} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0F172A',
  },
  errorText: {
    color: colors.textLight,
    fontSize: 13,
    marginTop: 8,
  },
  controlOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  controlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});

export default VideoPlayerView;
