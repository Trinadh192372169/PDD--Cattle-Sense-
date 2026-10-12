import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AgriColors } from '../../constants/theme';
import { ResponsiveShell } from '../../components/ResponsiveShell';
import { useTranslation } from '../../locales/i18n';

export default function ModelInfoScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <ResponsiveShell
      title={t.navModelInfo}
      subtitle="MobileNetV2 Deep Learning Architecture & Pipeline"
      activeRoute="model-info"
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Ionicons name="hardware-chip" size={14} color="#FFF" />
            <Text style={styles.heroBadgeText}>Computer Vision Pipeline</Text>
          </View>
          <Text style={styles.heroTitle}>MobileNetV2 Transfer Learning</Text>
          <Text style={styles.heroSubtitle}>
            CattleSense employs an optimized Convolutional Neural Network (CNN) tailored for edge and mobile
            deployment, identifying 50 indigenous Indian cattle breeds from standard RGB photographs.
          </Text>
        </View>

        {/* Technical Architecture Specs Grid */}
        <View style={styles.grid}>
          <View style={styles.specCard}>
            <View style={[styles.specIconBox, { backgroundColor: '#E8F5EE' }]}>
              <MaterialCommunityIcons name="layers-outline" size={20} color={AgriColors.primary} />
            </View>
            <Text style={styles.specLabel}>Base Architecture</Text>
            <Text style={styles.specValue}>MobileNetV2</Text>
            <Text style={styles.specDetail}>Inverted residual blocks & depthwise separable convolutions</Text>
          </View>

          <View style={styles.specCard}>
            <View style={[styles.specIconBox, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="image-outline" size={20} color="#0284C7" />
            </View>
            <Text style={styles.specLabel}>Input Tensor Shape</Text>
            <Text style={styles.specValue}>224 × 224 × 3</Text>
            <Text style={styles.specDetail}>RGB Normalized float32 [0.0, 1.0]</Text>
          </View>

          <View style={styles.specCard}>
            <View style={[styles.specIconBox, { backgroundColor: '#FEF3C7' }]}>
              <MaterialCommunityIcons name="tag-multiple-outline" size={20} color="#D97706" />
            </View>
            <Text style={styles.specLabel}>Output Classes</Text>
            <Text style={styles.specValue}>50 Breeds</Text>
            <Text style={styles.specDetail}>Softmax activation over Indian indigenous breeds</Text>
          </View>

          <View style={styles.specCard}>
            <View style={[styles.specIconBox, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="flash-outline" size={20} color="#9333EA" />
            </View>
            <Text style={styles.specLabel}>Optimization</Text>
            <Text style={styles.specValue}>Adam Optimizer</Text>
            <Text style={styles.specDetail}>ReduceLROnPlateau & Early Stopping</Text>
          </View>
        </View>

        {/* Step-by-Step Inference Flow */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Inference Pipeline Workflow</Text>
          <Text style={styles.sectionSubtitle}>
            End-to-end data lifecycle from mobile camera frame to top breed prediction:
          </Text>

          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Image Capture & Multipart Upload</Text>
                <Text style={styles.stepDesc}>
                  The client captures an image via Expo Camera or gallery selection and uploads it via HTTP POST to FastAPI <Text style={styles.code}>/predict</Text>.
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Preprocessing & Normalization</Text>
                <Text style={styles.stepDesc}>
                  The image is resized to 224×224 pixels, converted to an RGB NumPy array, and pixel values are scaled to the [0, 1] floating-point range.
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Feature Extraction & Classification</Text>
                <Text style={styles.stepDesc}>
                  Pre-trained ImageNet feature weights extract morphological features (hump size, horn shape, dewlap, coat pattern), followed by customized dense classification layers.
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}><Text style={styles.stepNumberText}>4</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Top-3 Softmax Ranking & DB Persistence</Text>
                <Text style={styles.stepDesc}>
                  The output probabilities are sorted, class index mapping from <Text style={styles.code}>classes.json</Text> is applied, and the top-3 predictions are saved into SQLite and returned to the client.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Responsible AI & Limitations */}
        <View style={styles.sectionCard}>
          <View style={styles.warningHeader}>
            <Ionicons name="shield-half-outline" size={20} color="#D97706" />
            <Text style={[styles.sectionTitle, { color: '#B45309' }]}>Model Limitations & Responsible AI Guidelines</Text>
          </View>

          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color={AgriColors.primary} style={{ marginTop: 2 }} />
              <Text style={styles.bulletText}>
                <Text style={styles.bulletBold}>Confidence vs. Accuracy:</Text> A 95% confidence score indicates high certainty given the visual patterns, but does not guarantee 100% biological breed purity.
              </Text>
            </View>

            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color={AgriColors.primary} style={{ marginTop: 2 }} />
              <Text style={styles.bulletText}>
                <Text style={styles.bulletBold}>Crossbreeds & Hybrids:</Text> First-generation crossbreeds (e.g., HF × Sahiwal) may visually exhibit traits of both parents and cause split confidence between two classes.
              </Text>
            </View>

            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color={AgriColors.primary} style={{ marginTop: 2 }} />
              <Text style={styles.bulletText}>
                <Text style={styles.bulletBold}>Visual Occlusion:</Text> Poor lighting, night shots, partial obstructions, or extreme angles degrade classification performance.
              </Text>
            </View>

            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color={AgriColors.primary} style={{ marginTop: 2 }} />
              <Text style={styles.bulletText}>
                <Text style={styles.bulletBold}>Field Use:</Text> CattleSense is designed as a veterinary and agricultural field assistant tool. Official herd pedigree certification should verify genealogical records.
              </Text>
            </View>
          </View>
        </View>

        {/* Quick CTA to Test */}
        <View style={styles.ctaBox}>
          <Text style={styles.ctaTitle}>Experience the Model in Action</Text>
          <Text style={styles.ctaSubtitle}>
            Capture a live photo or upload an image from your device to run real-time inference.
          </Text>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => router.push('/(tabs)' as any)}
            activeOpacity={0.85}
          >
            <Ionicons name="scan" size={18} color="#FFF" />
            <Text style={styles.ctaBtnText}>Launch AI Scanner</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ResponsiveShell>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    gap: 18,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  heroCard: {
    backgroundColor: AgriColors.primaryDark,
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
    marginBottom: 12,
  },
  heroBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  specCard: {
    flex: 1,
    minWidth: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: AgriColors.border,
  },
  specIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  specLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: AgriColors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  specValue: {
    fontSize: 18,
    fontWeight: '800',
    color: AgriColors.primaryDark,
    marginTop: 2,
    marginBottom: 4,
  },
  specDetail: {
    fontSize: 12,
    color: AgriColors.textMuted,
    lineHeight: 16,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: AgriColors.border,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: AgriColors.primaryDark,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: AgriColors.textMuted,
    marginTop: 2,
    marginBottom: 18,
  },
  stepsList: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AgriColors.pillBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(23,107,69,0.2)',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '800',
    color: AgriColors.primary,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AgriColors.textDark,
    marginBottom: 3,
  },
  stepDesc: {
    fontSize: 13,
    color: AgriColors.textMedium,
    lineHeight: 19,
  },
  code: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
    color: AgriColors.primary,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  bulletList: {
    gap: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: AgriColors.textMedium,
    lineHeight: 19,
  },
  bulletBold: {
    fontWeight: '700',
    color: AgriColors.textDark,
  },
  ctaBox: {
    backgroundColor: '#E8F5EE',
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7E7D4',
    gap: 8,
  },
  ctaTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: AgriColors.primaryDark,
  },
  ctaSubtitle: {
    fontSize: 13,
    color: AgriColors.textMedium,
    textAlign: 'center',
    maxWidth: 420,
    lineHeight: 18,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AgriColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
    gap: 8,
    marginTop: 6,
  },
  ctaBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
