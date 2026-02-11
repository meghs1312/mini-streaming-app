import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';

const THUMBNAIL =
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&h=450&fit=crop';

export default function VideoDetailScreen({ route, navigation }: any) {
  const { video } = route.params;

  return (
    <ScrollView style={styles.container}>
      {/* ⭐ SAME IMAGE HERE */}
      <Image source={{ uri: THUMBNAIL }} style={styles.thumbnail} />

      <Text style={styles.title}>{video.title}</Text>

      <Text style={styles.desc}>{video.description}</Text>

      <TouchableOpacity
        style={styles.playButton}
        onPress={() =>
          navigation.navigate('Player', { video })
        }
      >
        <Text style={styles.playText}>▶ Play Video</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 15,
  },

  thumbnail: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    marginBottom: 20,
  },

  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  desc: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 25,
  },

  playButton: {
    backgroundColor: '#E50914',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },

  playText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
