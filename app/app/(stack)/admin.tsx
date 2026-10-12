import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AgriColors } from '../../constants/theme';
import { ResponsiveShell } from '../../components/ResponsiveShell';
import { useAuthStore } from '../../store/authStore';
import { getAdminStats, getAdminUsers } from '../../services/api';
import { useTranslation } from '../../locales/i18n';

export default function AdminScreen() {
  const router = useRouter();
  const { userEmail, role } = useAuthStore();
  const { t } = useTranslation();

  const isAdmin = (role && role.toLowerCase() === 'admin') || (userEmail && userEmail.toLowerCase().includes('admin'));

  const [loading, setLoading] = useState(true);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'system' | 'users' | 'scans'>('system');

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.allSettled([
        getAdminStats(),
        getAdminUsers(),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setAdminStats(statsRes.value);
      }
      if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value)) {
        setUsersList(usersRes.value);
      }
    } catch (e) {
      console.error('Admin data load error', e);
    } finally {
      setLoading(false);
    }
  };

  // If not admin, render restricted view
  if (!isAdmin) {
    return (
      <ResponsiveShell title={t.navAdmin} activeRoute="admin">
        <View style={styles.deniedContainer}>
          <View style={styles.deniedIconBox}>
            <Ionicons name="lock-closed" size={44} color="#DC2626" />
          </View>
          <Text style={styles.deniedTitle}>Restricted Access</Text>
          <Text style={styles.deniedSubtitle}>
            This administration console is restricted to verified system administrators. Your account ({userEmail || 'User'}) does not have administrator privileges.
          </Text>
          <TouchableOpacity
            style={styles.deniedBackBtn}
            onPress={() => router.replace('/(tabs)/home')}
          >
            <Ionicons name="arrow-back" size={18} color="#FFF" />
            <Text style={styles.deniedBackBtnText}>Return to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ResponsiveShell>
    );
  }

  const filteredUsers = usersList.filter(u =>
    (u.full_name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <ResponsiveShell
      title={t.navAdmin}
      subtitle="System Health, User Management & Inference Monitoring"
      activeRoute="admin"
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Admin Navigation Pills */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'system' && styles.tabItemActive]}
            onPress={() => setActiveTab('system')}
          >
            <Ionicons name="server-outline" size={16} color={activeTab === 'system' ? '#FFF' : AgriColors.textMedium} />
            <Text style={[styles.tabText, activeTab === 'system' && styles.tabTextActive]}>System Status</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'users' && styles.tabItemActive]}
            onPress={() => setActiveTab('users')}
          >
            <Ionicons name="people-outline" size={16} color={activeTab === 'users' ? '#FFF' : AgriColors.textMedium} />
            <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>
              Users ({usersList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'scans' && styles.tabItemActive]}
            onPress={() => setActiveTab('scans')}
          >
            <Ionicons name="document-text-outline" size={16} color={activeTab === 'scans' ? '#FFF' : AgriColors.textMedium} />
            <Text style={[styles.tabText, activeTab === 'scans' && styles.tabTextActive]}>Scan Logs</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={AgriColors.primary} />
            <Text style={styles.loadingText}>Loading administration metrics...</Text>
          </View>
        ) : (
          <>
            {/* SYSTEM STATUS TAB */}
            {activeTab === 'system' && (
              <View style={styles.tabContent}>
                <View style={styles.metricsGrid}>
                  <View style={styles.metricCard}>
                    <View style={styles.metricHeader}>
                      <Text style={styles.metricTitle}>Server API Status</Text>
                      <View style={styles.liveDot} />
                    </View>
                    <Text style={[styles.metricBig, { color: '#16A34A' }]}>ONLINE</Text>
                    <Text style={styles.metricSub}>FastAPI + Uvicorn Port 8000</Text>
                  </View>

                  <View style={styles.metricCard}>
                    <View style={styles.metricHeader}>
                      <Text style={styles.metricTitle}>Total Registered Users</Text>
                      <Ionicons name="person" size={16} color={AgriColors.primary} />
                    </View>
                    <Text style={styles.metricBig}>{adminStats?.total_users ?? usersList.length}</Text>
                    <Text style={styles.metricSub}>SQLite Database Store</Text>
                  </View>

                  <View style={styles.metricCard}>
                    <View style={styles.metricHeader}>
                      <Text style={styles.metricTitle}>Total Database Scans</Text>
                      <MaterialCommunityIcons name="cow" size={18} color="#0284C7" />
                    </View>
                    <Text style={styles.metricBig}>{adminStats?.total_scans ?? 0}</Text>
                    <Text style={styles.metricSub}>Historical Predictions</Text>
                  </View>

                  <View style={styles.metricCard}>
                    <View style={styles.metricHeader}>
                      <Text style={styles.metricTitle}>Deep Learning Classifier</Text>
                      <Ionicons name="hardware-chip" size={16} color="#9333EA" />
                    </View>
                    <Text style={[styles.metricBig, { fontSize: 20 }]}>MobileNetV2</Text>
                    <Text style={styles.metricSub}>50 Indian Cattle Breeds Ready</Text>
                  </View>
                </View>

                {/* Database Details */}
                <View style={styles.detailCard}>
                  <Text style={styles.detailCardTitle}>Database Storage Overview</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoKey}>Database Engine</Text>
                    <Text style={styles.infoVal}>SQLite 3 with SQLAlchemy ORM</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoKey}>Database File</Text>
                    <Text style={styles.infoVal}>backend/cattle_sense.db</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoKey}>Database Size</Text>
                    <Text style={styles.infoVal}>
                      {adminStats?.db_size_bytes ? `${Math.round(adminStats.db_size_bytes / 1024)} KB` : 'Active'}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoKey}>Image Uploads Storage</Text>
                    <Text style={styles.infoVal}>backend/uploads/ (Local Multipart)</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoKey}>Cloud Redundancy</Text>
                    <Text style={styles.infoVal}>Google Cloud Firestore Configured</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.refreshBtn}
                  onPress={loadAdminData}
                >
                  <Ionicons name="refresh" size={16} color="#FFF" />
                  <Text style={styles.refreshBtnText}>Refresh System Telemetry</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* USERS DIRECTORY TAB */}
            {activeTab === 'users' && (
              <View style={styles.tabContent}>
                <View style={styles.searchBox}>
                  <Ionicons name="search" size={18} color={AgriColors.textLight} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search users by name or email..."
                    placeholderTextColor={AgriColors.textLight}
                    value={userSearch}
                    onChangeText={setUserSearch}
                  />
                  {userSearch ? (
                    <TouchableOpacity onPress={() => setUserSearch('')}>
                      <Ionicons name="close-circle" size={18} color={AgriColors.textMuted} />
                    </TouchableOpacity>
                  ) : null}
                </View>

                <View style={styles.usersList}>
                  {filteredUsers.length === 0 ? (
                    <Text style={styles.emptySearchText}>No users matched your search criteria.</Text>
                  ) : (
                    filteredUsers.map((u, idx) => (
                      <View key={u.id || idx} style={styles.userRowCard}>
                        <View style={styles.userRowAvatar}>
                          <Text style={styles.userRowAvatarText}>
                            {(u.full_name || u.email || 'U').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.userRowInfo}>
                          <Text style={styles.userRowName}>{u.full_name || 'Cattle Officer'}</Text>
                          <Text style={styles.userRowEmail}>{u.email || u.mobile}</Text>
                          {u.location ? <Text style={styles.userRowLocation}>{u.location}</Text> : null}
                        </View>
                        <View style={[styles.roleBadge, u.role === 'Admin' && { backgroundColor: '#FEE2E2' }]}>
                          <Text style={[styles.roleBadgeText, u.role === 'Admin' && { color: '#DC2626' }]}>
                            {u.role || 'Officer'}
                          </Text>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </View>
            )}

            {/* SCAN LOGS TAB */}
            {activeTab === 'scans' && (
              <View style={styles.tabContent}>
                <View style={styles.detailCard}>
                  <Text style={styles.detailCardTitle}>Recent Global Scan Logs</Text>
                  {adminStats?.recent_scans && adminStats.recent_scans.length > 0 ? (
                    adminStats.recent_scans.map((s: any) => (
                      <View key={s.id} style={styles.scanLogRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.scanLogBreed}>{s.breed}</Text>
                          <Text style={styles.scanLogUser}>User: {s.user_mobile} • {s.date}</Text>
                        </View>
                        <View style={styles.scanLogConfBadge}>
                          <Text style={styles.scanLogConfText}>{Math.round(Number(s.confidence) * 100)}%</Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptySearchText}>No global scans registered yet in SQLite database.</Text>
                  )}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </ResponsiveShell>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    gap: 16,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  deniedContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 500,
    alignSelf: 'center',
    gap: 14,
    marginTop: 60,
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AgriColors.border,
  },
  deniedIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deniedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: AgriColors.textDark,
  },
  deniedSubtitle: {
    fontSize: 14,
    color: AgriColors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  deniedBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AgriColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: 8,
  },
  deniedBackBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: AgriColors.border,
    gap: 6,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  tabItemActive: {
    backgroundColor: AgriColors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: AgriColors.textMuted,
  },
  tabTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  loadingBox: {
    padding: 60,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: AgriColors.textMuted,
  },
  tabContent: {
    gap: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: AgriColors.border,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: AgriColors.textMuted,
    textTransform: 'uppercase',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  metricBig: {
    fontSize: 24,
    fontWeight: '800',
    color: AgriColors.primaryDark,
  },
  metricSub: {
    fontSize: 11,
    color: AgriColors.textLight,
    marginTop: 4,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: AgriColors.border,
  },
  detailCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AgriColors.primaryDark,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: AgriColors.borderSubtle,
  },
  infoKey: {
    fontSize: 13,
    color: AgriColors.textMuted,
    fontWeight: '600',
  },
  infoVal: {
    fontSize: 13,
    color: AgriColors.textDark,
    fontWeight: '700',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AgriColors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  refreshBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: AgriColors.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: AgriColors.textDark,
  },
  usersList: {
    gap: 10,
  },
  userRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: AgriColors.border,
    gap: 12,
  },
  userRowAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AgriColors.pillBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userRowAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: AgriColors.primary,
  },
  userRowInfo: {
    flex: 1,
  },
  userRowName: {
    fontSize: 14,
    fontWeight: '700',
    color: AgriColors.textDark,
  },
  userRowEmail: {
    fontSize: 12,
    color: AgriColors.textMuted,
    marginTop: 1,
  },
  userRowLocation: {
    fontSize: 11,
    color: AgriColors.textLight,
  },
  roleBadge: {
    backgroundColor: AgriColors.pillBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: AgriColors.primary,
  },
  emptySearchText: {
    padding: 20,
    textAlign: 'center',
    color: AgriColors.textMuted,
    fontSize: 14,
  },
  scanLogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AgriColors.borderSubtle,
  },
  scanLogBreed: {
    fontSize: 14,
    fontWeight: '700',
    color: AgriColors.textDark,
  },
  scanLogUser: {
    fontSize: 11,
    color: AgriColors.textMuted,
    marginTop: 2,
  },
  scanLogConfBadge: {
    backgroundColor: '#E8F5EE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  scanLogConfText: {
    fontSize: 12,
    fontWeight: '800',
    color: AgriColors.primary,
  },
});
