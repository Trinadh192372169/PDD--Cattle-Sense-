import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AgriColors } from '../../constants/theme';
import { ResponsiveShell } from '../../components/ResponsiveShell';
import { useAuthStore } from '../../store/authStore';
import { getProfile, updateProfile } from '../../services/api';
import { getFirebaseProfile, sendFirebasePasswordReset } from '../../services/firebase';
import { useTranslation } from '../../locales/i18n';

export default function ProfileTab() {
  const router = useRouter();
  const { uid, userEmail, userMobile, displayName, role, setDisplayName, logout } = useAuthStore();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const identifier = userMobile || userEmail || '1234567890';
  const isAdmin = (role && role.toLowerCase() === 'admin') || (userEmail && userEmail.toLowerCase().includes('admin'));

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [identifier, uid])
  );

  const loadProfileData = async () => {
    setLoading(true);
    try {
      let data = null;
      try {
        data = await getProfile(identifier);
      } catch (e) {
        if (uid) {
          data = await getFirebaseProfile(uid);
        }
      }
      setProfileData(data);
      setEditName(data?.full_name || displayName || 'Cattle Officer');
      setEditLocation(data?.location || 'Gujarat District');
      setEditDepartment(data?.department || 'Animal Husbandry Dept');
    } catch (err) {
      console.log('Profile load notice:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      setStatusMessage('Name cannot be empty.');
      return;
    }

    setSaving(true);
    setStatusMessage(null);
    try {
      // Role cannot be changed to Admin by user
      const updated = {
        full_name: editName.trim(),
        email: userEmail || identifier,
        location: editLocation.trim(),
        role: role || 'Field Officer',
      };

      await updateProfile(identifier, updated);
      setDisplayName(editName.trim());
      setProfileData((prev: any) => ({ ...prev, ...updated }));
      setEditModalVisible(false);
      setStatusMessage('Profile updated successfully!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (e) {
      console.error('Update profile error', e);
      setStatusMessage('Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (userEmail && userEmail.includes('@')) {
      try {
        await sendFirebasePasswordReset(userEmail);
        setStatusMessage(`Password reset link sent to ${userEmail}`);
      } catch (e) {
        setStatusMessage('Password reset requested for ' + userEmail);
      }
    } else {
      setStatusMessage('Please sign in with a valid email to receive reset instructions.');
    }
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <ResponsiveShell
      title={t.navProfile}
      subtitle="Officer Identification & Deployment Credentials"
      activeRoute="profile"
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {statusMessage && (
          <View style={styles.noticeBox}>
            <Ionicons name="information-circle" size={18} color={AgriColors.primary} />
            <Text style={styles.noticeText}>{statusMessage}</Text>
          </View>
        )}

        {/* Profile Identity Card */}
        <View style={styles.identityCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>
                {(displayName || 'C').charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.identityDetails}>
            <Text style={styles.officerName}>{displayName || 'Cattle Officer'}</Text>
            <Text style={styles.officerEmail}>{userEmail || 'officer@cattlesense.org'}</Text>
            <View style={styles.roleRow}>
              <View style={[styles.roleBadge, isAdmin && { backgroundColor: '#FEE2E2' }]}>
                <Text style={[styles.roleBadgeText, isAdmin && { color: '#DC2626' }]}>
                  {isAdmin ? 'System Administrator' : (role || 'Field Officer')}
                </Text>
              </View>
              <Text style={styles.deptText}>Dept of Animal Husbandry</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setEditModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="pencil" size={16} color="#FFF" />
            <Text style={styles.editBtnText}>Edit Details</Text>
          </TouchableOpacity>
        </View>

        {/* Information Fields Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Credentials & Field Deployment</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Ionicons name="person-outline" size={18} color={AgriColors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoKey}>Full Name</Text>
              <Text style={styles.infoVal}>{displayName || 'Cattle Officer'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.infoIconBox, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="mail-outline" size={18} color="#0284C7" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoKey}>Email Address</Text>
              <Text style={styles.infoVal}>{userEmail || 'officer@cattlesense.org'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.infoIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="location-outline" size={18} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoKey}>Field Jurisdiction / District</Text>
              <Text style={styles.infoVal}>{profileData?.location || 'Anand & Saurashtra Region'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.infoIconBox, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="shield-outline" size={18} color="#9333EA" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoKey}>Security Role</Text>
              <Text style={styles.infoVal}>{isAdmin ? 'Full Administrator' : 'Veterinarian / Field Officer'}</Text>
            </View>
          </View>
        </View>

        {/* Account Security & Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Security</Text>

          <TouchableOpacity
            style={styles.actionRowBtn}
            onPress={handlePasswordReset}
          >
            <View style={styles.actionLeft}>
              <Ionicons name="key-outline" size={20} color={AgriColors.primary} />
              <View>
                <Text style={styles.actionTitle}>Request Password Reset</Text>
                <Text style={styles.actionSub}>Sends a secure reset link to your email</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={AgriColors.textLight} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.actionRowBtn}
            onPress={handleLogout}
          >
            <View style={styles.actionLeft}>
              <Ionicons name="log-out-outline" size={20} color="#DC2626" />
              <View>
                <Text style={[styles.actionTitle, { color: '#DC2626' }]}>{t.navLogout}</Text>
                <Text style={styles.actionSub}>End your active session on this device</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>

        {/* Edit Profile Modal */}
        <Modal
          visible={editModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Edit Profile Information</Text>
              <Text style={styles.modalSubtitle}>
                Update your field deployment and display credentials. Role privileges cannot be altered here.
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Full Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Officer Name"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Location / District</Text>
                <TextInput
                  style={styles.formInput}
                  value={editLocation}
                  onChangeText={setEditLocation}
                  placeholder="District / State"
                />
              </View>

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setEditModalVisible(false)}
                  disabled={saving}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalSaveBtn}
                  onPress={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.modalSaveText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5EE',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 8,
  },
  noticeText: {
    fontSize: 13,
    color: AgriColors.primaryDark,
    fontWeight: '600',
  },
  identityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
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
  avatarWrapper: {},
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: AgriColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFF',
  },
  identityDetails: {
    flex: 1,
    minWidth: 180,
    gap: 3,
  },
  officerName: {
    fontSize: 18,
    fontWeight: '800',
    color: AgriColors.primaryDark,
  },
  officerEmail: {
    fontSize: 13,
    color: AgriColors.textMuted,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  roleBadge: {
    backgroundColor: AgriColors.pillBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: AgriColors.primary,
  },
  deptText: {
    fontSize: 11,
    color: AgriColors.textLight,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AgriColors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  editBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: AgriColors.border,
    gap: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AgriColors.primaryDark,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: AgriColors.pillBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoKey: {
    fontSize: 11,
    fontWeight: '700',
    color: AgriColors.textMuted,
    textTransform: 'uppercase',
  },
  infoVal: {
    fontSize: 14,
    fontWeight: '700',
    color: AgriColors.textDark,
    marginTop: 1,
  },
  actionRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: AgriColors.textDark,
  },
  actionSub: {
    fontSize: 12,
    color: AgriColors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: AgriColors.borderSubtle,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 24,
    gap: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AgriColors.primaryDark,
  },
  modalSubtitle: {
    fontSize: 12,
    color: AgriColors.textMuted,
    lineHeight: 18,
  },
  formGroup: {
    gap: 6,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: AgriColors.textDark,
    textTransform: 'uppercase',
  },
  formInput: {
    backgroundColor: AgriColors.background,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: AgriColors.border,
    fontSize: 14,
    color: AgriColors.textDark,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: AgriColors.background,
    borderWidth: 1,
    borderColor: AgriColors.border,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: AgriColors.textMedium,
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: AgriColors.primary,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
});
