import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AgriColors } from '../../constants/theme';
import { ResponsiveShell } from '../../components/ResponsiveShell';
import { useScanStore } from '../../store/scanStore';
import { classifyBreed } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../locales/i18n';

export default function ScannerScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { userMobile, userEmail } = useAuthStore();
  const { t } = useTranslation();

  const setCapturedImage = useScanStore((state) => state.setCapturedImage);
  const setPredictions = useScanStore((state) => state.setPredictions);

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<'on' | 'off'>('off');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cameraRef = useRef<CameraView>(null);
  const identifier = userMobile || userEmail || '1234567890';
  const isWeb = Platform.OS === 'web';

  const handlePickFromGallery = async () => {
    setErrorMessage(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setSelectedImage(uri);
        setCapturedImage(uri);
      }
    } catch (err: any) {
      console.error('Pick image error', err);
      setErrorMessage('Failed to pick image from device.');
    }
  };

  const handleCaptureCamera = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.85,
          skipProcessing: true,
        });
        if (photo) {
          setSelectedImage(photo.uri);
          setCapturedImage(photo.uri);
        }
      } catch (err) {
        console.error('Camera capture error', err);
        setErrorMessage('Failed to capture photo from camera.');
      }
    }
  };

  const handleAnalyzeBreed = async () => {
    if (!selectedImage) return;

    setAnalyzing(true);
    setErrorMessage(null);
    try {
      console.log('Sending image to /predict...');
      const results = await classifyBreed(selectedImage, identifier);
      console.log('Prediction results:', results);

      if (results && results.length > 0) {
        setPredictions(results);
        const topConfidence = results[0].confidence;
        // Distinguish High vs Moderate/Low
        if (topConfidence >= 0.70) {
          router.push('/(stack)/result-high' as any);
        } else {
          router.push('/(stack)/result-low' as any);
        }
      } else {
        setErrorMessage('No predictions returned. Please try a clearer cattle photograph.');
      }
    } catch (err: any) {
      console.error('Analysis failed', err);
      setErrorMessage('Prediction failed. Ensure FastAPI backend is online at http://localhost:8000.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <ResponsiveShell
      title={t.scanTitle}
      subtitle={t.scanSubtitle}
      activeRoute="scanner"
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.scannerWrapper}>
          {/* Main Viewport Box */}
          <View style={styles.viewportBox}>
            {selectedImage ? (
              /* Selected Image Preview */
              <View style={styles.previewContainer}>
                <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="contain" />
                <TouchableOpacity
                  style={styles.clearImageBtn}
                  onPress={() => setSelectedImage(null)}
                  disabled={analyzing}
                >
                  <Ionicons name="close" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            ) : isWeb ? (
              /* Web Upload Box */
              <View style={styles.webUploadBox}>
                <View style={styles.uploadIconCircle}>
                  <MaterialCommunityIcons name="cloud-upload" size={44} color={AgriColors.primary} />
                </View>
                <Text style={styles.uploadTitle}>Upload Cattle Photograph</Text>
                <Text style={styles.uploadSubtitle}>
                  Select an Indian cattle photo (JPG, PNG) for MobileNetV2 classification
                </Text>
                <TouchableOpacity
                  style={styles.browseButton}
                  onPress={handlePickFromGallery}
                  activeOpacity={0.85}
                >
                  <Ionicons name="image" size={18} color="#FFF" />
                  <Text style={styles.browseButtonText}>Browse Files</Text>
                </TouchableOpacity>
              </View>
            ) : permission && permission.granted ? (
              /* Mobile Live Camera View */
              <View style={styles.cameraFrame}>
                <CameraView
                  style={StyleSheet.absoluteFill}
                  ref={cameraRef}
                  facing={facing}
                  enableTorch={flash === 'on'}
                />
                {/* Viewfinder Alignment Reticle */}
                <View style={styles.reticleOverlay}>
                  <View style={styles.reticleBorder} />
                  <Text style={styles.reticleText}>Align Cattle in Frame</Text>
                </View>

                {/* Camera In-View Controls */}
                <View style={styles.cameraTopControls}>
                  <TouchableOpacity
                    style={styles.camIconBtn}
                    onPress={() => setFlash(f => f === 'on' ? 'off' : 'on')}
                  >
                    <Ionicons name={flash === 'on' ? 'flash' : 'flash-off'} size={20} color="#FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.camIconBtn}
                    onPress={() => setFacing(cur => cur === 'back' ? 'front' : 'back')}
                  >
                    <Ionicons name="camera-reverse" size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* Request Camera Permission */
              <View style={styles.permContainer}>
                <Ionicons name="camera-outline" size={44} color={AgriColors.textMuted} />
                <Text style={styles.permTitle}>Camera Permission Required</Text>
                <Text style={styles.permDesc}>
                  Grant camera access to capture cattle in the field, or select an existing photo from your gallery.
                </Text>
                <View style={styles.permButtonsRow}>
                  <TouchableOpacity
                    style={styles.permBtn}
                    onPress={requestPermission}
                  >
                    <Text style={styles.permBtnText}>Grant Access</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.permBtn, { backgroundColor: AgriColors.secondary }]}
                    onPress={handlePickFromGallery}
                  >
                    <Text style={styles.permBtnText}>Use Gallery</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Error Message */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#DC2626" />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          )}

          {/* Action Buttons Below Viewport */}
          <View style={styles.actionControls}>
            {selectedImage ? (
              <View style={styles.selectedControlsRow}>
                <TouchableOpacity
                  style={styles.retakeBtn}
                  onPress={() => setSelectedImage(null)}
                  disabled={analyzing}
                >
                  <Ionicons name="refresh" size={18} color={AgriColors.textMedium} />
                  <Text style={styles.retakeBtnText}>{t.scanRetake}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.analyzeBtn}
                  onPress={handleAnalyzeBreed}
                  disabled={analyzing}
                  activeOpacity={0.85}
                >
                  {analyzing ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={18} color="#FFF" />
                      <Text style={styles.analyzeBtnText}>{t.scanAnalyze}</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : !isWeb && permission?.granted ? (
              <View style={styles.cameraControlsRow}>
                <TouchableOpacity
                  style={styles.gallerySquareBtn}
                  onPress={handlePickFromGallery}
                >
                  <Ionicons name="images" size={24} color={AgriColors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shutterBtn}
                  onPress={handleCaptureCamera}
                  activeOpacity={0.8}
                >
                  <View style={styles.shutterInner} />
                </TouchableOpacity>

                <View style={{ width: 48 }} />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.fullWidthBrowseBtn}
                onPress={handlePickFromGallery}
              >
                <Ionicons name="images-outline" size={20} color="#FFF" />
                <Text style={styles.fullWidthBrowseBtnText}>Select Photo from Device</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Field Photography Instructions Card */}
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb-outline" size={18} color={AgriColors.primary} />
              <Text style={styles.tipsTitle}>{t.scanTipsTitle}</Text>
            </View>

            <View style={styles.tipRow}>
              <Ionicons name="checkmark-circle" size={15} color={AgriColors.primary} style={{ marginTop: 2 }} />
              <Text style={styles.tipText}>{t.scanTip1}</Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons name="checkmark-circle" size={15} color={AgriColors.primary} style={{ marginTop: 2 }} />
              <Text style={styles.tipText}>{t.scanTip2}</Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons name="checkmark-circle" size={15} color={AgriColors.primary} style={{ marginTop: 2 }} />
              <Text style={styles.tipText}>{t.scanTip3}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ResponsiveShell>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  scannerWrapper: {
    gap: 16,
  },
  viewportBox: {
    width: '100%',
    height: 380,
    backgroundColor: '#0F2018',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: AgriColors.border,
  },
  previewContainer: {
    flex: 1,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  clearImageBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webUploadBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  uploadIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AgriColors.pillBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: AgriColors.primaryDark,
  },
  uploadSubtitle: {
    fontSize: 13,
    color: AgriColors.textMuted,
    textAlign: 'center',
    maxWidth: 380,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AgriColors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: 6,
    shadowColor: AgriColors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  browseButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cameraFrame: {
    flex: 1,
    position: 'relative',
  },
  reticleOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reticleBorder: {
    width: 240,
    height: 240,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: 16,
    borderStyle: 'dashed',
  },
  reticleText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cameraTopControls: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    gap: 10,
  },
  camIconBtn: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    gap: 12,
  },
  permTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: AgriColors.textDark,
  },
  permDesc: {
    fontSize: 13,
    color: AgriColors.textMuted,
    textAlign: 'center',
    maxWidth: 380,
    lineHeight: 18,
  },
  permButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  permBtn: {
    backgroundColor: AgriColors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  permBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorBannerText: {
    fontSize: 13,
    color: '#B91C1C',
    fontWeight: '600',
    flex: 1,
  },
  actionControls: {
    width: '100%',
  },
  selectedControlsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  retakeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: AgriColors.border,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  retakeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: AgriColors.textMedium,
  },
  analyzeBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AgriColors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: AgriColors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  analyzeBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
  },
  cameraControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  gallerySquareBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: AgriColors.pillBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AgriColors.border,
  },
  shutterBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: AgriColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: AgriColors.primary,
  },
  fullWidthBrowseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AgriColors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  fullWidthBrowseBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  tipsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: AgriColors.border,
    gap: 10,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: AgriColors.primaryDark,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  tipText: {
    fontSize: 12,
    color: AgriColors.textMedium,
    flex: 1,
    lineHeight: 18,
  },
});
