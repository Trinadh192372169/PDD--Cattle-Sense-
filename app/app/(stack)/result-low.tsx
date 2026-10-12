import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { useScanStore } from '@/store/scanStore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AgriColors } from '../../constants/theme';
import { ResponsiveShell } from '../../components/ResponsiveShell';
import { useTranslation } from '../../locales/i18n';

export default function ResultLowScreen() {
  const router = useRouter();
  const { capturedImage, predictions, resetScan } = useScanStore();
  const { t } = useTranslation();

  const topPrediction = predictions && predictions.length > 0 ? predictions[0] : { breed: 'Undetermined', confidence: 0.45 };
  const rawConf = topPrediction.confidence;
  const confPct = Math.round(rawConf <= 1.0 ? rawConf * 100 : rawConf);

  const handleScanAgain = () => {
    resetScan();
    router.replace('/(tabs)/index' as any);
  };

  return (
    <ResponsiveShell
      title="Low Confidence Result"
      subtitle="Potential visual ambiguity detected"
      showBack
      onBack={() => router.back()}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {capturedImage && (
            <View style={styles.imageBox}>
              <Image source={{ uri: capturedImage }} style={styles.photo} resizeMode="cover" />
            </View>
          )}

          <View style={styles.body}>
            <View style={styles.warningCard}>
              <Ionicons name="warning" size={24} color="#D97706" />
              <View style={{ flex: 1 }}>
                <Text style={styles.warningTitle}>Low Confidence Warning ({confPct}%)</Text>
                <Text style={styles.warningText}>
                  {t.resWarningLowConf}
                </Text>
              </View>
            </View>

            {predictions && predictions.length > 0 && (
              <View style={styles.candidatesBox}>
                <Text style={styles.candidatesTitle}>Closest Identified Candidates:</Text>
                {predictions.slice(0, 3).map((item, idx) => {
                  const pConf = Math.round(item.confidence <= 1.0 ? item.confidence * 100 : item.confidence);
                  return (
                    <View key={idx} style={styles.candidateRow}>
                      <Text style={styles.candName}>{idx + 1}. {item.breed}</Text>
                      <Text style={styles.candScore}>{pConf}% match probability</Text>
                    </View>
                  );
                })}
              </View>
            )}

            <View style={styles.tipsBox}>
              <Text style={styles.tipsHeading}>Recommendations for higher accuracy:</Text>
              <Text style={styles.tipItem}>• Capture animal standing sideways under even outdoor daylight.</Text>
              <Text style={styles.tipItem}>• Keep camera steady at shoulder height of the cattle.</Text>
              <Text style={styles.tipItem}>• Ensure entire silhouette (horns, hump, dewlap) is unobstructed.</Text>
            </View>

            <TouchableOpacity style={styles.retakeBtn} onPress={handleScanAgain}>
              <Ionicons name="camera" size={18} color="#FFF" />
              <Text style={styles.retakeBtnText}>Retake Photo Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ResponsiveShell>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AgriColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  imageBox: {
    width: '100%',
    height: 240,
    backgroundColor: '#E2ECE5',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  body: {
    padding: 20,
    gap: 16,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FCD34D',
    gap: 12,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 18,
  },
  candidatesBox: {
    backgroundColor: AgriColors.background,
    borderRadius: 12,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: AgriColors.border,
  },
  candidatesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AgriColors.textDark,
  },
  candidateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  candName: {
    fontSize: 13,
    fontWeight: '700',
    color: AgriColors.textMedium,
  },
  candScore: {
    fontSize: 13,
    color: AgriColors.textMuted,
  },
  tipsBox: {
    gap: 6,
    paddingHorizontal: 4,
  },
  tipsHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: AgriColors.textDark,
  },
  tipItem: {
    fontSize: 12,
    color: AgriColors.textMuted,
    lineHeight: 18,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AgriColors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 6,
  },
  retakeBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
