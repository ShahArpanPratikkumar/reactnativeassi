import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { DrawerContent } from '@/components/DrawerContent';

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          width: 280,
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
