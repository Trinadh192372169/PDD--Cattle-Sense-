import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AgriColors } from '../../constants/theme';
import { ResponsiveShell } from '../../components/ResponsiveShell';
import { useAuthStore } from '../../store/authStore';
import { getAnalytics, getScans } from '../../services/api';
import { useTranslation } from '../../locales/i18n';

export default function AnalyticsScreen() {
  const router = useRouter();
  const { userEmail, userMobile } = useAuthStore();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [rawScans, setRawScans] = useState<any[]>([]);
  const [filterRange, setFilterRange] = useState<'all' | '30d' | 'year'>('all');
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const identifier = userMobile || userEmail || '1234567890';

  useEffect(() => {
    loadData();
  }, [identifier]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load both analytics summary and raw scans
      const [analyticsRes, scansRes] = await Promise.allSettled([
        getAnalytics(identifier),
        getScans(identifier),
      ]);

      if (scansRes.status === 'fulfilled' && Array.isArray(scansRes.value)) {
        setRawScans(scansRes.value);
      }

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value) {
        setAnalyticsData(analyticsRes.value);
      } else if (scansRes.status === 'fulfilled' && Array.isArray(scansRes.value)) {
        // Compute client fallback if backend summary was empty
        computeClientAnalytics(scansRes.value);
      }
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const computeClientAnalytics = (scans: any[]) => {
    const total = scans.length;
    if (total === 0) {
      setAnalyticsData({
        total_scans: 0,
        average_confidence: 0,
        breed_distribution: {},
        monthly_activity: {},
        confidence_brackets: { high: 0, medium: 0, low: 0 },
      });
      return;
    }

    const breedCounts: Record<string, number> = {};
    const monthlyCounts: Record<string, number> = {};
    let totalConf = 0;
    let high = 0;
    let medium = 0;
    let low = 0;

    scans.forEach((s) => {
      const b = s.breed || 'Unknown';
      breedCounts[b] = (breedCounts[b] || 0) + 1;

      const dateStr = s.date || '';
      const mKey = dateStr ? dateStr.substring(0, 7) : 'Recent';
      monthlyCounts[mKey] = (monthlyCounts[mKey] || 0) + 1;

      const c = Number(s.confidence) || 0;
      const cPct = c <= 1.0 ? c * 100 : c;
      totalConf += cPct;

      if (cPct >= 85) high++;
      else if (cPct >= 60) medium++;
      else low++;
    });

    setAnalyticsData({
      total_scans: total,
      average_confidence: Math.round(totalConf / total),
      breed_distribution: breedCounts,
      monthly_activity: monthlyCounts,
      confidence_brackets: { high, medium, low },
    });
  };

  const handleExportCSV = async () => {
    if (rawScans.length === 0) {
      setExportMessage('No scan records available to export.');
      setTimeout(() => setExportMessage(null), 3000);
      return;
    }

    const headers = 'ID,Breed,Confidence,Date,Location\n';
    const rows = rawScans
      .map((s) => `${s.id},"${s.breed}",${s.confidence},"${s.date}","${s.location || 'India'}"`)
      .join('\n');
    const csvContent = headers + rows;

    if (Platform.OS === 'web') {
      try {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `cattlesense_report_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setExportMessage('CSV report downloaded successfully!');
      } catch (e) {
        setExportMessage('Export prepared. Copying to clipboard...');
      }
    } else {
      try {
        await Share.share({
          title: 'CattleSense Scan Report',
          message: csvContent,
        });
      } catch (e) {
        console.log(e);
      }
    }
    setTimeout(() => setExportMessage(null), 4000);
  };

  const totalScans = analyticsData?.total_scans || rawScans.length;
  const avgConf = analyticsData?.average_confidence || 0;
  const breedsDist = analyticsData?.breed_distribution || {};
  const sortedBreeds = Object.entries(breedsDist).sort((a: any, b: any) => b[1] - a[1]);
  const topBreed = sortedBreeds[0]?.[0] || 'None';

  return (
    <ResponsiveShell
      title={t.navAnalytics}
      subtitle="AI Classification Performance & Field Records"
      activeRoute="analytics"
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Actions */}
        <View style={styles.actionHeader}>
          <View style={styles.filterGroup}>
            <TouchableOpacity
              style={[styles.filterPill, filterRange === 'all' && styles.filterPillActive]}
              onPress={() => setFilterRange('all')}
            >
              <Text style={[styles.filterPillText, filterRange === 'all' && styles.filterPillTextActive]}>
                All Time
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterPill, filterRange === '30d' && styles.filterPillActive]}
              onPress={() => setFilterRange('30d')}
            >
              <Text style={[styles.filterPillText, filterRange === '30d' && styles.filterPillTextActive]}>
                Last 30 Days
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.exportBtn}
            onPress={handleExportCSV}
            activeOpacity={0.8}
          >
            <Ionicons name="download-outline" size={17} color="#FFF" />
            <Text style={styles.exportBtnText}>Export CSV Report</Text>
          </TouchableOpacity>
        </View>

        {exportMessage && (
          <View style={styles.exportNotice}>
            <Ionicons name="checkmark-circle" size={18} color={AgriColors.primary} />
            <Text style={styles.exportNoticeText}>{exportMessage}</Text>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={AgriColors.primary} />
            <Text style={styles.loadingText}>Loading analytics records...</Text>
          </View>
        ) : totalScans === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="chart-bell-curve" size={48} color={AgriColors.textLight} />
            <Text style={styles.emptyTitle}>No Analytics Data Yet</Text>
            <Text style={styles.emptySubtitle}>
              Perform cattle breed scans using the camera or gallery to view real analytics charts here.
            </Text>
            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={() => router.push('/(tabs)' as any)}
            >
              <Ionicons name="scan" size={18} color="#FFF" />
              <Text style={styles.emptyActionBtnText}>Start First Scan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* KPI Summary Cards */}
            <View style={styles.kpiGrid}>
              <View style={styles.kpiCard}>
                <View style={[styles.kpiIconBox, { backgroundColor: '#E8F5EE' }]}>
                  <Ionicons name="camera" size={20} color={AgriColors.primary} />
                </View>
                <Text style={styles.kpiValue}>{totalScans}</Text>
                <Text style={styles.kpiLabel}>Total Scans Performed</Text>
              </View>

              <View style={styles.kpiCard}>
                <View style={[styles.kpiIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="shield-checkmark" size={20} color="#D97706" />
                </View>
                <Text style={styles.kpiValue}>{avgConf}%</Text>
                <Text style={styles.kpiLabel}>Avg Model Confidence</Text>
              </View>

              <View style={styles.kpiCard}>
                <View style={[styles.kpiIconBox, { backgroundColor: '#E0F2FE' }]}>
                  <MaterialCommunityIcons name="cow" size={22} color="#0284C7" />
                </View>
                <Text style={styles.kpiValue} numberOfLines={1}>{topBreed}</Text>
                <Text style={styles.kpiLabel}>Most Common Breed</Text>
              </View>

              <View style={styles.kpiCard}>
                <View style={[styles.kpiIconBox, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="albums" size={20} color="#9333EA" />
                </View>
                <Text style={styles.kpiValue}>{sortedBreeds.length}</Text>
                <Text style={styles.kpiLabel}>Distinct Breeds Found</Text>
              </View>
            </View>

            {/* Breed Distribution Breakdown */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Identified Breed Distribution</Text>
                <Text style={styles.sectionBadge}>{sortedBreeds.length} Classes Recorded</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Frequency of cattle breeds identified by the MobileNetV2 classifier in your scans:
              </Text>

              <View style={styles.breedBarsList}>
                {sortedBreeds.map(([bName, count]: any) => {
                  const pct = Math.round((count / totalScans) * 100);
                  return (
                    <View key={bName} style={styles.breedBarRow}>
                      <View style={styles.breedBarLabels}>
                        <Text style={styles.breedBarName}>{bName}</Text>
                        <Text style={styles.breedBarCount}>{count} scans ({pct}%)</Text>
                      </View>
                      <View style={styles.barTrack}>
                        <View style={[styles.barFill, { width: `${Math.max(pct, 4)}%` }]} />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Confidence Brackets Card */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Model Confidence Score Distribution</Text>
              <Text style={styles.sectionDescription}>
                Distribution across confidence thresholds to monitor prediction certainty:
              </Text>

              <View style={styles.bracketGrid}>
                <View style={[styles.bracketBox, { borderColor: '#86EFAC' }]}>
                  <Text style={[styles.bracketNumber, { color: '#16A34A' }]}>
                    {analyticsData?.confidence_brackets?.high || 0}
                  </Text>
                  <Text style={styles.bracketTitle}>High Confidence</Text>
                  <Text style={styles.bracketSub}>Score &gt;= 85%</Text>
                </View>

                <View style={[styles.bracketBox, { borderColor: '#FDE68A' }]}>
                  <Text style={[styles.bracketNumber, { color: '#D97706' }]}>
                    {analyticsData?.confidence_brackets?.medium || 0}
                  </Text>
                  <Text style={styles.bracketTitle}>Moderate Confidence</Text>
                  <Text style={styles.bracketSub}>Score 60% - 84%</Text>
                </View>

                <View style={[styles.bracketBox, { borderColor: '#FECACA' }]}>
                  <Text style={[styles.bracketNumber, { color: '#DC2626' }]}>
                    {analyticsData?.confidence_brackets?.low || 0}
                  </Text>
                  <Text style={styles.bracketTitle}>Low / Ambiguous</Text>
                  <Text style={styles.bracketSub}>Score &lt; 60%</Text>
                </View>
              </View>

              <View style={styles.infoBanner}>
                <Ionicons name="information-circle-outline" size={18} color={AgriColors.primary} />
                <Text style={styles.infoBannerText}>
                  High confidence scores indicate strong visual alignment with reference training classes.
                  Images with partial views or harsh shadows may produce lower certainty.
                </Text>
              </View>
            </View>
          </>
        )}
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
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterGroup: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: AgriColors.border,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  filterPillActive: {
    backgroundColor: AgriColors.primary,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: AgriColors.textMuted,
  },
  filterPillTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AgriColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
    shadowColor: AgriColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  exportBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  exportNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5EE',
    padding: 12,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  exportNoticeText: {
    fontSize: 13,
    fontWeight: '600',
    color: AgriColors.primaryDark,
  },
  loadingBox: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: AgriColors.textMuted,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AgriColors.border,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AgriColors.textDark,
  },
  emptySubtitle: {
    fontSize: 14,
    color: AgriColors.textMuted,
    textAlign: 'center',
    maxWidth: 420,
    lineHeight: 20,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AgriColors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
    marginTop: 8,
  },
  emptyActionBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
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
    shadowRadius: 6,
    elevation: 2,
  },
  kpiIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '800',
    color: AgriColors.primaryDark,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: AgriColors.textMuted,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: AgriColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AgriColors.primaryDark,
  },
  sectionBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: AgriColors.primary,
    backgroundColor: AgriColors.pillBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sectionDescription: {
    fontSize: 13,
    color: AgriColors.textMuted,
    marginBottom: 18,
  },
  breedBarsList: {
    gap: 14,
  },
  breedBarRow: {
    gap: 6,
  },
  breedBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breedBarName: {
    fontSize: 14,
    fontWeight: '700',
    color: AgriColors.textDark,
  },
  breedBarCount: {
    fontSize: 12,
    fontWeight: '600',
    color: AgriColors.textMuted,
  },
  barTrack: {
    height: 9,
    backgroundColor: '#F0F4F2',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: AgriColors.primary,
    borderRadius: 6,
  },
  bracketGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  bracketBox: {
    flex: 1,
    minWidth: 140,
    backgroundColor: AgriColors.background,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  bracketNumber: {
    fontSize: 26,
    fontWeight: '800',
  },
  bracketTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: AgriColors.textDark,
    marginTop: 4,
  },
  bracketSub: {
    fontSize: 11,
    color: AgriColors.textMuted,
    marginTop: 2,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  infoBannerText: {
    fontSize: 12,
    color: '#15803D',
    lineHeight: 18,
    flex: 1,
  },
});
