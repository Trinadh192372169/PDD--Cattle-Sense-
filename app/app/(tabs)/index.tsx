import React from 'react';
import { Redirect } from 'expo-router';

export default function TabIndexRedirect() {
  return <Redirect href={'/(tabs)/scanner' as any} />;
}
