import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';

const { width, height } = Dimensions.get('window');

interface QualityOption {
  label: string;
  resolution?: string;
  url?: string; // ⭐ ADDED
}

export default function PlayerScreen({ route, navigation }: any) {
  const { video } = route.params;

  const videoRef = useRef<Video>(null);

  // ⭐ NEW STATE (IMPORTANT)
  const [currentUrl, setCurrentUrl] = useState(video.stream_url);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [currentQuality, setCurrentQuality] = useState('Auto');
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [availableQualities, setAvailableQualities] =
    useState<QualityOption[]>([]);

  // =====================================
  // ⭐ PARSE MASTER PLAYLIST HERE
  // =====================================
  useEffect(() => {
    parseM3U8Manifest();

    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    };
  }, []);

  const parseM3U8Manifest = async () => {
    try {
      const res = await fetch(video.stream_url);
      const text = await res.text();

      const lines = text.split('\n');

      const qualities: QualityOption[] = [
        { label: 'Auto', url: video.stream_url },
      ];

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('#EXT-X-STREAM-INF')) {
          const resolutionMatch =
            lines[i].match(/RESOLUTION=(\d+x\d+)/);

          const nextLine = lines[i + 1];

          if (resolutionMatch && nextLine) {
            const resolution = resolutionMatch[1];
            const label = resolution.split('x')[1] + 'p';

            const fullUrl = new URL(
              nextLine,
              video.stream_url
            ).toString();

            qualities.push({
              label,
              resolution,
              url: fullUrl,
            });
          }
        }
      }

      setAvailableQualities(qualities);
    } catch (err) {
      console.log(err);
    }
  };

  // =====================================
  //  REAL QUALITY SWITCHING
  // =====================================
  const handleQualityChange = async (quality: QualityOption) => {
     const newUrl = quality.url || video.stream_url;

     console.log("switching →", newUrl);   // ⭐ THIS IS THE REAL CHECK

     setCurrentQuality(quality.label);
     setShowQualityMenu(false);
     setCurrentUrl(newUrl);

     if (videoRef.current) {
       await videoRef.current.loadAsync(
         { uri: newUrl },
         { shouldPlay: true }
       );

       console.log("video reloaded ✅");
    }
  };

  // =====================================
  // PLAYER STATUS
  // =====================================
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
      console.log("status loaded:", status.isLoaded);
    if (status.isLoaded) {
      setIsLoading(false);
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);
    }
  };

  // =====================================
  // UI
  // =====================================
  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <TouchableOpacity
        style={styles.videoContainer}
        activeOpacity={1}
      >
        <Video
          ref={videoRef}
          source={{ uri: currentUrl }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        />

        {isLoading && <ActivityIndicator size="large" color="#E50914" />}
      </TouchableOpacity>

      {/* SIMPLE QUALITY BUTTON */}
      {availableQualities.length > 0 && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.qualityButton}
            onPress={() => setShowQualityMenu(true)}
          >
            <Text style={styles.qualityButtonText}>
              Quality: {currentQuality}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* QUALITY MENU */}
      <Modal visible={showQualityMenu} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Quality</Text>
            <ScrollView>
              {availableQualities.map((q, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.qualityOption,
                    q.label === currentQuality && styles.qualityOptionActive,
                  ]}
                  onPress={() => handleQualityChange(q)}
                >
                  <Text
                    style={[
                      styles.qualityOptionText,
                      q.label === currentQuality &&
                        styles.qualityOptionTextActive,
                    ]}
                  >
                    {q.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowQualityMenu(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  videoContainer: {
    width: width,
    height: (width * 9) / 16,
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controls: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'flex-end',
  },
  qualityButton: {
    backgroundColor: '#222',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#444',
  },
  qualityButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '60%',
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  qualityOption: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  qualityOptionActive: {
    backgroundColor: '#222',
  },
  qualityOptionText: {
    color: '#ccc',
    fontSize: 16,
  },
  qualityOptionTextActive: {
    color: '#E50914',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 12,
    backgroundColor: '#E50914',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
