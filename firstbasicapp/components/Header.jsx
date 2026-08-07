import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function Header({ title, subtitle, leftAction, rightAction, onLeftPress, onRightPress, transparent }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, transparent && styles.transparent, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.row}>
        {leftAction ? (
          <TouchableOpacity style={styles.actionButton} onPress={onLeftPress} activeOpacity={0.7}>
            <Text style={styles.actionIcon}>{leftAction}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionButton} />
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {rightAction ? (
          <TouchableOpacity style={styles.actionButton} onPress={onRightPress} activeOpacity={0.7}>
            <Text style={styles.actionIcon}>{rightAction}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.actionButton} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.primary,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    ...Typography.h3,
    color: Colors.light.white,
  },
  subtitle: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  actionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 22,
    color: Colors.light.white,
  },
});
