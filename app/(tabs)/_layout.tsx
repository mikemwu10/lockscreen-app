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
          borderTopColor: 'rgba(24, 28, 36, 0.7)', // Deep modern border
          elevation: 0,
          height: 80,
          backgroundColor: 'rgba(24, 28, 36, 0.92)', // Deep blue, modern, less transparent
        },

        tabBarActiveTintColor: '#1ecbe1', // Modern cyan accent
        tabBarInactiveTintColor: '#b0b8c1', // Muted gray
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
