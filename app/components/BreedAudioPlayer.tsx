import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AgriColors } from '../constants/theme';
import { getBreedAudioUrl } from '../services/api';

export interface BreedAudioPlayerProps {
  breedName: string;
}

const LANGUAGES = [
  { code: 'hi', label: 'हिंदी', english: 'Hindi' },
  { code: 'en', label: 'English', english: 'English' },
  { code: 'te', label: 'తెలుగు', english: 'Telugu' },
  { code: 'ta', label: 'தமிழ்', english: 'Tamil' },
  { code: 'gu', label: 'ગુજરાતી', english: 'Gujarati' },
  { code: 'mr', label: 'मराठी', english: 'Marathi' },
  { code: 'bn', label: 'বাংলা', english: 'Bengali' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', english: 'Punjabi' },
];

export const BreedAudioPlayer: React.FC<BreedAudioPlayerProps> = ({ breedName }) => {
  const [selectedLang, setSelectedLang] = useState('hi');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reference to HTML5 audio element on web or sound object on native
  const webAudioRef = useRef<any>(null);
  const nativeSoundRef = useRef<any>(null);

  // Stop any audio on unmount or breed/lang change
  const stopAudio = async () => {
    try {
      if (Platform.OS === 'web' && webAudioRef.current) {
        webAudioRef.current.pause();
        webAudioRef.current.currentTime = 0;
        webAudioRef.current = null;
      } else if (nativeSoundRef.current) {
        await nativeSoundRef.current.stopAsync?.();
        await nativeSoundRef.current.unloadAsync?.();
        nativeSoundRef.current = null;
      }
    } catch (e) {
      // ignore cleanup errors
    }
    setIsPlaying(false);
    setIsLoading(false);
  };

  useEffect(() => {
    stopAudio();
    return () => {
      stopAudio();
    };
  }, [breedName, selectedLang]);

  const handlePlayToggle = async () => {
    setErrorMsg(null);

    if (isPlaying) {
      await stopAudio();
      return;
    }

    setIsLoading(true);
    const audioUrl = getBreedAudioUrl(breedName, selectedLang);

    if (Platform.OS === 'web') {
      try {
        const audio = new window.Audio(audioUrl);
        webAudioRef.current = audio;

        audio.oncanplaythrough = () => {
          setIsLoading(false);
        };

        audio.onplay = () => {
          setIsPlaying(true);
          setIsLoading(false);
        };

        audio.onpause = () => {
          setIsPlaying(false);
        };

        audio.onended = () => {
          setIsPlaying(false);
        };

        audio.onerror = (e) => {
          console.warn('Web audio playback error:', e);
          setIsLoading(false);
          setIsPlaying(false);
          setErrorMsg('Failed to load audio stream. Make sure the backend is active.');
        };

        await audio.play();
      } catch (err: any) {
        console.warn('Web audio exception:', err);
        setIsLoading(false);
        setIsPlaying(false);
        setErrorMsg('Could not play audio. Check backend connection.');
      }
    } else {
      // Native audio playback (try expo-av dynamically, fallback to Linking)
      try {
        let expoAvModule: any = null;
        try {
          expoAvModule = require('expo-av');
        } catch {
          // not installed
        }

        if (expoAvModule && expoAvModule.Audio) {
          const { sound } = await expoAvModule.Audio.Sound.createAsync(
            { uri: audioUrl },
            { shouldPlay: true }
          );
          nativeSoundRef.current = sound;
          setIsLoading(false);
          setIsPlaying(true);

          sound.setOnPlaybackStatusUpdate((status: any) => {
            if (status.didJustFinish) {
              setIsPlaying(false);
              sound.unloadAsync();
            }
          });
        } else {
          // Fallback: Open stream in default audio player
          setIsLoading(false);
          await Linking.openURL(audioUrl);
        }
      } catch (err: any) {
        console.warn('Native audio exception:', err);
        setIsLoading(false);
        setIsPlaying(false);
        setErrorMsg('Audio stream unavailable. Check server connection.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <Ionicons name="volume-high" size={20} color={AgriColors.primary} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Audio Narration (gTTS)</Text>
            <Text style={styles.headerSubtitle}>Listen to breed features in your language</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.playBtn, isPlaying && styles.playingBtn]}
          onPress={handlePlayToggle}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={18}
              color="#FFF"
              style={{ marginLeft: isPlaying ? 0 : 2 }}
            />
          )}
          <Text style={styles.playBtnText}>
            {isLoading ? 'Loading...' : isPlaying ? 'Pause' : 'Listen'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Language Selector Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.langList}
      >
        {LANGUAGES.map((lang) => {
          const isSelected = selectedLang === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[styles.langChip, isSelected && styles.langChipSelected]}
              onPress={() => {
                if (selectedLang !== lang.code) {
                  setSelectedLang(lang.code);
                }
              }}
            >
              <Text style={[styles.langChipNative, isSelected && styles.langChipTextSelected]}>
                {lang.label}
              </Text>
              <Text style={[styles.langChipEnglish, isSelected && styles.langChipSubSelected]}>
                {lang.english}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {errorMsg && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={15} color="#DC2626" />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      {isPlaying && (
        <View style={styles.activePlayingBanner}>
          <Ionicons name="musical-notes" size={16} color="#16A34A" />
          <Text style={styles.activePlayingText}>
            Playing {breedName} narration in {LANGUAGES.find((l) => l.code === selectedLang)?.english || 'Selected Language'}...
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7FAF8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D2E5DA',
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#E8F5EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AgriColors.primaryDark,
  },
  headerSubtitle: {
    fontSize: 12,
    color: AgriColors.textMuted,
    marginTop: 2,
  },
  playBtn: {
    backgroundColor: AgriColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: AgriColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  playingBtn: {
    backgroundColor: '#DC2626',
  },
  playBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  langList: {
    gap: 8,
    paddingVertical: 4,
  },
  langChip: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  langChipSelected: {
    backgroundColor: AgriColors.primary,
    borderColor: AgriColors.primary,
  },
  langChipNative: {
    fontSize: 13,
    fontWeight: '700',
    color: AgriColors.textDark,
  },
  langChipEnglish: {
    fontSize: 10,
    color: AgriColors.textMuted,
  },
  langChipTextSelected: {
    color: '#FFF',
  },
  langChipSubSelected: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    padding: 8,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    flex: 1,
  },
  activePlayingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F5EE',
    padding: 10,
    borderRadius: 8,
  },
  activePlayingText: {
    fontSize: 12,
    fontWeight: '600',
    color: AgriColors.primaryDark,
  },
});
