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
  bandwidth?: number;
}

export default function PlayerScreen({ route, navigation }: any) {
  const { video } = route.params;
  const videoRef = useRef<Video>(null);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [currentQuality, setCurrentQuality] = useState('Auto');
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [availableQualities, setAvailableQualities] = useState<QualityOption[]>([
    { label: 'Auto', resolution: 'Adaptive' },
    { label: '1080p', resolution: '1920x1080' },
    { label: '720p', resolution: '1280x720' },
    { label: '480p', resolution: '854x480' },
    { label: '360p', resolution: '640x360' },
  ]);

  useEffect(() => {
    // Parse m3u8 manifest to get available qualities
    parseM3U8Manifest();
    
    // Cleanup: Reset orientation when component unmounts
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  const parseM3U8Manifest = async () => {
    try {
      // In a real implementation, you would fetch and parse the .m3u8 file
      // For now, we'll use default quality options
      // The expo-av Video component handles adaptive streaming automatically
      console.log('HLS stream URL:', video.stream_url);
    } catch (error) {
      console.error('Error parsing manifest:', error);
    }
  };

  const handlePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleQualityChange = async (quality: QualityOption) => {
    setCurrentQuality(quality.label);
    setShowQualityMenu(false);
    
    // For manual quality selection, you would need to:
    // 1. Parse the m3u8 manifest to get variant streams
    // 2. Select the appropriate stream URL based on resolution
    // 3. Reload the video with the new URL
    // Note: expo-av handles adaptive streaming automatically by default
    
    if (quality.label === 'Auto') {
      // Let the player handle adaptive streaming
      console.log('Switched to adaptive streaming');
    } else {
      console.log(`Manually selected quality: ${quality.label}`);
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsLoading(false);
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      // Exit fullscreen - return to portrait
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      setIsFullscreen(false);
    } else {
      // Enter fullscreen - switch to landscape
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      setIsFullscreen(true);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      <TouchableOpacity 
        style={[
          styles.videoContainer,
          isFullscreen && styles.videoContainerFullscreen
        ]} 
        activeOpacity={1}
        onPress={toggleControls}
      >
        <Video
          ref={videoRef}
          source={{ uri: video.stream_url }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={true}
          isLooping={false}
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          useNativeControls={false}
        />

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#E50914" />
            <Text style={styles.loadingText}>Loading video...</Text>
          </View>
        )}

        {showControls && !isLoading && (
          <View style={styles.controlsOverlay}>
            <View style={styles.topControls}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
              
              <View style={styles.topRightControls}>
                <TouchableOpacity
                  style={styles.qualityButton}
                  onPress={() => setShowQualityMenu(true)}
                >
                  <Text style={styles.qualityButtonText}>⚙️ {currentQuality}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.fullscreenButton}
                  onPress={toggleFullscreen}
                >
                  <Text style={styles.fullscreenButtonText}>
                    {isFullscreen ? '⛶' : '⛶'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.playPauseButton}
              onPress={handlePlayPause}
            >
              <Text style={styles.playPauseIcon}>
                {isPlaying ? '⏸' : '▶'}
              </Text>
            </TouchableOpacity>

            <View style={styles.bottomControls}>
              <Text style={styles.timeText}>
                {formatTime(position)} / {formatTime(duration)}
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${(position / duration) * 100}%` }
                  ]} 
                />
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {!isFullscreen && (
        <View style={styles.info}>
          <Text style={styles.title}>{video.title}</Text>
          <Text style={styles.description}>{video.description}</Text>
        </View>
      )}

      <Modal
        visible={showQualityMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQualityMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowQualityMenu(false)}
        >
          <View style={styles.qualityMenu}>
            <Text style={styles.qualityMenuTitle}>Video Quality</Text>
            <ScrollView>
              {availableQualities.map((quality, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.qualityOption,
                    currentQuality === quality.label && styles.qualityOptionActive
                  ]}
                  onPress={() => handleQualityChange(quality)}
                >
                  <Text style={[
                    styles.qualityOptionText,
                    currentQuality === quality.label && styles.qualityOptionTextActive
                  ]}>
                    {quality.label}
                  </Text>
                  {quality.resolution && (
                    <Text style={styles.qualityResolution}>
                      {quality.resolution}
                    </Text>
                  )}
                  {currentQuality === quality.label && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    width: width,
    height: width * 9 / 16,
    backgroundColor: '#000',
    position: 'relative',
  },
  videoContainerFullscreen: {
    width: height,
    height: width,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    paddingTop: 40,
  },
  topRightControls: {
    flexDirection: 'row',
    gap: 10,
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  qualityButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  qualityButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fullscreenButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  fullscreenButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  playPauseButton: {
    alignSelf: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  playPauseIcon: {
    color: 'white',
    fontSize: 32,
  },
  bottomControls: {
    padding: 15,
  },
  timeText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 5,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E50914',
  },
  info: {
    padding: 20,
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    color: '#aaa',
    fontSize: 14,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qualityMenu: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
  },
  qualityMenuTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  qualityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#2a2a2a',
  },
  qualityOptionActive: {
    backgroundColor: '#E50914',
  },
  qualityOptionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  qualityOptionTextActive: {
    color: 'white',
  },
  qualityResolution: {
    color: '#aaa',
    fontSize: 14,
    marginRight: 10,
  },
  checkmark: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
