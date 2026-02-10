import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';

export default function PlayerScreen({ route, navigation }: any) {
  const { video } = route.params;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.playerContainer}>
        <Text style={styles.placeholderText}>
          HLS Video Player
        </Text>
        <Text style={styles.urlText}>
          {video.stream_url}
        </Text>
        <Text style={styles.infoText}>
          Video player implementation coming soon...
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.title}>{video.title}</Text>
      </View>
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
  playerContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  urlText: {
    color: '#aaa',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
  },
  infoText: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
  },
  info: {
    padding: 20,
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
});
