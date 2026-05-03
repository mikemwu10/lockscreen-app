import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      // @ts-ignore: expo-router strict type omit for underlying Tab.Navigator props
      sceneContainerStyle={{ backgroundColor: 'transparent' }}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: 'rgba(255, 255, 255, 0.15)',
          elevation: 0,
          height: 80,
          backgroundColor: 'rgba(18, 18, 32, 0.72)',
        },

        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Lock Screen',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
      {/* Hide the default explore screen */}
      <Tabs.Screen
        name="explore"
        options={{ href: null }}
      />
    </Tabs>
  );
}
