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
import ErrorScreen from '../components/ErrorScreen';

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
  // Start from the stream_url coming from the backend/database
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
  const [error, setError] = useState<string | null>(null);

  // =====================================
  // ⭐ PARSE MASTER PLAYLIST HERE
  // =====================================
  useEffect(() => {
    console.log('PlayerScreen mounted for video:', {
      id: video.id,
      title: video.title,
      streamUrl: video.stream_url,
    });
    parseM3U8Manifest();

    return () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    };
  }, []);

  const parseM3U8Manifest = async () => {
    try {
      console.log('Parsing HLS manifest from:', video.stream_url);
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

          // Next line after EXT-X-STREAM-INF should be the variant playlist path
          const nextLineRaw = lines[i + 1];
          const nextLine = nextLineRaw && nextLineRaw.trim();

          // Skip if missing or a comment/empty line
          if (resolutionMatch && nextLine && !nextLine.startsWith('#')) {
            const resolution = resolutionMatch[1];
            const label = resolution.split('x')[1] + 'p';

            const fullUrl = new URL(nextLine, video.stream_url).toString();

            qualities.push({
              label,
              resolution,
              url: fullUrl,
            });
          }
        }
      }

      setAvailableQualities(qualities);
      console.log('Available qualities:', qualities);
      setError(null);
    } catch (err: any) {
      console.log('Error parsing manifest:', err);
      setError(
        err.message || 
        'Failed to load video stream. Please check your connection and try again.'
      );
      setIsLoading(false);
    }
  };

  // =====================================
  //  REAL QUALITY SWITCHING
  // =====================================
  const handleQualityChange = async (quality: QualityOption) => {
    const newUrl = quality.url || video.stream_url;

    console.log('switching →', newUrl);

    setCurrentQuality(quality.label);
    setShowQualityMenu(false);
    setCurrentUrl(newUrl);
    setIsLoading(true);

    if (videoRef.current) {
      try {
        // Stop current playback before loading new stream
        await videoRef.current.stopAsync();
      } catch (e) {
        // ignore if not playing yet
      }

      try {
        await videoRef.current.loadAsync(
          { uri: newUrl },
          { shouldPlay: true }
        );
        console.log('video reloaded ✅');
      } catch (e) {
        console.log('error reloading video', e);
        setIsLoading(false);
      }
    }
  };

  // =====================================
  // FULLSCREEN TOGGLE
  // =====================================
  const toggleFullscreen = async () => {
    try {
      if (isFullscreen) {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
        console.log('Exiting fullscreen');
      } else {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE
        );
        console.log('Entering fullscreen');
      }
      setIsFullscreen(!isFullscreen);
    } catch (e) {
      console.log('Error toggling fullscreen', e);
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
  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <ErrorScreen
          message={error}
          onRetry={() => {
            setError(null);
            setIsLoading(true);
            parseM3U8Manifest();
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <TouchableOpacity
        style={[styles.videoContainer, isFullscreen && styles.videoContainerFullscreen]}
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

      {/* SETTINGS BUTTON OVERLAY */}
      <View style={styles.settingsOverlay}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setShowQualityMenu(true)}
        >
          <Text style={styles.settingsIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* QUALITY / SETTINGS MENU */}
      <Modal visible={showQualityMenu} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Player Settings</Text>
            <Text style={styles.sectionTitle}>Video Quality</Text>
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

            <Text style={styles.sectionTitle}>Screen</Text>
            <TouchableOpacity
              style={styles.fullscreenButton}
              onPress={toggleFullscreen}
            >
              <Text style={styles.fullscreenButtonText}>
                {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              </Text>
            </TouchableOpacity>

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
  videoContainerFullscreen: {
    width: height,
    height: width,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  settingsOverlay: {
    position: 'absolute',
    top: 30,
    right: 16,
  },
  settingsButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  settingsIcon: {
    color: '#fff',
    fontSize: 18,
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
  sectionTitle: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
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
  fullscreenButton: {
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: '#222',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  fullscreenButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
