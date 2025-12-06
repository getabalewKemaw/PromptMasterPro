import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, Slot, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { useColorScheme } from 'nativewind';
import { useAuthStore } from '../src/store/authStore';
import '../global.css'; // Import global css for NativeWind

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return; // Wait for navigation to be ready

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to the login page if not authenticated
      // Use setTimeout to ensure navigation happens after the component is mounted
      setTimeout(() => {
        router.replace('/(auth)/welcome');
      }, 0);
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to the tabs page if authenticated
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 0);
    }
  }, [isAuthenticated, segments, navigationState?.key]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
