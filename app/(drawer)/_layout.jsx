import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { DrawerContent } from '@/components/DrawerContent';
import { Colors } from '@/constants/theme';

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          width: 290,
          backgroundColor: Colors.light.white,
          borderTopRightRadius: 24,
          borderBottomRightRadius: 24,
        },
        overlayColor: 'rgba(0,0,0,0.4)',
        sceneStyle: {
          backgroundColor: Colors.light.background,
        },
      }}
    >
      <Drawer.Screen name="(tabs)" />
      <Drawer.Screen name="camera" />
      <Drawer.Screen name="location" />
      <Drawer.Screen name="clipboard" />
      <Drawer.Screen name="contacts" />
      <Drawer.Screen name="survey-preview" />
      <Drawer.Screen name="settings" />
    </Drawer>
  );
}
