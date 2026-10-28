import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { useScanStore } from '@/store/scanStore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AgriColors } from '../../constants/theme';
import { BREED_DATA, DEFAULT_BREED } from '../../constants/breedData';
import { ResponsiveShell } from '../../components/ResponsiveShell';
import { useTranslation } from '../../locales/i18n';
import { BreedVideosSection } from '../../components/BreedVideosSection';

export default function ResultHighScreen() {
  const router = useRouter();
  const { capturedImage, predictions, resetScan } = useScanStore();
  const { t } = useTranslation();

  const topPrediction = predictions && predictions.length > 0 ? predictions[0] : { breed: 'Gir', confidence: 0.88 };
  const rawConf = topPrediction.confidence;
  const confPct = Math.round(rawConf <= 1.0 ? rawConf * 100 : rawConf);

  // Look up breed info
  const breedInfo = (topPrediction.breed && BREED_DATA[topPrediction.breed]) || DEFAULT_BREED;

  const handleScanAgain = () => {
    resetScan();
    router.replace('/(tabs)/scanner' as any);
  };

  const handleSaveAndGoHome = () => {
    resetScan();
    router.replace('/(tabs)/records' as any);
  };

  return (
    <ResponsiveShell
      title={t.resTitle}
      subtitle="AI Classification Analysis"
      showBack
      onBack={() => router.back()}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Result Card */}
        <View style={styles.resultCard}>
          {/* Cattle Photograph */}
          <View style={styles.imageBox}>
            <Image
              source={capturedImage ? { uri: capturedImage } : breedInfo.image}
              style={styles.photo}
              resizeMode="cover"
            />
            <View style={styles.imageOverlayBadge}>
              <Ionicons name="sparkles" size={14} color="#FFF" />
              <Text style={styles.imageOverlayText}>AI Identified</Text>
            </View>
          </View>

          {/* Identification Summary */}
          <View style={styles.cardBody}>
            <View style={styles.titleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.breedName}>{topPrediction.breed || 'Unknown'}</Text>
                <Text style={styles.originSubtitle}>
                  <Ionicons name="location" size={13} color={AgriColors.textMuted} /> {breedInfo.origin || 'India'}
                </Text>
              </View>

              <View style={[styles.confidencePill, confPct < 70 && { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.confPctText, confPct < 70 && { color: '#D97706' }]}>{confPct}%</Text>
                <Text style={[styles.confSubText, confPct < 70 && { color: '#B45309' }]}>{t.resConfidence}</Text>
              </View>
            </View>

            {/* Confidence vs Accuracy Disclaimer */}
            <View style={styles.disclaimerBox}>
              <Ionicons name="information-circle-outline" size={18} color={AgriColors.primary} />
              <Text style={styles.disclaimerText}>
                {t.resDisclaimer}
              </Text>
            </View>

            {/* Top 3 Predictions Ranked */}
            {predictions && predictions.length > 1 && (
              <View style={styles.top3Section}>
                <Text style={styles.sectionHeading}>{t.resTop3Predictions}</Text>
                {predictions.slice(0, 3).map((item, idx) => {
                  const pConf = Math.round(item.confidence <= 1.0 ? item.confidence * 100 : item.confidence);
                  return (
                    <View key={idx} style={styles.rankRow}>
                      <View style={styles.rankBadge}>
                        <Text style={styles.rankNumber}>{idx + 1}</Text>
                      </View>
                      <View style={styles.rankDetails}>
                        <View style={styles.rankLabels}>
                          <Text style={styles.rankName}>{item.breed}</Text>
                          <Text style={styles.rankScore}>{pConf}%</Text>
                        </View>
                        <View style={styles.rankTrack}>
                          <View style={[styles.rankFill, { width: `${pConf}%` }]} />
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Breed Key Characteristics */}
            <View style={styles.traitsSection}>
              <Text style={styles.sectionHeading}>{t.resCharacteristics}</Text>
              <View style={styles.traitsList}>
                {breedInfo.traits && breedInfo.traits.map((trait: string, idx: number) => (
                  <View key={idx} style={styles.traitPill}>
                    <Ionicons name="checkmark-circle" size={14} color={AgriColors.primary} />
                    <Text style={styles.traitPillText}>{trait}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Milk Yield & Uses */}
            <View style={styles.metaCardsRow}>
              <View style={styles.metaMiniCard}>
                <Ionicons name="water" size={18} color={AgriColors.primary} />
                <Text style={styles.metaMiniLabel}>{t.resMilkYield}</Text>
                <Text style={styles.metaMiniVal}>{breedInfo.milkYield || 'Variable'}</Text>
              </View>
              <View style={styles.metaMiniCard}>
                <Ionicons name="shield-checkmark" size={18} color="#16A34A" />
                <Text style={styles.metaMiniLabel}>Breed Category</Text>
                <Text style={styles.metaMiniVal}>{breedInfo.type || 'Indigenous'}</Text>
              </View>
            </View>

            {/* Livestock Care & Management Videos (YouTube) */}
            <BreedVideosSection breedName={topPrediction.breed} />

            {/* Action Buttons */}
            <View style={styles.buttonsGroup}>
              <TouchableOpacity
                style={styles.profileBtn}
                onPress={() => router.push({ pathname: '/(stack)/breed-detail' as any, params: { breed: topPrediction.breed } })}
              >
                <Ionicons name="book-outline" size={17} color={AgriColors.primary} />
                <Text style={styles.profileBtnText}>{t.resViewDetails}</Text>
              </TouchableOpacity>

              <View style={styles.primaryActionsRow}>
                <TouchableOpacity
                  style={styles.scanAgainBtn}
                  onPress={handleScanAgain}
                >
                  <Ionicons name="refresh" size={17} color={AgriColors.textMedium} />
                  <Text style={styles.scanAgainBtnText}>{t.resScanAgain}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveHistoryBtn}
                  onPress={handleSaveAndGoHome}
                >
                  <Ionicons name="checkmark-done" size={18} color="#FFF" />
                  <Text style={styles.saveHistoryBtnText}>Save & View Records</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ResponsiveShell>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AgriColors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  imageBox: {
    width: '100%',
    height: 280,
    backgroundColor: '#E2ECE5',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  imageOverlayBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(23,107,69,0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  imageOverlayText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cardBody: {
    padding: 20,
    gap: 18,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  breedName: {
    fontSize: 24,
    fontWeight: '800',
    color: AgriColors.primaryDark,
  },
  originSubtitle: {
    fontSize: 13,
    color: AgriColors.textMuted,
    marginTop: 2,
  },
  confidencePill: {
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(23,107,69,0.2)',
  },
  confPctText: {
    fontSize: 22,
    fontWeight: '800',
    color: AgriColors.primary,
  },
  confSubText: {
    fontSize: 10,
    fontWeight: '700',
    color: AgriColors.primaryDark,
    textTransform: 'uppercase',
  },
  disclaimerBox: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 8,
    alignItems: 'flex-start',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: '#15803D',
    lineHeight: 17,
  },
  top3Section: {
    gap: 10,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: AgriColors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: AgriColors.pillBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: AgriColors.primary,
  },
  rankDetails: {
    flex: 1,
    gap: 4,
  },
  rankLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rankName: {
    fontSize: 13,
    fontWeight: '700',
    color: AgriColors.textDark,
  },
  rankScore: {
    fontSize: 12,
    fontWeight: '700',
    color: AgriColors.textMuted,
  },
  rankTrack: {
    height: 6,
    backgroundColor: '#F0F4F2',
    borderRadius: 3,
    overflow: 'hidden',
  },
  rankFill: {
    height: '100%',
    backgroundColor: AgriColors.primary,
    borderRadius: 3,
  },
  traitsSection: {
    gap: 8,
  },
  traitsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  traitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AgriColors.background,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: AgriColors.border,
  },
  traitPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: AgriColors.textMedium,
  },
  metaCardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaMiniCard: {
    flex: 1,
    backgroundColor: AgriColors.background,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AgriColors.border,
    gap: 2,
  },
  metaMiniLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: AgriColors.textMuted,
    marginTop: 4,
  },
  metaMiniVal: {
    fontSize: 14,
    fontWeight: '800',
    color: AgriColors.textDark,
  },
  buttonsGroup: {
    gap: 10,
    marginTop: 4,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AgriColors.pillBg,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(23,107,69,0.2)',
  },
  profileBtnText: {
    color: AgriColors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  primaryActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  scanAgainBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: AgriColors.border,
    paddingVertical: 13,
    borderRadius: 10,
    gap: 6,
  },
  scanAgainBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: AgriColors.textMedium,
  },
  saveHistoryBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AgriColors.primary,
    paddingVertical: 13,
    borderRadius: 10,
    gap: 6,
    shadowColor: AgriColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  saveHistoryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
});
