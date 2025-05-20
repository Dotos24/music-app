import { FontFamily, Typography } from '@/constants/Typography';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
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
import { BlurView } from 'expo-blur';

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
  const [showFullBio, setShowFullBio] = useState(false);
  
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
  
  const truncateBio = (bio: string) => {
    if (!bio) return '';
    if (bio.length <= 200 || showFullBio) return bio;
    return bio.substring(0, 200) + '...';
  };
  
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
                
                {songs.length > 0 && (
                  <Text style={styles.artistStats}>
                    {songs.length} пісень • {albums.length} альбомів
                  </Text>
                )}
              </LinearGradient>
            </ImageBackground>
          </View>
        </View>
        
        {artist.bio ? (
          <Animated.View 
            style={styles.bioContainer}
            entering={FadeIn.duration(500)}
          >
            <View style={styles.bioHeaderContainer}>
              <Text style={[styles.bioHeader, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Біографія
              </Text>
              <MaterialIcons name="verified" size={20} color="#1DB954" />
            </View>
            <Text style={[styles.bioText, { color: isDark ? '#AAAAAA' : '#555555' }]}>
              {truncateBio(artist.bio)}
            </Text>
            {artist.bio.length > 200 && (
              <TouchableOpacity 
                onPress={() => setShowFullBio(!showFullBio)}
                style={styles.readMoreButton}
              >
                <Text style={styles.readMoreText}>
                  {showFullBio ? 'Згорнути' : 'Читати більше'}
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        ) : (
          <View style={styles.noBioContainer}>
            <Text style={[styles.noBioText, { color: isDark ? '#777777' : '#999999' }]}>
              Біографія артиста не додана
            </Text>
          </View>
        )}
        
        {albums.length > 0 && (
          <Animated.View 
            style={styles.sectionContainer}
            entering={FadeIn.duration(500).delay(100)}
          >
            <View style={styles.sectionHeaderContainer}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Альбоми
              </Text>
              {albums.length > 3 && (
                <TouchableOpacity 
                  onPress={() => router.push({
                    pathname: '/(tabs)/music',
                    params: { filter: 'albums', artistId: artist._id }
                  })}
                >
                  <Text style={styles.seeAllText}>Дивитись всі</Text>
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={albums}
              renderItem={renderAlbumItem}
              keyExtractor={item => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              style={styles.albumsList}
            />
          </Animated.View>
        )}
        
        {songs.length > 0 && (
          <Animated.View 
            style={styles.sectionContainer}
            entering={FadeIn.duration(500).delay(200)}
          >
            <View style={styles.sectionHeaderContainer}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Пісні
              </Text>
              {songs.length > 5 && (
                <TouchableOpacity 
                  onPress={() => router.push({
                    pathname: '/(tabs)/music',
                    params: { filter: 'songs', artistId: artist._id }
                  })}
                >
                  <Text style={styles.seeAllText}>Дивитись всі</Text>
                </TouchableOpacity>
              )}
            </View>
            {songs.slice(0, 5).map((song, index) => (
              <View key={song._id}>
                {renderSongItem({ item: song, index })}
              </View>
            ))}
            {songs.length > 5 && (
              <TouchableOpacity 
                style={styles.showMoreSongsButton}
                onPress={() => router.push({
                  pathname: '/(tabs)/music',
                  params: { filter: 'songs', artistId: artist._id }
                })}
              >
                <Text style={styles.showMoreSongsText}>
                  Показати більше пісень
                </Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>
      
      <BlurView 
        intensity={80} 
        tint={isDark ? 'dark' : 'light'} 
        style={styles.bottomButtonContainer}
      >
        <TouchableOpacity 
          style={[styles.playAllButton, { backgroundColor: '#1DB954' }]}
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
      </BlurView>
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
    width: '100%',
    height: '50%',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
  artistName: {
    fontSize: 34,
    fontFamily: FontFamily.bold,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  artistStats: {
    fontSize: 14,
    fontFamily: FontFamily.medium,
    color: '#DDDDDD',
    marginTop: 5,
  },
  bioContainer: {
    padding: 20,
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginHorizontal: 15,
  },
  bioHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bioHeader: {
    fontSize: 20,
    fontFamily: FontFamily.bold,
    marginRight: 8,
  },
  bioText: {
    fontSize: 16,
    fontFamily: FontFamily.regular,
    lineHeight: 24,
  },
  noBioContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noBioText: {
    fontSize: 16,
    fontFamily: FontFamily.medium,
    fontStyle: 'italic',
  },
  readMoreButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    color: '#1DB954',
    fontSize: 15,
    fontFamily: FontFamily.medium,
  },
  sectionContainer: {
    marginTop: 25,
    paddingVertical: 10,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: FontFamily.bold,
  },
  seeAllText: {
    color: '#1DB954',
    fontSize: 15,
    fontFamily: FontFamily.medium,
  },
  albumsList: {
    marginBottom: 10,
  },
  albumItem: {
    width: 160,
    marginRight: 15,
    borderRadius: 8,
    overflow: 'hidden',
  },
  albumCover: {
    width: 160,
    height: 160,
    borderRadius: 8,
  },
  albumInfo: {
    marginTop: 8,
    paddingHorizontal: 5,
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
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  songImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 15,
  },
  songImage: {
    width: '100%',
    height: '100%',
  },
  songInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  songTitle: {
    fontSize: 16,
    fontFamily: FontFamily.semiBold,
  },
  songAlbum: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    color: '#888888',
    marginTop: 2,
  },
  songActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  songDuration: {
    fontSize: 14,
    fontFamily: FontFamily.regular,
    color: '#888888',
    marginRight: 15,
  },
  playButton: {
    padding: 5,
  },
  showMoreSongsButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
    marginTop: 15,
  },
  showMoreSongsText: {
    color: '#1DB954',
    fontSize: 14,
    fontFamily: FontFamily.medium,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 25,
    marginHorizontal: 20,
  },
  playAllButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FontFamily.semiBold,
    marginLeft: 8,
  },
});