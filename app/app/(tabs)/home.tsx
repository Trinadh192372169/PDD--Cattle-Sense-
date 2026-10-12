import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AgriColors } from '../../constants/theme';
import { ResponsiveShell } from '../../components/ResponsiveShell';
import { useAuthStore } from '../../store/authStore';
import { getStats, getAnalytics, getScans, DEV_BACKEND_URL } from '../../services/api';
import { getFirebaseProfile, getFirebaseStats, getRecentFirebaseScans } from '../../services/firebase';
import { getBreedImage } from '../../constants/breedImages';
import { useTranslation } from '../../locales/i18n';

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { uid, displayName, userEmail, userMobile, role } = useAuthStore();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalScans: 0, thisMonth: 0, avgConfidence: 0 });
  const [topBreed, setTopBreed] = useState<string>('None');
  const [breedDistribution, setBreedDistribution] = useState<Record<string, number>>({});
  const [recentScans, setRecentScans] = useState<any[]>([]);

  const identifier = userMobile || userEmail || '1234567890';

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [identifier, uid])
  );

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      let total = 0;
      let month = 0;
      let avgConf = 0;
      let breedsMap: Record<string, number> = {};
      const recentList: any[] = [];

      // 1. Fetch from FastAPI Backend (SQLite)
      try {
        const [statsData, analyticsData, scansData] = await Promise.allSettled([
          getStats(identifier),
          getAnalytics(identifier),
          getScans(identifier),
        ]);

        if (statsData.status === 'fulfilled' && statsData.value) {
          total = statsData.value.total_scans || 0;
          month = statsData.value.this_month || 0;
        }

        if (analyticsData.status === 'fulfilled' && analyticsData.value) {
          avgConf = analyticsData.value.average_confidence || 0;
          breedsMap = analyticsData.value.breed_distribution || {};
        }

        if (scansData.status === 'fulfilled' && Array.isArray(scansData.value)) {
          scansData.value.slice(0, 4).forEach((s) => {
            const rawConf = Number(s.confidence) || 0;
            const cPct = rawConf <= 1.0 ? rawConf * 100 : rawConf;
            let imgUri = s.image;
            if (imgUri && imgUri.startsWith('/uploads/')) {
              imgUri = `${DEV_BACKEND_URL}${imgUri}`;
            }
            recentList.push({
              id: s.id,
              breed: s.breed,
              confidence: Math.round(cPct),
              date: s.date || 'Recent',
              image: imgUri ? { uri: imgUri } : getBreedImage(s.breed),
            });
          });
        }
      } catch (beErr) {
        console.log('Backend dashboard data notice:', beErr);
      }

      // 2. Fallback to Firebase if local stats were 0
      if (total === 0 && uid) {
        try {
          const fbStats = await getFirebaseStats(uid);
          if (fbStats) {
            total = fbStats.total_scans || 0;
            month = fbStats.this_month || 0;
          }
          const fbRecent = await getRecentFirebaseScans(uid, 4);
          if (Array.isArray(fbRecent)) {
            fbRecent.forEach((fb) => {
              recentList.push({
                id: fb.id,
                breed: fb.breed,
                confidence: Math.round(Number(fb.confidence || 0) * 100),
                date: (fb.created_at || fb.timestamp) ? new Date(((fb.created_at || fb.timestamp).seconds || 0) * 1000).toLocaleDateString() : 'Recent',
                image: fb.image_url ? { uri: fb.image_url } : getBreedImage(fb.breed),
              });
            });
          }
        } catch (fbErr) {
          console.log('Firebase dashboard data notice:', fbErr);
        }
      }

      // Compute Top Breed
      const sortedBreeds = Object.entries(breedsMap).sort((a: any, b: any) => b[1] - a[1]);
      if (sortedBreeds.length > 0) {
        setTopBreed(sortedBreeds[0][0]);
      } else if (recentList.length > 0) {
        setTopBreed(recentList[0].breed);
      }

      setStats({ totalScans: total, thisMonth: month, avgConfidence: avgConf });
      setBreedDistribution(breedsMap);
      setRecentScans(recentList);
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  const sortedBreedsList = Object.entries(breedDistribution)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 5);

  return (
    <ResponsiveShell
      title={t.navDashboard}
      subtitle={t.dashSubtitle}
      activeRoute="dashboard"
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Welcome Banner */}
        <View style={styles.welcomeBanner}>
          <View style={styles.welcomeLeft}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>
                {(displayName || 'C').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.welcomeTextGroup}>
              <Text style={styles.welcomeGreeting}>{t.dashWelcome},</Text>
              <Text style={styles.welcomeName}>{displayName || 'Cattle Officer'}</Text>
              <Text style={styles.welcomeRoleBadge}>{role || 'Field Veterinarian'}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.heroScanBtn}
            onPress={() => router.push('/(tabs)' as any)}
            activeOpacity={0.85}
          >
            <Ionicons name="scan" size={20} color="#FFF" />
            <Text style={styles.heroScanBtnText}>{t.dashQuickScan}</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Action Navigation Tiles */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.actionTile}
            onPress={() => router.push('/(tabs)' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#E8F5EE' }]}>
              <Ionicons name="scan-circle" size={24} color={AgriColors.primary} />
            </View>
            <Text style={styles.actionTitle}>{t.dashQuickScan}</Text>
            <Text style={styles.actionSub}>Live Camera / Upload</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionTile}
            onPress={() => router.push('/(stack)/breed-library')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="book" size={22} color="#0284C7" />
            </View>
            <Text style={styles.actionTitle}>{t.dashBrowseBreeds}</Text>
            <Text style={styles.actionSub}>50 Indian Breeds</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionTile}
            onPress={() => router.push('/(tabs)/records')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="time" size={22} color="#D97706" />
            </View>
            <Text style={styles.actionTitle}>{t.dashViewHistory}</Text>
            <Text style={styles.actionSub}>Past Identifications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionTile}
            onPress={() => router.push('/(stack)/analytics' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBox, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="bar-chart" size={22} color="#9333EA" />
            </View>
            <Text style={styles.actionTitle}>{t.navAnalytics}</Text>
            <Text style={styles.actionSub}>Reports & Distribution</Text>
          </TouchableOpacity>
        </View>

        {/* KPI Metrics Summary Grid */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabel}>{t.dashTotalScans}</Text>
              <Ionicons name="camera-outline" size={18} color={AgriColors.primary} />
            </View>
            <Text style={styles.kpiValue}>{stats.totalScans}</Text>
            <Text style={styles.kpiSub}>Recorded in SQLite database</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabel}>{t.dashMonthlyScans}</Text>
              <Ionicons name="calendar-outline" size={18} color="#D97706" />
            </View>
            <Text style={[styles.kpiValue, { color: '#D97706' }]}>{stats.thisMonth}</Text>
            <Text style={styles.kpiSub}>Active month activity</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabel}>{t.dashAccuracyEst}</Text>
              <Ionicons name="shield-checkmark-outline" size={18} color="#16A34A" />
            </View>
            <Text style={[styles.kpiValue, { color: '#16A34A' }]}>
              {stats.avgConfidence > 0 ? `${stats.avgConfidence}%` : '85%'}
            </Text>
            <Text style={styles.kpiSub}>MobileNetV2 Transfer Model</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabel}>{t.dashTopBreed}</Text>
              <MaterialCommunityIcons name="cow" size={20} color="#0284C7" />
            </View>
            <Text style={[styles.kpiValue, { fontSize: 20 }]} numberOfLines={1}>{topBreed}</Text>
            <Text style={styles.kpiSub}>Most frequent detection</Text>
          </View>
        </View>

        {/* Activity & Breed Distribution Section */}
        {sortedBreedsList.length > 0 && (
          <View style={styles.contentCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{t.dashActivityOverview}</Text>
              <TouchableOpacity onPress={() => router.push('/(stack)/analytics' as any)}>
                <Text style={styles.cardLink}>View Full Report &rarr;</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.barsContainer}>
              {sortedBreedsList.map(([bName, count]) => {
                const pct = stats.totalScans > 0 ? Math.round((count / stats.totalScans) * 100) : 0;
                return (
                  <View key={bName} style={styles.barItem}>
                    <View style={styles.barLabelRow}>
                      <Text style={styles.barName}>{bName}</Text>
                      <Text style={styles.barVal}>{count} ({pct}%)</Text>
                    </View>
                    <View style={styles.track}>
                      <View style={[styles.fill, { width: `${Math.max(pct, 5)}%` }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Recent Scans Section */}
        <View style={styles.contentCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t.dashRecentScans}</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/records')}>
              <Text style={styles.cardLink}>View All ({stats.totalScans}) &rarr;</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={AgriColors.primary} style={{ marginVertical: 20 }} />
          ) : recentScans.length === 0 ? (
            <View style={styles.emptyRecent}>
              <Ionicons name="camera-reverse-outline" size={40} color={AgriColors.textLight} />
              <Text style={styles.emptyRecentTitle}>No Scans Performed Yet</Text>
              <Text style={styles.emptyRecentSub}>{t.dashNoScans}</Text>
              <TouchableOpacity
                style={styles.startScanBtn}
                onPress={() => router.push('/(tabs)' as any)}
              >
                <Text style={styles.startScanBtnText}>Identify Cattle Now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.recentGrid}>
              {recentScans.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.recentItem}
                  onPress={() => router.push({ pathname: '/(stack)/breed-detail' as any, params: { breed: item.breed } })}
                  activeOpacity={0.8}
                >
                  <Image source={item.image} style={styles.recentImage} resizeMode="cover" />
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentBreed} numberOfLines={1}>{item.breed}</Text>
                    <Text style={styles.recentDate}>{item.date}</Text>
                    <View style={styles.confBadge}>
                      <Text style={styles.confBadgeText}>{item.confidence}% Match</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
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
  welcomeBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: AgriColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    flexWrap: 'wrap',
    gap: 14,
  },
  welcomeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: AgriColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: AgriColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  avatarInitials: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '800',
  },
  welcomeTextGroup: {
    gap: 2,
  },
  welcomeGreeting: {
    fontSize: 13,
    color: AgriColors.textMuted,
    fontWeight: '600',
  },
  welcomeName: {
    fontSize: 20,
    fontWeight: '800',
    color: AgriColors.primaryDark,
  },
  welcomeRoleBadge: {
    fontSize: 11,
    color: AgriColors.primary,
    fontWeight: '700',
    backgroundColor: AgriColors.pillBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  heroScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AgriColors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: AgriColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  heroScanBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  quickActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionTile: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: AgriColors.border,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AgriColors.textDark,
  },
  actionSub: {
    fontSize: 11,
    color: AgriColors.textMuted,
    marginTop: 2,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: AgriColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: AgriColors.textMuted,
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '800',
    color: AgriColors.primaryDark,
  },
  kpiSub: {
    fontSize: 11,
    color: AgriColors.textLight,
    marginTop: 4,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: AgriColors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AgriColors.primaryDark,
  },
  cardLink: {
    fontSize: 13,
    fontWeight: '700',
    color: AgriColors.primary,
  },
  barsContainer: {
    gap: 12,
  },
  barItem: {
    gap: 5,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barName: {
    fontSize: 13,
    fontWeight: '700',
    color: AgriColors.textDark,
  },
  barVal: {
    fontSize: 12,
    fontWeight: '600',
    color: AgriColors.textMuted,
  },
  track: {
    height: 8,
    backgroundColor: '#F0F4F2',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: AgriColors.primary,
    borderRadius: 4,
  },
  emptyRecent: {
    padding: 30,
    alignItems: 'center',
    gap: 10,
  },
  emptyRecentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AgriColors.textDark,
  },
  emptyRecentSub: {
    fontSize: 13,
    color: AgriColors.textMuted,
    textAlign: 'center',
    maxWidth: 360,
  },
  startScanBtn: {
    backgroundColor: AgriColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    marginTop: 6,
  },
  startScanBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  recentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  recentItem: {
    flex: 1,
    minWidth: 160,
    backgroundColor: AgriColors.background,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AgriColors.border,
  },
  recentImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#E2ECE5',
  },
  recentInfo: {
    padding: 10,
    gap: 3,
  },
  recentBreed: {
    fontSize: 14,
    fontWeight: '700',
    color: AgriColors.textDark,
  },
  recentDate: {
    fontSize: 11,
    color: AgriColors.textMuted,
  },
  confBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  confBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: AgriColors.primary,
  },
});
