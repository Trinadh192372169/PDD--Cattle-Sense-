import React, { useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AgriColors } from '../../constants/theme';
import { ResponsiveShell } from '../../components/ResponsiveShell';
import { useAuthStore } from '../../store/authStore';
import { getScans, deleteScan, DEV_BACKEND_URL } from '../../services/api';
import { getFirebaseScans } from '../../services/firebase';
import { getBreedImage } from '../../constants/breedImages';
import { useTranslation } from '../../locales/i18n';

interface UnifiedScan {
  id: string | number;
  breed: string;
  confidence: number;
  date: string;
  location?: string;
  image?: any;
}

export default function RecordsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { userMobile, userEmail, uid } = useAuthStore();
  const { t } = useTranslation();

  const [records, setRecords] = useState<UnifiedScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'confidence'>('date');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [scanToDelete, setScanToDelete] = useState<UnifiedScan | null>(null);

  const identifier = userMobile || userEmail || '1234567890';
  const numColumns = width > 860 ? 2 : 1;

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [identifier, uid])
  );

  const loadRecords = async () => {
    setLoading(true);
    try {
      const allUnified: UnifiedScan[] = [];

      // 1. Try FastAPI backend scans (SQLite)
      try {
        const backendScans = await getScans(identifier);
        if (Array.isArray(backendScans)) {
          backendScans.forEach((s) => {
            const rawConf = Number(s.confidence) || 0;
            const confPct = rawConf <= 1.0 ? rawConf * 100 : rawConf;
            let imgUri = s.image;
            if (imgUri && imgUri.startsWith('/uploads/')) {
              imgUri = `${DEV_BACKEND_URL}${imgUri}`;
            }
            allUnified.push({
              id: s.id,
              breed: s.breed || 'Unknown',
              confidence: Math.round(confPct),
              date: s.date || 'Recent',
              location: s.location || 'India',
              image: imgUri ? { uri: imgUri } : getBreedImage(s.breed),
            });
          });
        }
      } catch (beErr) {
        console.log('Backend scans notice:', beErr);
      }

      // 2. Try Firestore scans if available and not duplicate
      if (uid) {
        try {
          const fbScans = await getFirebaseScans(uid);
          if (Array.isArray(fbScans)) {
            fbScans.forEach((fb) => {
              const alreadyExists = allUnified.some((u) => String(u.id) === String(fb.id));
              if (!alreadyExists) {
                const confPct = Math.round(Number(fb.confidence || 0) * 100);
                allUnified.push({
                  id: fb.id || `fb-${Date.now()}`,
                  breed: fb.breed || 'Unknown',
                  confidence: confPct,
                  date: (fb.created_at || fb.timestamp) ? new Date(((fb.created_at || fb.timestamp).seconds || 0) * 1000).toLocaleDateString() : 'Recent',
                  location: fb.location || 'India',
                  image: fb.image_url ? { uri: fb.image_url } : getBreedImage(fb.breed),
                });
              }
            });
          }
        } catch (fbErr) {
          console.log('Firebase scans notice:', fbErr);
        }
      }

      setRecords(allUnified);
    } catch (e) {
      console.error('Failed to load records', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedRecords = useMemo(() => {
    let result = records.filter((r) =>
      r.breed.toLowerCase().includes(search.toLowerCase()) ||
      (r.location || '').toLowerCase().includes(search.toLowerCase()) ||
      String(r.id).includes(search)
    );

    result.sort((a, b) => {
      if (sortBy === 'confidence') {
        return b.confidence - a.confidence;
      }
      return String(b.date).localeCompare(String(a.date));
    });

    return result;
  }, [records, search, sortBy]);

  const confirmDelete = (item: UnifiedScan) => {
    setScanToDelete(item);
    setDeleteModalVisible(true);
  };

  const handleExecuteDelete = async () => {
    if (!scanToDelete) return;
    try {
      if (typeof scanToDelete.id === 'number' || !isNaN(Number(scanToDelete.id))) {
        await deleteScan(Number(scanToDelete.id));
      }
      setRecords((prev) => prev.filter((r) => r.id !== scanToDelete.id));
    } catch (err) {
      console.error('Delete error', err);
    } finally {
      setDeleteModalVisible(false);
      setScanToDelete(null);
    }
  };

  const renderCard = ({ item }: { item: UnifiedScan }) => {
    const isHighConf = item.confidence >= 80;
    const badgeBg = isHighConf ? '#E8F5EE' : item.confidence >= 60 ? '#FEF3C7' : '#FEE2E2';
    const badgeColor = isHighConf ? AgriColors.primary : item.confidence >= 60 ? '#D97706' : '#DC2626';

    return (
      <View style={styles.card}>
        <View style={styles.cardImageContainer}>
          <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
          <View style={[styles.confidencePill, { backgroundColor: badgeBg }]}>
            <Text style={[styles.confidencePillText, { color: badgeColor }]}>{item.confidence}%</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardTopRow}>
            <Text style={styles.breedName} numberOfLines={1}>{item.breed}</Text>
            <TouchableOpacity
              onPress={() => confirmDelete(item)}
              style={styles.deleteIconBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={17} color="#DC2626" />
            </TouchableOpacity>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={13} color={AgriColors.textMuted} />
              <Text style={styles.metaText}>{item.date}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={13} color={AgriColors.textMuted} />
              <Text style={styles.metaText}>{item.location}</Text>
            </View>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.detailsBtn}
              onPress={() => router.push({ pathname: '/(stack)/breed-detail' as any, params: { breed: item.breed } })}
            >
              <Text style={styles.detailsBtnText}>View Breed Profile</Text>
              <Ionicons name="arrow-forward" size={13} color={AgriColors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ResponsiveShell
      title={t.navHistory}
      subtitle={t.histSubtitle}
      activeRoute="records"
    >
      <View style={styles.container}>
        {/* Search & Sort Controls */}
        <View style={styles.controlsRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={17} color={AgriColors.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder={t.histSearch}
              placeholderTextColor={AgriColors.textLight}
              value={search}
              onChangeText={setSearch}
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={17} color={AgriColors.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Sort Switch */}
          <View style={styles.sortSwitch}>
            <TouchableOpacity
              style={[styles.sortBtn, sortBy === 'date' && styles.sortBtnActive]}
              onPress={() => setSortBy('date')}
            >
              <Text style={[styles.sortBtnText, sortBy === 'date' && styles.sortBtnTextActive]}>Date</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortBtn, sortBy === 'confidence' && styles.sortBtnActive]}
              onPress={() => setSortBy('confidence')}
            >
              <Text style={[styles.sortBtnText, sortBy === 'confidence' && styles.sortBtnTextActive]}>Score</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={AgriColors.primary} />
            <Text style={styles.loadingText}>Loading scan history records...</Text>
          </View>
        ) : (
          <FlatList
            key={numColumns}
            data={filteredAndSortedRecords}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderCard}
            numColumns={numColumns}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="time-outline" size={48} color={AgriColors.textLight} />
                <Text style={styles.emptyTitle}>No Scan Records Found</Text>
                <Text style={styles.emptySubtitle}>
                  {search ? 'No records match your search filter.' : 'Capture cattle photographs to build your identification history.'}
                </Text>
                <TouchableOpacity
                  style={styles.scanNowBtn}
                  onPress={() => router.push('/(tabs)/scanner' as any)}
                >
                  <Ionicons name="camera" size={16} color="#FFF" />
                  <Text style={styles.scanNowBtnText}>Perform First Scan</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          visible={deleteModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalIconBox}>
                <Ionicons name="trash" size={26} color="#DC2626" />
              </View>
              <Text style={styles.modalTitle}>Confirm Deletion</Text>
              <Text style={styles.modalDesc}>
                Are you sure you want to delete the scan record for <Text style={{ fontWeight: '700' }}>{scanToDelete?.breed}</Text>? This action cannot be undone.
              </Text>
              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setDeleteModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>{t.histCancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmDeleteBtn}
                  onPress={handleExecuteDelete}
                >
                  <Text style={styles.confirmDeleteBtnText}>{t.histDelete}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ResponsiveShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: AgriColors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: AgriColors.textDark,
  },
  sortSwitch: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: AgriColors.border,
  },
  sortBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  sortBtnActive: {
    backgroundColor: AgriColors.primary,
  },
  sortBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: AgriColors.textMuted,
  },
  sortBtnTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AgriColors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    flexDirection: 'row',
  },
  cardImageContainer: {
    width: 120,
    height: 120,
    position: 'relative',
    backgroundColor: '#E8F5EE',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  confidencePill: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  confidencePillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breedName: {
    fontSize: 16,
    fontWeight: '800',
    color: AgriColors.primaryDark,
    flex: 1,
  },
  deleteIconBtn: {
    padding: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: AgriColors.textMuted,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 4,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: AgriColors.primary,
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
  emptyContainer: {
    padding: 50,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: AgriColors.textDark,
  },
  emptySubtitle: {
    fontSize: 13,
    color: AgriColors.textMuted,
    textAlign: 'center',
    maxWidth: 360,
  },
  scanNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AgriColors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
    marginTop: 6,
  },
  scanNowBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
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
    maxWidth: 400,
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  modalIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AgriColors.textDark,
  },
  modalDesc: {
    fontSize: 13,
    color: AgriColors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: AgriColors.background,
    borderWidth: 1,
    borderColor: AgriColors.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: AgriColors.textMedium,
  },
  confirmDeleteBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#DC2626',
    alignItems: 'center',
  },
  confirmDeleteBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
});
