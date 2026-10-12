import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AgriColors } from '../../constants/theme';
import { ResponsiveShell } from '../../components/ResponsiveShell';
import { useSettingsStore } from '../../store/settingsStore';
import { useAuthStore } from '../../store/authStore';
import { useTranslation, LanguageCode } from '../../locales/i18n';

export default function SettingsScreen() {
  const router = useRouter();
  const {
    language,
    setLanguage,
    autoSync,
    toggleAutoSync,
    notifications,
    toggleNotifications,
    darkMode,
    toggleDarkMode,
  } = useSettingsStore();

  const { logout, userEmail, displayName } = useAuthStore();
  const { t } = useTranslation();
  const [cacheMessage, setCacheMessage] = useState<string | null>(null);

  const handleClearCache = () => {
    setCacheMessage(t.setCacheCleared);
    setTimeout(() => setCacheMessage(null), 3000);
  };

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  const languages: { code: LanguageCode; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  ];

  return (
    <ResponsiveShell
      title={t.navSettings}
      subtitle="Preferences, Localization & Device Cache"
      activeRoute="settings"
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Language Selection Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="globe-outline" size={20} color={AgriColors.primary} />
            <Text style={styles.cardTitle}>{t.setLanguage}</Text>
          </View>
          <Text style={styles.cardDesc}>
            Choose your interface language. The entire app will update in real time:
          </Text>

          <View style={styles.langGrid}>
            {languages.map((item) => {
              const isSelected = language === item.code;
              return (
                <TouchableOpacity
                  key={item.code}
                  style={[styles.langOption, isSelected && styles.langOptionActive]}
                  onPress={() => setLanguage(item.code)}
                  activeOpacity={0.8}
                >
                  <View style={styles.langRadio}>
                    {isSelected && <View style={styles.langRadioDot} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.langNative, isSelected && styles.langNativeActive]}>
                      {item.native}
                    </Text>
                    <Text style={styles.langLabel}>{item.label}</Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={18} color={AgriColors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Preferences & Toggles Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="options-outline" size={20} color={AgriColors.primary} />
            <Text style={styles.cardTitle}>App Preferences</Text>
          </View>

          <View style={styles.rowItem}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.rowTitle}>Cloud Data Sync</Text>
              <Text style={styles.rowSub}>Automatically backup new scan records to cloud</Text>
            </View>
            <Switch
              value={autoSync}
              onValueChange={toggleAutoSync}
              trackColor={{ false: '#D1D5DB', true: '#A7F3D0' }}
              thumbColor={autoSync ? AgriColors.primary : '#F3F4F6'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.rowItem}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.rowTitle}>Field Notifications</Text>
              <Text style={styles.rowSub}>Alerts for sync completion and system notices</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#D1D5DB', true: '#A7F3D0' }}
              thumbColor={notifications ? AgriColors.primary : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Cache & Storage Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="server-outline" size={20} color={AgriColors.primary} />
            <Text style={styles.cardTitle}>Local Storage & Cache</Text>
          </View>
          <Text style={styles.cardDesc}>
            Manage cached thumbnails, session tokens, and temporary files.
          </Text>

          {cacheMessage && (
            <View style={styles.cacheNotice}>
              <Ionicons name="checkmark-circle" size={16} color={AgriColors.primary} />
              <Text style={styles.cacheNoticeText}>{cacheMessage}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.clearCacheBtn}
            onPress={handleClearCache}
          >
            <Ionicons name="trash-outline" size={16} color={AgriColors.primary} />
            <Text style={styles.clearCacheBtnText}>{t.setClearCache}</Text>
          </TouchableOpacity>
        </View>

        {/* Account Security Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark-outline" size={20} color={AgriColors.primary} />
            <Text style={styles.cardTitle}>Account & Session</Text>
          </View>
          <View style={styles.rowItem}>
            <View>
              <Text style={styles.rowTitle}>{displayName || 'Cattle Officer'}</Text>
              <Text style={styles.rowSub}>{userEmail || 'Active Session'}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={18} color="#DC2626" />
            <Text style={styles.signOutBtnText}>{t.navLogout}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ResponsiveShell>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    gap: 16,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: AgriColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AgriColors.primaryDark,
  },
  cardDesc: {
    fontSize: 13,
    color: AgriColors.textMuted,
    lineHeight: 18,
  },
  langGrid: {
    gap: 10,
    marginTop: 4,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AgriColors.background,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AgriColors.border,
    gap: 12,
  },
  langOptionActive: {
    backgroundColor: '#E8F5EE',
    borderColor: AgriColors.primary,
  },
  langRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: AgriColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  langRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: AgriColors.primary,
  },
  langNative: {
    fontSize: 15,
    fontWeight: '700',
    color: AgriColors.textDark,
  },
  langNativeActive: {
    color: AgriColors.primary,
  },
  langLabel: {
    fontSize: 12,
    color: AgriColors.textMuted,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AgriColors.textDark,
  },
  rowSub: {
    fontSize: 12,
    color: AgriColors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: AgriColors.borderSubtle,
    marginVertical: 4,
  },
  cacheNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5EE',
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  cacheNoticeText: {
    fontSize: 12,
    color: AgriColors.primaryDark,
    fontWeight: '600',
  },
  clearCacheBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AgriColors.pillBg,
    paddingVertical: 11,
    borderRadius: 10,
    gap: 8,
  },
  clearCacheBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: AgriColors.primary,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: 6,
  },
  signOutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
});
