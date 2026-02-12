import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface ErrorScreenProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorScreen({
  title = 'Something went wrong',
  message = "We couldn't load the data due to a technical issue. Please try again",
  onRetry,
}: ErrorScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.errorCard}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.cloud}>
            <Text style={styles.cloudIcon}>☁</Text>
          </View>
          <View style={styles.server}>
            <View style={styles.serverBody} />
            <View style={styles.serverConnections}>
              <View style={[styles.connection, styles.connectionBroken]} />
              <View style={[styles.connection, styles.connectionBroken]} />
              <View style={styles.connection} />
            </View>
          </View>
        </View>

        {/* Error Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Error Message */}
        <Text style={styles.message}>{message}</Text>

        {/* Retry Button */}
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  illustrationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    height: 80,
  },
  cloud: {
    marginRight: 20,
  },
  cloudIcon: {
    fontSize: 48,
    color: '#87CEEB',
  },
  server: {
    alignItems: 'center',
  },
  serverBody: {
    width: 40,
    height: 50,
    backgroundColor: '#FFA500',
    borderRadius: 4,
    marginBottom: 8,
  },
  serverConnections: {
    flexDirection: 'row',
    gap: 4,
  },
  connection: {
    width: 3,
    height: 20,
    backgroundColor: '#4169E1',
    borderRadius: 2,
  },
  connectionBroken: {
    backgroundColor: '#ccc',
    opacity: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#E50914',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
