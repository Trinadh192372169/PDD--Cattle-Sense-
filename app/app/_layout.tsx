import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { onAuthChange } from '../services/firebase';
import { useAuthStore } from '../store/authStore';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { login, logout, isLoggedIn } = useAuthStore();

  // Listen to Firebase auth state changes for persistent sessions
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        login(user.uid, user.email ?? '', user.displayName ?? 'Cattle Officer');
      } else {
        if (isLoggedIn) logout();
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(stack)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
