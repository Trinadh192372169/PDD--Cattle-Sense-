import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { AgriColors } from '../../constants/theme';
import { ResponsiveShell } from '../../components/ResponsiveShell';
import { useTranslation } from '../../locales/i18n';

export default function AboutScreen() {
  const { t } = useTranslation();

  return (
    <ResponsiveShell
      title={t.navAbout}
      subtitle="Final-Year CSE Project Architecture & References"
      activeRoute="about"
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Hero */}
        <View style={styles.heroBox}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="cow" size={36} color="#FFF" />
          </View>
          <Text style={styles.appName}>CattleSense</Text>
          <Text style={styles.tagline}>AI-Powered Indigenous Cattle Breed Identification Platform</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Version 2.0 • Final-Year CSE Capstone</Text>
          </View>
        </View>

        {/* Project Scope & Objectives */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Project Overview & Objectives</Text>
          <Text style={styles.cardBody}>
            India has over 50 registered indigenous breeds of cattle, each adapted to unique regional climates,
            agro-ecological niches, and disease profiles. However, crossbreeding and improper field documentation
            have endangered genetic diversity.
          </Text>
          <Text style={styles.cardBody}>
            <Text style={{ fontWeight: '700' }}>CattleSense</Text> provides an AI-driven livestock recognition platform
            enabling field veterinarians, dairy farmers, and agricultural officers to accurately recognize breeds
            directly from handheld device photographs.
          </Text>
        </View>

        {/* Technology Stack Grid */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Full-Stack Architecture</Text>
          <View style={styles.techGrid}>
            <View style={styles.techItem}>
              <View style={[styles.techIcon, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="phone-portrait-outline" size={20} color="#0284C7" />
              </View>
              <Text style={styles.techName}>Frontend</Text>
              <Text style={styles.techDesc}>React Native, Expo SDK 54, Expo Router, TypeScript, Zustand</Text>
            </View>

            <View style={styles.techItem}>
              <View style={[styles.techIcon, { backgroundColor: '#E8F5EE' }]}>
                <Ionicons name="server-outline" size={20} color={AgriColors.primary} />
              </View>
              <Text style={styles.techName}>Backend</Text>
              <Text style={styles.techDesc}>FastAPI (Python 3.10+), Uvicorn ASGI, REST API Endpoints</Text>
            </View>

            <View style={styles.techItem}>
              <View style={[styles.techIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="hardware-chip-outline" size={20} color="#D97706" />
              </View>
              <Text style={styles.techName}>AI / Deep Learning</Text>
              <Text style={styles.techDesc}>MobileNetV2 Transfer Learning, TensorFlow / Keras, 50 Classes</Text>
            </View>

            <View style={styles.techItem}>
              <View style={[styles.techIcon, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="file-tray-full-outline" size={20} color="#9333EA" />
              </View>
              <Text style={styles.techName}>Database & Cloud</Text>
              <Text style={styles.techDesc}>SQLite 3, SQLAlchemy ORM, Google Cloud Firestore, Firebase Auth</Text>
            </View>
          </View>
        </View>

        {/* References & Acknowledgements */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>References & Acknowledgements</Text>
          <View style={styles.refList}>
            <Text style={styles.refItem}>
              1. <Text style={{ fontWeight: '700' }}>ICAR - NBAGR</Text> (National Bureau of Animal Genetic Resources), Karnal: Indigenous cattle breed descriptors and physical standards.
            </Text>
            <Text style={styles.refItem}>
              2. <Text style={{ fontWeight: '700' }}>Sandler et al. (2018)</Text>: MobileNetV2: Inverted Residuals and Linear Bottlenecks (CVPR 2018).
            </Text>
            <Text style={styles.refItem}>
              3. <Text style={{ fontWeight: '700' }}>DAHD</Text> (Department of Animal Husbandry and Dairying, Ministry of Fisheries, Animal Husbandry and Dairying, Govt of India).
            </Text>
          </View>
        </View>
      </ScrollView>
    </ResponsiveShell>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    gap: 16,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  heroBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AgriColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 8,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: AgriColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: AgriColors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    color: AgriColors.primaryDark,
  },
  tagline: {
    fontSize: 13,
    color: AgriColors.textMuted,
    textAlign: 'center',
    maxWidth: 400,
  },
  versionBadge: {
    backgroundColor: AgriColors.pillBg,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '700',
    color: AgriColors.primary,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: AgriColors.border,
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AgriColors.primaryDark,
  },
  cardBody: {
    fontSize: 13,
    color: AgriColors.textMedium,
    lineHeight: 20,
  },
  techGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 6,
  },
  techItem: {
    flex: 1,
    minWidth: 160,
    backgroundColor: AgriColors.background,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AgriColors.border,
    gap: 4,
  },
  techIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  techName: {
    fontSize: 14,
    fontWeight: '700',
    color: AgriColors.textDark,
  },
  techDesc: {
    fontSize: 12,
    color: AgriColors.textMuted,
    lineHeight: 16,
  },
  refList: {
    gap: 10,
    marginTop: 4,
  },
  refItem: {
    fontSize: 12,
    color: AgriColors.textMedium,
    lineHeight: 18,
  },
});
