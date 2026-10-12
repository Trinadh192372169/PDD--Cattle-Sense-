import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import LoginScreen from './(auth)/login';

export default function Index() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/(tabs)/home');
    }
  }, [isLoggedIn]);

  if (isLoggedIn) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4FAF5' }}>
        <ActivityIndicator size="large" color="#176B45" />
        <Text style={{ marginTop: 14, color: '#176B45', fontWeight: '600', fontSize: 16 }}>
          Loading CattleSense...
        </Text>
      </View>
    );
  }

  return <LoginScreen />;
}
