import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'camera.alt': 'camera-alt',
  'location.on': 'location-on',
  'add-circle': 'add-circle',
  'history': 'history',
  'menu': 'menu',
  'arrow-back': 'arrow-back',
  'refresh': 'refresh',
  'content-copy': 'content-copy',
  'content-paste': 'content-paste',
  'delete': 'delete',
  'photo-camera': 'photo-camera',
  'check-circle': 'check-circle',
  'warning': 'warning',
  'info': 'info',
  'person': 'person',
  'business': 'business',
  'description': 'description',
  'flag': 'flag',
  'calendar-today': 'calendar-today',
  'collections': 'collections',
  'contacts': 'contacts',
  'settings': 'settings',
  'search': 'search',
  'filter-list': 'filter-list',
  'edit': 'edit',
  'send': 'send',
  'phone': 'phone',
  'map': 'map',
  'share': 'share',
  'bookmark': 'bookmark',
  'star': 'star',
  'notifications': 'notifications',
  'help': 'help-outline',
};

export function IconSymbol({ name, size = 24, color, style }) {
  const iconName = MAPPING[name] || 'help-outline';
  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}
