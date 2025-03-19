import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // 🔹 Call useFonts FIRST before any conditions
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require('@/assets/fonts/Poppins-Regular.ttf'),
    "Poppins-SemiBold": require('@/assets/fonts/Poppins-SemiBold.ttf'),
    "Roboto_Condensed-Black": require('@/assets/fonts/Roboto_Condensed-Black.ttf'),
    "Roboto_Condensed-Thin": require('@/assets/fonts/Roboto_Condensed-Thin.ttf'),
  });

  const colorScheme = useColorScheme();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // 🔹 Ensure fonts are loaded before returning the UI
  if (!fontsLoaded) {
    return null; // Prevents rendering before fonts are ready
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ title: "Sign Up"}} />
        <Stack.Screen name="dashboard" options={{ title: "Dashboard"}} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}