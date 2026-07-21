import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';

export function Header({ title, subtitle, leftAction, rightAction, onLeftPress, onRightPress }) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {leftAction ? (
          <TouchableOpacity style={styles.actionButton} onPress={onLeftPress}>
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
          <TouchableOpacity style={styles.actionButton} onPress={onRightPress}>
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
    paddingTop: 50,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
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
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.white,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
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
