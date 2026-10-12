import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Modal,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AgriColors } from '../constants/theme';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import { useTranslation } from '../locales/i18n';

interface ResponsiveShellProps {
  title: string;
  subtitle?: string;
  activeRoute?: string;
  children: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const ResponsiveShell: React.FC<ResponsiveShellProps> = ({
  title,
  subtitle,
  activeRoute = 'dashboard',
  children,
  showBack = false,
  onBack,
  rightAction,
}) => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  const { displayName, userEmail, role, logout } = useAuthStore();
  const { language, setLanguage } = useSettingsStore();
  const { t } = useTranslation();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const isAdmin = (role && role.toLowerCase() === 'admin') || (userEmail && userEmail.toLowerCase().includes('admin'));

  const navItems = [
    { key: 'dashboard', label: t.navDashboard, icon: 'home-outline', route: '/(tabs)/home' },
    { key: 'scanner', label: t.navScanner, icon: 'scan-outline', route: '/(tabs)/index' },
    { key: 'breeds', label: t.navBreedLibrary, icon: 'book-outline', route: '/(stack)/breed-library' },
    { key: 'records', label: t.navHistory, icon: 'time-outline', route: '/(tabs)/records' },
    { key: 'analytics', label: t.navAnalytics, icon: 'bar-chart-outline', route: '/(stack)/analytics' },
    { key: 'model-info', label: t.navModelInfo, icon: 'hardware-chip-outline', route: '/(stack)/model-info' },
    { key: 'profile', label: t.navProfile, icon: 'person-outline', route: '/(tabs)/profile' },
    { key: 'settings', label: t.navSettings, icon: 'settings-outline', route: '/(stack)/settings' },
    { key: 'help', label: t.navHelp, icon: 'help-circle-outline', route: '/(stack)/help' },
    { key: 'about', label: t.navAbout, icon: 'information-circle-outline', route: '/(stack)/about' },
    ...(isAdmin ? [{ key: 'admin', label: t.navAdmin, icon: 'shield-checkmark-outline', route: '/(stack)/admin' }] : []),
  ];

  const handleNavigate = (route: string) => {
    setMobileDrawerOpen(false);
    router.push(route as any);
  };

  const handleLogout = () => {
    setMobileDrawerOpen(false);
    logout();
    router.replace('/(auth)/login');
  };

  const cycleLanguage = () => {
    if (language === 'en') setLanguage('hi');
    else if (language === 'hi') setLanguage('gu');
    else setLanguage('en');
  };

  const langLabel = language === 'en' ? 'EN' : language === 'hi' ? 'हिन्दी' : 'ગુજરાતી';

  // --- DESKTOP SIDEBAR ---
  const renderSidebar = () => (
    <View style={styles.desktopSidebar}>
      {/* Brand Header */}
      <View style={styles.brandContainer}>
        <View style={styles.brandIconBox}>
          <MaterialCommunityIcons name="cow" size={26} color="#FFF" />
        </View>
        <View style={styles.brandTextContainer}>
          <Text style={styles.brandTitle}>CattleSense</Text>
          <Text style={styles.brandSubtitle}>AI Livestock Intelligence</Text>
        </View>
      </View>

      {/* Nav List */}
      <ScrollView style={styles.sidebarNav} showsVerticalScrollIndicator={false}>
        <Text style={styles.sidebarNavHeader}>MAIN MENU</Text>
        {navItems.map((item) => {
          const isActive = activeRoute === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.sidebarNavItem, isActive && styles.sidebarNavItemActive]}
              onPress={() => handleNavigate(item.route)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.icon as any}
                size={19}
                color={isActive ? '#FFF' : AgriColors.textMedium}
                style={styles.sidebarNavIcon}
              />
              <Text
                style={[styles.sidebarNavText, isActive && styles.sidebarNavTextActive]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
              {item.key === 'admin' && (
                <View style={[styles.adminPill, isActive && { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                  <Text style={[styles.adminPillText, isActive && { color: '#FFF' }]}>ADMIN</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Logout Item */}
        <TouchableOpacity
          style={[styles.sidebarNavItem, { marginTop: 12 }]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={19} color="#DC2626" style={styles.sidebarNavIcon} />
          <Text style={[styles.sidebarNavText, { color: '#DC2626' }]}>{t.navLogout}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* User Footer Card */}
      <View style={styles.sidebarUserCard}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>
            {(displayName || 'C').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>{displayName || 'Cattle Officer'}</Text>
          <Text style={styles.userRole} numberOfLines={1}>{isAdmin ? 'System Admin' : (role || 'Field Officer')}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={AgriColors.background} />

      <View style={styles.layoutWrapper}>
        {/* Left Sidebar on Desktop */}
        {isDesktop && renderSidebar()}

        {/* Main Content Area */}
        <View style={styles.mainContentArea}>
          {/* Top Bar */}
          <View style={styles.topHeader}>
            <View style={styles.topHeaderLeft}>
              {/* Back button or Hamburger menu */}
              {showBack ? (
                <TouchableOpacity
                  onPress={onBack ? onBack : () => router.back()}
                  style={styles.headerIconButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="arrow-back" size={22} color={AgriColors.primaryDark} />
                </TouchableOpacity>
              ) : !isDesktop ? (
                <TouchableOpacity
                  onPress={() => setMobileDrawerOpen(true)}
                  style={styles.headerIconButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="menu" size={24} color={AgriColors.primaryDark} />
                </TouchableOpacity>
              ) : null}

              {/* Title & Subtitle */}
              <View style={styles.headerTitles}>
                <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
                {subtitle && <Text style={styles.headerSubtitle} numberOfLines={1}>{subtitle}</Text>}
              </View>
            </View>

            {/* Top Right Controls */}
            <View style={styles.topHeaderRight}>
              {rightAction}

              {/* Language Switcher Pill */}
              <TouchableOpacity
                style={styles.langPill}
                onPress={cycleLanguage}
                activeOpacity={0.8}
              >
                <Ionicons name="globe-outline" size={15} color={AgriColors.primary} />
                <Text style={styles.langPillText}>{langLabel}</Text>
              </TouchableOpacity>

              {/* Quick Scan Action on Desktop */}
              {isDesktop && activeRoute !== 'scanner' && (
                <TouchableOpacity
                  style={styles.quickScanBtn}
                  onPress={() => router.push('/(tabs)' as any)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="scan-circle" size={18} color="#FFF" />
                  <Text style={styles.quickScanBtnText}>{t.dashQuickScan}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Children Scroll Content */}
          <View style={styles.bodyWrapper}>
            {children}
          </View>
        </View>
      </View>

      {/* MOBILE SLIDE-OUT NAVIGATION DRAWER */}
      <Modal
        visible={mobileDrawerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMobileDrawerOpen(false)}
      >
        <View style={styles.drawerOverlay}>
          <TouchableOpacity
            style={styles.drawerBackdrop}
            activeOpacity={1}
            onPress={() => setMobileDrawerOpen(false)}
          />
          <SafeAreaView style={styles.drawerContent} edges={['top', 'bottom']}>
            <View style={styles.drawerHeader}>
              <View style={styles.brandIconBox}>
                <MaterialCommunityIcons name="cow" size={24} color="#FFF" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.brandTitle}>CattleSense</Text>
                <Text style={styles.brandSubtitle}>AI Livestock Intelligence</Text>
              </View>
              <TouchableOpacity
                onPress={() => setMobileDrawerOpen(false)}
                style={styles.drawerCloseBtn}
              >
                <Ionicons name="close" size={22} color={AgriColors.textMedium} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.drawerNavScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.sidebarNavHeader}>NAVIGATION</Text>
              {navItems.map((item) => {
                const isActive = activeRoute === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.sidebarNavItem, isActive && styles.sidebarNavItemActive]}
                    onPress={() => handleNavigate(item.route)}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={isActive ? '#FFF' : AgriColors.textMedium}
                      style={styles.sidebarNavIcon}
                    />
                    <Text
                      style={[styles.sidebarNavText, isActive && styles.sidebarNavTextActive]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}

              <View style={styles.drawerDivider} />

              <TouchableOpacity
                style={[styles.sidebarNavItem, { marginTop: 6 }]}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={20} color="#DC2626" style={styles.sidebarNavIcon} />
                <Text style={[styles.sidebarNavText, { color: '#DC2626' }]}>{t.navLogout}</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.drawerFooter}>
              <Text style={styles.drawerFooterText}>
                Signed in as: <Text style={{ fontWeight: '700' }}>{displayName || 'Officer'}</Text>
              </Text>
              <Text style={styles.drawerFooterRole}>{isAdmin ? 'System Administrator' : (role || 'Field Officer')}</Text>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AgriColors.background,
  },
  layoutWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  // Desktop Sidebar
  desktopSidebar: {
    width: 260,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: AgriColors.border,
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: AgriColors.borderSubtle,
    marginBottom: 16,
  },
  brandIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: AgriColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: AgriColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  brandTextContainer: {
    marginLeft: 12,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AgriColors.primaryDark,
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: AgriColors.textMuted,
  },
  sidebarNav: {
    flex: 1,
  },
  sidebarNavHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: AgriColors.textLight,
    letterSpacing: 1,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  sidebarNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  sidebarNavItemActive: {
    backgroundColor: AgriColors.primary,
    shadowColor: AgriColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  sidebarNavIcon: {
    marginRight: 12,
  },
  sidebarNavText: {
    fontSize: 14,
    fontWeight: '600',
    color: AgriColors.textMedium,
    flex: 1,
  },
  sidebarNavTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  adminPill: {
    backgroundColor: AgriColors.pillBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adminPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: AgriColors.primary,
  },
  sidebarUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: AgriColors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AgriColors.border,
    marginTop: 10,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AgriColors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  userInfo: {
    marginLeft: 10,
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: AgriColors.textDark,
  },
  userRole: {
    fontSize: 11,
    color: AgriColors.textMuted,
  },

  // Main Content Area
  mainContentArea: {
    flex: 1,
    backgroundColor: AgriColors.background,
    display: 'flex',
    flexDirection: 'column',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: AgriColors.border,
  },
  topHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: AgriColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AgriColors.primaryDark,
  },
  headerSubtitle: {
    fontSize: 12,
    color: AgriColors.textMuted,
    marginTop: 1,
  },
  topHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AgriColors.pillBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(23,107,69,0.15)',
  },
  langPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: AgriColors.primary,
  },
  quickScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AgriColors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  quickScanBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  bodyWrapper: {
    flex: 1,
  },

  // Mobile Drawer
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
  },
  drawerBackdrop: {
    flex: 1,
  },
  drawerContent: {
    width: 290,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    justifyContent: 'space-between',
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: AgriColors.border,
    marginBottom: 12,
  },
  drawerCloseBtn: {
    padding: 6,
  },
  drawerNavScroll: {
    flex: 1,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: AgriColors.border,
    marginVertical: 10,
  },
  drawerFooter: {
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: AgriColors.border,
  },
  drawerFooterText: {
    fontSize: 13,
    color: AgriColors.textDark,
  },
  drawerFooterRole: {
    fontSize: 11,
    color: AgriColors.textMuted,
    marginTop: 2,
  },
});
