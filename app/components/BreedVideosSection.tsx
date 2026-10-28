import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AgriColors } from '../constants/theme';
import { getBreedVideos } from '../services/api';

export interface BreedVideosSectionProps {
  breedName: string;
}

interface VideoItem {
  title: string;
  link: string;
  thumbnail: string;
  duration?: string;
  channel?: string;
}

export const BreedVideosSection: React.FC<BreedVideosSectionProps> = ({ breedName }) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        const results = await getBreedVideos(breedName, 4);
        if (isMounted) {
          if (results && results.length > 0) {
            setVideos(results);
          } else {
            // Default curated search links
            setVideos([
              {
                title: `${breedName} Breed Profile & Dairy Traits`,
                link: `https://www.youtube.com/results?search_query=${encodeURIComponent(breedName + ' cattle buffalo breed documentary')}`,
                thumbnail: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=400&q=80',
                duration: 'Documentary',
                channel: 'National Livestock Care'
              },
              {
                title: `${breedName} Milk Yield & Daily Feed Management`,
                link: `https://www.youtube.com/results?search_query=${encodeURIComponent(breedName + ' milk yield feed management')}`,
                thumbnail: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=400&q=80',
                duration: 'Guide',
                channel: 'Dairy Science India'
              }
            ]);
          }
        }
      } catch (e) {
        if (isMounted) {
          setVideos([
            {
              title: `${breedName} Care & Farming Techniques`,
              link: `https://www.youtube.com/results?search_query=${encodeURIComponent(breedName + ' dairy care')}`,
              thumbnail: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=400&q=80',
              duration: 'Video Guide',
              channel: 'Veterinary Outreach'
            }
          ]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchVideos();
    return () => {
      isMounted = false;
    };
  }, [breedName]);

  const handleOpenVideo = (url: string) => {
    if (url) {
      Linking.openURL(url).catch((err) => console.warn('Could not open YouTube link:', err));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <View style={styles.iconBadge}>
            <Ionicons name="logo-youtube" size={18} color="#EF4444" />
          </View>
          <View>
            <Text style={styles.sectionTitle}>Care & Management Videos</Text>
            <Text style={styles.sectionSubtitle}>Expert video guides for {breedName}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() =>
            handleOpenVideo(
              `https://www.youtube.com/results?search_query=${encodeURIComponent(breedName + ' dairy farming care India')}`
            )
          }
          style={styles.moreBtn}
        >
          <Text style={styles.moreBtnText}>More</Text>
          <Ionicons name="open-outline" size={13} color={AgriColors.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={AgriColors.primary} />
          <Text style={styles.loadingText}>Fetching YouTube care tutorials...</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsRow}
        >
          {videos.map((vid, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.videoCard}
              onPress={() => handleOpenVideo(vid.link)}
              activeOpacity={0.85}
            >
              <View style={styles.thumbnailWrapper}>
                <Image
                  source={{ uri: vid.thumbnail || 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=400&q=80' }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
                <View style={styles.playOverlay}>
                  <Ionicons name="play" size={18} color="#FFF" />
                </View>
                {vid.duration ? (
                  <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>{vid.duration}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.cardDetails}>
                <Text style={styles.videoTitle} numberOfLines={2}>
                  {vid.title}
                </Text>
                <View style={styles.channelRow}>
                  <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
                  <Text style={styles.channelName} numberOfLines={1}>
                    {vid.channel || 'National Dairy Network'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AgriColors.border,
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AgriColors.primaryDark,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: AgriColors.textMuted,
    marginTop: 2,
  },
  moreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#E8F5EE',
  },
  moreBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: AgriColors.primary,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 13,
    color: AgriColors.textMuted,
  },
  cardsRow: {
    gap: 14,
    paddingVertical: 4,
  },
  videoCard: {
    width: 220,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  thumbnailWrapper: {
    width: '100%',
    height: 120,
    backgroundColor: '#1E293B',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -18 }, { translateY: -18 }],
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 2,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  cardDetails: {
    padding: 10,
    gap: 6,
  },
  videoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: AgriColors.textDark,
    lineHeight: 18,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  channelName: {
    fontSize: 11,
    color: AgriColors.textMuted,
    flex: 1,
  },
});
