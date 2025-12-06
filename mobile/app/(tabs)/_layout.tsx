import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Sparkles, User } from 'lucide-react-native'; // Changed Home to Sparkles for Create, Compass to User for Profile
import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { View } from 'react-native';

export default function TabLayout() {
  const colorScheme = 'dark'; // Force dark mode

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6366F1', // Primary-500
        tabBarInactiveTintColor: '#9CA3AF', // Gray-400
        headerShown: false,
        tabBarShowLabel: false, // Hide labels for cleaner look
        tabBarStyle: {
          position: 'absolute',
          bottom: 25,
          left: 20,
          right: 20,
          elevation: 0,
          backgroundColor: '#1F2937', // Surface-dark
          borderRadius: 30, // Rounded corners
          height: 65,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 10,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.5,
          paddingBottom: 0, // Fix alignment
          alignItems: 'center',
          justifyContent: 'center',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Create',
          tabBarIcon: ({ color, focused }) => (
            <View className={`items-center justify-center w-12 h-12 rounded-full ${focused ? 'bg-primary-600/20' : ''}`}>
              <Sparkles size={24} color={color} fill={focused ? color : 'none'} />
            </View>
          ),
        }}
      />
      {/* Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View className={`items-center justify-center w-12 h-12 rounded-full ${focused ? 'bg-primary-600/20' : ''}`}>
              <User size={24} color={color} fill={focused ? color : 'none'} />
            </View>
          ),
        }}
      />

    </Tabs>
  );
}
