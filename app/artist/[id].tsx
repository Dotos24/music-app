import { FontFamily, Typography } from '@/constants/Typography';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { 
  FlatList, 
  Image, 
  SafeAreaView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  StatusBar,
  ImageBackground,
  ScrollView,
  ActivityIndicator,
  Alert 
} from 'react-native';
import axios from 'axios';
import { API_URL } from '@/constants/Config';
import { useAudio } from '@/contexts/AudioContext';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface SongItem {
  _id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  coverAsset?: string;
  coverFilePath?: string;
  coverUrl?: string;
  audioAsset?: string;
  audioFilePath?: string;
  createdAt: string;
  updatedAt: string;
}

interface Album {
  _id: string;
  title: string;
  artist: string;
  coverImage: string;
  songs: SongItem[];
  year?: number;
}

interface Artist {
  _id: string;
  name: string;
  bio?: string;
  imageUrl: string;
}

export default function ArtistScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id } = params;
  
  const [artist, setArtist] = useState<Artist | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { playSong, setCurrentSongPlaylist } = useAudio();
  
  useEffect(() => {
    const fetchArtistData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${API_URL}/api/artists/${id}`);
        
        if (response.data && response.data.artist) {
          setArtist(response.data.artist);
          setAlbums(response.data.albums || []);
          setSongs(response.data.songs || []);
        } else {
          setError('Не вдалося завантажити дані артиста');
        }
      } catch (err: any) {
        console.error(`Error fetching artist: ${err.message}`);
        setError(`Не вдалося завантажити дані артиста: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArtistData();
  }, [id]);
  
  // Helper function to get cover image source
  const getImageSource = (coverPath: string | undefined) => {
    if (!coverPath || coverPath === 'default-artist-image.jpg') {
      return require('@/assets/photo_2025-05-14_21-35-54.jpg');
    }
    
    if (coverPath.startsWith('http')) {
      return { uri: coverPath };
    }
    
    // If path starts with 'assets/' or '/assets'
    if (coverPath.startsWith('assets/') || coverPath.startsWith('/assets/')) {
      let fileName = coverPath;
      if (fileName.startsWith('/')) {
        fileName = fileName.substring(1);
      }
      if (fileName.startsWith('assets/')) {
        fileName = fileName.substring(7);
      }
      return { uri: `${API_URL}/assets/${fileName}` };
    }
    
    return { uri: `${API_URL}/assets/${coverPath}` };
  };
  
  // Format duration to MM:SS
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Handle song play
  const handleSongPlay = (song: SongItem) => {
    playSong(song);
  };
  
  // Handle album press
  const handleAlbumPress = (albumId: string) => {
    router.push({
      pathname: '/(tabs)/music',
      params: { filter: 'albums', albumId }
    });
  };
  
  // Render album item
  const renderAlbumItem = ({ item }: { item: Album }) => {
    return (
      <TouchableOpacity 
        style={styles.albumItem} 
        activeOpacity={0.7}
        onPress={() => handleAlbumPress(item._id)}
      >
        <Image 
          source={getImageSource(item.coverImage)}
          style={styles.albumCover}
          defaultSource={require('@/assets/photo_2025-05-14_21-35-54.jpg')}
        />
        <View style={styles.albumInfo}>
          <Text style={[styles.albumTitle, { color: isDark ? '#FFFFFF' : '#000000' }]} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.albumDetails}>
            <Text style={styles.albumYear}>
              {item.year ? item.year : 'Альбом'} • {item.songs?.length || 0} пісень
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  // Render song item
  const renderSongItem = ({ item, index }: { item: SongItem, index: number }) => {
    return (
      <Animated.View entering={FadeIn.duration(350).delay(index * 50)}>
        <TouchableOpacity
          style={styles.songItem}
          activeOpacity={0.6}
          onPress={() => handleSongPlay(item)}
        >
          <View style={styles.songImageContainer}>
            <Image
              source={getImageSource(item.coverAsset || item.coverFilePath || item.coverUrl)}
              style={styles.songImage}
              defaultSource={require('@/assets/photo_2025-05-14_21-35-54.jpg')}
            />
          </View>
          
          <View style={styles.songInfo}>
            <Text style={[styles.songTitle, { color: isDark ? '#FFFFFF' : '#000000' }]} numberOfLines={1}>
              {item.title}
            </Text>
            {item.album && (
              <Text style={styles.songAlbum} numberOfLines={1}>
                {item.album}
              </Text>
            )}
          </View>
          
          <View style={styles.songActions}>
            <Text style={styles.songDuration}>
              {formatDuration(item.duration)}
            </Text>
            <TouchableOpacity style={styles.playButton}>
              <Ionicons name="play" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
          <Text style={[styles.loadingText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Завантаження...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (error || !artist) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text style={[styles.errorText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            {error || 'Артист не знайдений'}
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Назад</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={[styles.backIconButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
          
          <View style={styles.artistHero}>
            <ImageBackground
              source={getImageSource(artist.imageUrl)}
              style={styles.artistImage}
              defaultSource={require('@/assets/photo_2025-05-14_21-35-54.jpg')}
            >
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.85)']}
                style={styles.gradient}
              >
                <Text style={styles.artistName} numberOfLines={2}>
                  {artist.name}
                </Text>
              </LinearGradient>
            </ImageBackground>
          </View>
        </View>
        
        {artist.bio && (
          <View style={styles.bioContainer}>
            <Text style={[styles.bioHeader, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Про артиста
            </Text>
            <Text style={[styles.bioText, { color: isDark ? '#AAAAAA' : '#555555' }]}>
              {artist.bio}
            </Text>
          </View>
        )}
        
        {albums.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Альбоми
            </Text>
            <FlatList
              data={albums}
              renderItem={renderAlbumItem}
              keyExtractor={item => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              style={styles.albumsList}
            />
          </View>
        )}
        
        {songs.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Пісні
            </Text>
            {songs.map((song, index) => (
              <View key={song._id}>
                {renderSongItem({ item: song, index })}
              </View>
            ))}
          </View>
        )}
        
        <View style={{ height: 40 }} />
      </ScrollView>
      
      <TouchableOpacity 
        style={[styles.playAllButton, { backgroundColor: isDark ? '#1DB954' : '#1DB954' }]}
        onPress={() => {
          if (songs.length > 0) {
            setCurrentSongPlaylist([...songs]);
            playSong(songs[0]);
          } else if (albums.length > 0 && albums[0].songs.length > 0) {
            setCurrentSongPlaylist(albums[0].songs);
            playSong(albums[0].songs[0]);
          } else {
            Alert.alert('Немає пісень', 'На жаль, немає доступних пісень для відтворення');
          }
        }}
      >
        <Ionicons name="play" size={24} color="#FFFFFF" />
        <Text style={styles.playAllButtonText}>Відтворити</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#1DB954',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FontFamily.semiBold,
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    position: 'relative',
  },
  backIconButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    zIndex: 10,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artistHero: {
    width: '100%',
    height: 300,
  },
  artistImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  artistName: {
    fontSize: 32,
    fontFamily: FontFamily.bold,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  bioContainer: {
    padding: 20,
  },
  bioHeader: {
    fontSize: 20,
    fontFamily: FontFamily.semiBold,
    marginBottom: 10,
  },
  bioText: {
    fontSize: 16,
    fontFamily: FontFamily.regular,
    lineHeight: 24,
  },
  sectionContainer: {
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: FontFamily.semiBold,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  albumsList: {
    marginBottom: 15,
  },
  albumItem: {
    width: 150,
    marginRight: 15,
  },
  albumCover: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  albumInfo: {
    marginTop: 8,
  },
  albumTitle: {
    fontSize: 16,
    fontFamily: FontFamily.semiBold,
  },
  albumDetails: {
    flexDirection: 'row',
    marginTop: 4,
  },
  albumYear: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    color: '#888888',
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  songImageContainer: {
    marginRight: 15,
  },
  songImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontFamily: FontFamily.semiBold,
    marginBottom: 4,
  },
  songAlbum: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    color: '#888888',
  },
  songActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  songDuration: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    color: '#888888',
    marginRight: 10,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 30,
    margin: 20,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  playAllButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: FontFamily.semiBold,
    marginLeft: 8,
  },
}); 