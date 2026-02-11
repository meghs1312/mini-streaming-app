import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import API from '../services/api';
import { clearAll } from '../services/storage';
import ErrorScreen from '../components/ErrorScreen';

interface Video {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  stream_url: string;
  tags: string[];
}

export default function HomeScreen({ navigation, route }: any) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [filterMode, setFilterMode] = useState<'AND' | 'OR'>('AND');

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    // Handle incoming tag from VideoDetailScreen
    if (route.params?.selectedTag) {
      const tag = route.params.selectedTag;
      if (!selectedTags.includes(tag)) {
        setSelectedTags([tag]);
      }
      // Clear the param to avoid re-triggering
      navigation.setParams({ selectedTag: undefined });
    }
  }, [route.params?.selectedTag]);

  useEffect(() => {
    filterVideos();
  }, [searchQuery, selectedTags, videos]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get('/videos');
      setVideos(response.data);
      setFilteredVideos(response.data);
      
      const tags = new Set<string>();
      response.data.forEach((video: Video) => {
        video.tags?.forEach((tag: string) => tags.add(tag));
      });
      setAllTags(Array.from(tags));
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching videos:', error);
      setError(error.response?.data?.message || 'Failed to load videos. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const filterVideos = () => {
    let filtered = videos;

    if (searchQuery.trim()) {
      filtered = filtered.filter(video => {
        const query = searchQuery.toLowerCase();
        const titleMatch = video.title.toLowerCase().includes(query);
        const descriptionMatch = video.description?.toLowerCase().includes(query);
        return titleMatch || descriptionMatch;
      });
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(video => {
        if (filterMode === 'AND') {
          // AND: Video must have ALL selected tags
          return selectedTags.every(tag => video.tags?.includes(tag));
        } else {
          // OR: Video must have AT LEAST ONE selected tag
          return selectedTags.some(tag => video.tags?.includes(tag));
        }
      });
    }

    setFilteredVideos(filtered);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
  };

  const toggleFilterMode = () => {
    setFilterMode(filterMode === 'AND' ? 'OR' : 'AND');
  };

  const handleLogout = async () => {
    await clearAll();
    navigation.replace('Login');
  };

  const renderVideoCard = ({ item }: { item: Video }) => (
    <TouchableOpacity
      style={styles.videoCard}
      onPress={() => navigation.navigate('VideoDetail', { video: item })}
    >
      <Image
        source={{ uri: item.thumbnail_url || 'https://via.placeholder.com/300x170' }}
        style={styles.thumbnail}
      />
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.videoDescription} numberOfLines={2}>
          {item.description}
        </Text>
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  if (error) {
    return <ErrorScreen message={error} onRetry={fetchVideos} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.logo}>NETFLIX</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search videos..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {allTags.length > 0 && (
        <View>
          <View style={styles.filterHeader}>
            <View style={styles.filterHeaderLeft}>
              <Text style={styles.filterTitle}>Categories</Text>
              {selectedTags.length > 0 && (
                <View style={styles.selectedCountBadge}>
                  <Text style={styles.selectedCountText}>{selectedTags.length}</Text>
                </View>
              )}
            </View>
            <View style={styles.filterHeaderRight}>
              {selectedTags.length > 1 && (
                <TouchableOpacity 
                  style={styles.filterModeButton} 
                  onPress={toggleFilterMode}
                >
                  <Text style={styles.filterModeText}>{filterMode}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.expandButton} 
                onPress={() => setShowAllCategories(!showAllCategories)}
              >
                <Text style={styles.expandButtonText}>
                  {showAllCategories ? '▼ Less' : '▶ All'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.filterSection}>
            <FlatList
              horizontal
              data={showAllCategories ? allTags : allTags.slice(0, 5)}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedTags.includes(item) && styles.filterChipActive,
                  ]}
                  onPress={() => toggleTag(item)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedTags.includes(item) && styles.filterChipTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
            {(searchQuery || selectedTags.length > 0) && (
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {selectedTags.length > 0 && (
            <View style={styles.selectedTagsInfo}>
              <Text style={styles.selectedTagsText}>
                Showing videos with {filterMode === 'AND' ? 'ALL' : 'ANY'} of: {selectedTags.join(', ')}
              </Text>
            </View>
          )}
        </View>
      )}

      <FlatList
        data={filteredVideos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderVideoCard}
        contentContainerStyle={styles.videoList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No videos found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: '#000',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    color: '#E50914',
    fontSize: 32,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  searchInput: {
    backgroundColor: '#222',
    color: 'white',
    padding: 12,
    borderRadius: 6,
    fontSize: 16,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  filterHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filterTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  selectedCountBadge: {
    backgroundColor: '#E50914',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  selectedCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterModeButton: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E50914',
  },
  filterModeText: {
    color: '#E50914',
    fontSize: 12,
    fontWeight: 'bold',
  },
  expandButton: {
    backgroundColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  expandButtonText: {
    color: '#aaa',
    fontSize: 12,
  },
  filterSection: {
    paddingVertical: 10,
    paddingLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    backgroundColor: '#222',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterChipActive: {
    backgroundColor: '#E50914',
    borderColor: '#E50914',
  },
  filterChipText: {
    color: '#aaa',
    fontSize: 14,
  },
  filterChipTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#E50914',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedTagsInfo: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#111',
    marginHorizontal: 20,
    marginTop: 5,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#E50914',
  },
  selectedTagsText: {
    color: '#aaa',
    fontSize: 12,
    fontStyle: 'italic',
  },
  videoList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  videoCard: {
    marginBottom: 20,
    backgroundColor: '#111',
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: '#222',
  },
  videoInfo: {
    padding: 12,
  },
  videoTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  videoDescription: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  tagChip: {
    backgroundColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginTop: 4,
  },
  tagText: {
    color: '#aaa',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 16,
  },
});
