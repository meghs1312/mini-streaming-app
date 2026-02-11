import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import ErrorScreen from '../components/ErrorScreen';

const { width } = Dimensions.get('window');

export default function VideoDetailScreen({ route, navigation }: any) {
  const { video } = route.params || {};

  const handleTagPress = (tag: string) => {
    navigation.navigate('Home', { selectedTag: tag });
  };

  const handlePlayVideo = () => {
    navigation.navigate('Player', { video });
  };

  if (!video) {
    return (
      <ErrorScreen 
        message="Video not found. The video you're looking for doesn't exist or has been removed."
        onRetry={() => navigation.goBack()}
        showRetry={false}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.thumbnailContainer}>
          <View style={styles.thumbnail}>
            <TouchableOpacity style={styles.playButton} onPress={handlePlayVideo}>
              <Text style={styles.playIcon}>▶</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{video.title}</Text>
          
          <Text style={styles.description}>{video.description}</Text>

          {video.tags && video.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.tagsLabel}>Tags:</Text>
              <View style={styles.tagsContainer}>
                {video.tags.map((tag: string, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.tagChip}
                    onPress={() => handleTagPress(tag)}
                  >
                    <Text style={styles.tagText}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.watchButton} onPress={handlePlayVideo}>
            <Text style={styles.watchButtonText}>▶ Watch Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  thumbnailContainer: {
    width: '100%',
    height: 220,
    backgroundColor: '#222',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: 'white',
    fontSize: 30,
    marginLeft: 5,
  },
  content: {
    padding: 20,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  description: {
    color: '#aaa',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  tagsSection: {
    marginBottom: 25,
  },
  tagsLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#555',
  },
  tagText: {
    color: 'white',
    fontSize: 14,
  },
  watchButton: {
    backgroundColor: '#E50914',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  watchButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
