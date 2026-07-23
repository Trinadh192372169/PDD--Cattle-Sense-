import React from 'react';
import { StyleSheet, View, Text, Pressable, Image, StatusBar, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WebHomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f6fff8" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>CattleSense</Text>
          <Text style={styles.title}>AI-powered cattle breed identification</Text>
          <Text style={styles.subtitle}>
            Scan a cattle image, review the breed prediction, and explore the breed library from one clean experience.
          </Text>
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
              onPress={() => router.push('/onboarding')}
            >
              <Text style={styles.primaryButtonText}>Open app</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
              onPress={() => router.push('/breed-library')}
            >
              <Text style={styles.secondaryButtonText}>Browse breeds</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Fast scan</Text>
            <Text style={styles.cardText}>Capture or upload an image and get a breed prediction instantly.</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Smart records</Text>
            <Text style={styles.cardText}>Keep a history of earlier scans and confidence scores in one place.</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Field-ready</Text>
            <Text style={styles.cardText}>Use the app from mobile or browser for quick demonstrations and testing.</Text>
          </View>
        </View>

        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1500595046743-ed7f6fbbd5f3?auto=format&fit=crop&w=1000&q=80' }}
          style={styles.image}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6fff8',
  },
  container: {
    flexGrow: 1,
    padding: 24,
    gap: 16,
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  eyebrow: {
    color: '#1f7a4d',
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#123524',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#4b5f54',
    lineHeight: 24,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#1f7a4d',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#eef7f0',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  secondaryButtonText: {
    color: '#174d2f',
    fontWeight: '700',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoCard: {
    flexBasis: '48%',
    minWidth: 180,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#123524',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 14,
    color: '#5d6d63',
    lineHeight: 20,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 20,
  },
});
