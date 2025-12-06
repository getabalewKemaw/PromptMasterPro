import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Sparkles, User } from 'lucide-react-native'; // Changed Home to Sparkles for Create, Compass to User for Profile

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = 'dark'; // Force dark mode

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6366F1', // Primary-500
        tabBarInactiveTintColor: '#6B7280', // Gray-500
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: '#111827', // Background-dark (darker than surface)
            borderTopWidth: 0,
          },
          default: {
            backgroundColor: '#111827', // Background-dark
            borderTopWidth: 0,
            elevation: 0,
            height: 60,
            paddingBottom: 10,
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => <Sparkles size={24} color={color} />,
        }}
      />
      {/* Replaced Explore with Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />

      {/* Hide the old explore route if file still exists until deleted */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
