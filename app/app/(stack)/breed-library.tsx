import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AgriColors } from '../../constants/theme';
import { BREED_DATA, BreedInfo } from '../../constants/breedData';
import { ResponsiveShell } from '../../components/ResponsiveShell';
import { useTranslation } from '../../locales/i18n';

export default function BreedLibraryScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'milch' | 'draft' | 'dual'>('all');
  const [isGrid, setIsGrid] = useState(true);
  const [sortAsc, setSortAsc] = useState(true);

  const numColumns = isGrid ? (width > 900 ? 3 : width > 600 ? 2 : 1) : 1;

  const categories = [
    { key: 'all', label: t.libFilterAll },
    { key: 'milch', label: t.libFilterMilch },
    { key: 'draft', label: t.libFilterDraft },
    { key: 'dual', label: t.libFilterDual },
  ];

  const filteredBreeds = useMemo(() => {
    let breeds = Object.values(BREED_DATA) as BreedInfo[];

    // Category filter
    if (selectedCategory === 'milch') {
      breeds = breeds.filter(b => (b.milkYield || '').toLowerCase().includes('high') || (b.desc || '').toLowerCase().includes('milch') || (b.desc || '').toLowerCase().includes('dairy'));
    } else if (selectedCategory === 'draft') {
      breeds = breeds.filter(b => (b.milkYield || '').toLowerCase().includes('draft') || (b.desc || '').toLowerCase().includes('draft') || (b.desc || '').toLowerCase().includes('draught'));
    } else if (selectedCategory === 'dual') {
      breeds = breeds.filter(b => (b.desc || '').toLowerCase().includes('dual') || (b.milkYield || '').toLowerCase().includes('dual'));
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      breeds = breeds.filter(b =>
        b.name.toLowerCase().includes(q) ||
        (b.origin || '').toLowerCase().includes(q) ||
        (b.desc || '').toLowerCase().includes(q)
      );
    }

    // Sort
    breeds.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name);
      return sortAsc ? cmp : -cmp;
    });

    return breeds;
  }, [search, selectedCategory, sortAsc]);

  const renderCard = ({ item }: { item: BreedInfo }) => {
    return (
      <TouchableOpacity
        style={[styles.card, !isGrid && styles.cardList]}
        activeOpacity={0.8}
        onPress={() => router.push({ pathname: '/(stack)/breed-detail' as any, params: { breed: item.name } })}
      >
        <View style={[styles.imageContainer, !isGrid && styles.imageListContainer]}>
          <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
          <View style={styles.stateBadge}>
            <Ionicons name="location-sharp" size={11} color="#FFF" />
            <Text style={styles.stateBadgeText} numberOfLines={1}>{item.origin || 'India'}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.breedName} numberOfLines={1}>{item.name}</Text>
            <Ionicons name="chevron-forward" size={16} color={AgriColors.textLight} />
          </View>

          <Text style={styles.breedDesc} numberOfLines={2}>
            {item.desc || 'Indigenous cattle breed known for climate resilience.'}
          </Text>

          <View style={styles.cardTagsRow}>
            <View style={styles.tagPill}>
              <Ionicons name="water-outline" size={12} color={AgriColors.primary} />
              <Text style={styles.tagText} numberOfLines={1}>
                {item.milkYield || 'Variable Yield'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ResponsiveShell
      title={t.navBreedLibrary}
      subtitle={t.libSubtitle}
      activeRoute="breeds"
    >
      <View style={styles.container}>
        {/* Search & Controls Header */}
        <View style={styles.controlsBar}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color={AgriColors.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder={t.libSearchPlaceholder}
              placeholderTextColor={AgriColors.textLight}
              value={search}
              onChangeText={setSearch}
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={18} color={AgriColors.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* View Toggles */}
          <View style={styles.viewControls}>
            <TouchableOpacity
              style={[styles.toggleBtn, isGrid && styles.toggleBtnActive]}
              onPress={() => setIsGrid(true)}
            >
              <Ionicons name="grid-outline" size={18} color={isGrid ? '#FFF' : AgriColors.textMedium} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, !isGrid && styles.toggleBtnActive]}
              onPress={() => setIsGrid(false)}
            >
              <Ionicons name="list-outline" size={18} color={!isGrid ? '#FFF' : AgriColors.textMedium} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toggleBtn}
              onPress={() => setSortAsc(!sortAsc)}
            >
              <Ionicons name={sortAsc ? 'arrow-up' : 'arrow-down'} size={18} color={AgriColors.textMedium} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Filter Pills */}
        <View style={styles.categoriesBar}>
          {categories.map((c) => {
            const isSelected = selectedCategory === c.key;
            return (
              <TouchableOpacity
                key={c.key}
                style={[styles.catPill, isSelected && styles.catPillActive]}
                onPress={() => setSelectedCategory(c.key as any)}
              >
                <Text style={[styles.catPillText, isSelected && styles.catPillTextActive]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Count Bar */}
        <View style={styles.countBar}>
          <Text style={styles.countText}>
            Showing <Text style={{ fontWeight: '800', color: AgriColors.primary }}>{filteredBreeds.length}</Text> of 50 Indigenous Indian Breeds
          </Text>
        </View>

        {/* Breeds List / Grid */}
        <FlatList
          key={numColumns}
          data={filteredBreeds}
          keyExtractor={(item) => item.id || item.name}
          renderItem={renderCard}
          numColumns={numColumns}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={44} color={AgriColors.textLight} />
              <Text style={styles.emptyTitle}>No matching breeds found</Text>
              <Text style={styles.emptyText}>Try searching with a different name or clear the filter.</Text>
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => { setSearch(''); setSelectedCategory('all'); }}
              >
                <Text style={styles.resetBtnText}>Clear Search & Filters</Text>
              </TouchableOpacity>
            </View>
          }
        />
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
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: AgriColors.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: AgriColors.textDark,
  },
  viewControls: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AgriColors.border,
    padding: 3,
    gap: 2,
  },
  toggleBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: AgriColors.primary,
  },
  categoriesBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: AgriColors.border,
  },
  catPillActive: {
    backgroundColor: AgriColors.primary,
    borderColor: AgriColors.primary,
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: AgriColors.textMuted,
  },
  catPillTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  countBar: {
    marginBottom: 12,
  },
  countText: {
    fontSize: 13,
    color: AgriColors.textMuted,
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
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: AgriColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardList: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 150,
    position: 'relative',
    backgroundColor: '#E2ECE5',
  },
  imageListContainer: {
    width: 130,
    height: 110,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  stateBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18,53,36,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  stateBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  cardBody: {
    padding: 14,
    flex: 1,
    gap: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breedName: {
    fontSize: 16,
    fontWeight: '800',
    color: AgriColors.textDark,
    flex: 1,
  },
  breedDesc: {
    fontSize: 12,
    color: AgriColors.textMuted,
    lineHeight: 16,
  },
  cardTagsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AgriColors.pillBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: AgriColors.primary,
  },
  emptyContainer: {
    padding: 50,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AgriColors.textDark,
  },
  emptyText: {
    fontSize: 13,
    color: AgriColors.textMuted,
    textAlign: 'center',
  },
  resetBtn: {
    backgroundColor: AgriColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  resetBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
