import { FontFamily, Typography } from "@/constants/Typography";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useProfile } from "@/contexts/ProfileContext";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert
} from "react-native";
import axios from "axios";
import { API_URL } from "@/constants/Config";

import { ColorValue } from "react-native";

type GenreCardProps = {
  title: string;
  colors: readonly [ColorValue, ColorValue, ...ColorValue[]];
  image?: string;
  onPress?: () => void;
};

interface Album {
  _id: string;
  title: string;
  artist: string;
  coverImage: string;
  songs: string[];
}

interface Artist {
  _id: string;
  name: string;
  imageUrl: string;
}

const GenreCard = ({ title, colors, image, onPress }: GenreCardProps) => {
  return (
    <TouchableOpacity style={styles.cardContainer} activeOpacity={0.7} onPress={onPress}>
      <View style={{ borderRadius: 12, overflow: 'hidden', flex: 1 }}>
        <ImageBackground
          source={typeof image === 'string' ? { uri: image } : image}
          style={{ width: '100%', height: '100%' }}
          imageStyle={{ borderRadius: 12 }}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.85)']}
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              borderRadius: 12,
            }}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              paddingHorizontal: 15,
              paddingBottom: 15,
              paddingTop: 20,
            }}>
              <Text style={styles.cardTitle}>{title}</Text>
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#DEDEDF',
              }}>
                <Ionicons name="play" size={16} color="#FFFFFF" />
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();
  const { avatar } = useProfile();
  const { user } = useAuth();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'genres' | 'artists' | 'podcasts' | 'for-you' | 'new'>('genres');
  const [generatingArtists, setGeneratingArtists] = useState(false);

  const genres = [
    { title: "Хіп-хоп", image: require("../../assets/starboy.jpg") },
    { title: "Реп", image: require("../../assets/test.webp") },
  ];

  // Fetch albums from the API
  useEffect(() => {
    const fetchAlbums = async () => {
      setLoadingAlbums(true);
      try {
        const response = await axios.get(`${API_URL}/api/albums`);
        if (response.data && response.data.albums) {
          setAlbums(response.data.albums);
        }
      } catch (error) {
        console.error('Error fetching albums:', error);
        // Use placeholder data if API fails
        setAlbums([
          { 
            _id: '1', 
            title: 'American Dream', 
            artist: '21 Savage', 
            coverImage: ('../../assets/photo_2025-05-16_17-14-01.jpg'),
            songs: ['1', '7'] 
          },
          { 
            _id: '2', 
            title: 'Graduation', 
            artist: 'Kanye West', 
            coverImage: ('../../assets/Graduation_(album).jpg'),
            songs: ['3', '4'] 
          },
        ]);
      } finally {
        setLoadingAlbums(false);
      }
    };

    fetchAlbums();
  }, []);
  
  // Fetch artists
  useEffect(() => {
    const fetchArtists = async () => {
      if (activeCategory !== 'artists') return;
      
      setLoadingArtists(true);
      try {
        const response = await axios.get(`${API_URL}/api/artists`);
        if (response.data && response.data.artists) {
          setArtists(response.data.artists);
        }
      } catch (error) {
        console.error('Error fetching artists:', error);
        // Use placeholder data if API fails
        setArtists([
          { 
            _id: '1', 
            name: 'Океан Ельзи', 
            imageUrl: 'photo_2025-05-14_21-35-54.jpg'
          },
          { 
            _id: '2', 
            name: 'The Hardkiss', 
            imageUrl: 'photo_2025-05-14_21-35-54.jpg'
          },
        ]);
      } finally {
        setLoadingArtists(false);
      }
    };

    fetchArtists();
  }, [activeCategory]);

  // Helper function to get cover image
  const getImageSource = (coverImage: string) => {
    try {
      // If path is undefined or is a default cover
      if (!coverImage || coverImage === 'default-album-cover.jpg' || coverImage === 'default-album.jpg') {
        return require("@/assets/photo_2025-05-14_21-33-39.jpg"); // Default cover
      }
      
      // If path is already a full URL
      if (coverImage.startsWith('http')) {
        return { uri: coverImage };
      }
      
      // If path starts with 'assets/' or '/assets'
      if (coverImage.startsWith('assets/') || coverImage.startsWith('/assets/')) {
        let fileName = coverImage;
        if (fileName.startsWith('/')) {
          fileName = fileName.substring(1);
        }
        if (fileName.startsWith('assets/')) {
          fileName = fileName.substring(7);
        }
        return { uri: `${API_URL}/assets/${fileName}` };
      }
      
      // Default case - append to API_URL
      return { uri: `${API_URL}/assets/${coverImage}` };
    } catch (error) {
      console.error('Error processing image path:', error);
      return require("@/assets/photo_2025-05-14_21-33-39.jpg"); // Return default on error
    }
  };

  // Handle album press - navigate to music tab with album filter
  const handleAlbumPress = (albumId: string) => {
    router.push({
      pathname: '/(tabs)/music',
      params: { filter: 'albums', albumId }
    });
  };
  
  // Handle artist press - navigate to artist detail screen
  const handleArtistPress = (artistId: string) => {
    router.push({
      pathname: '/artist/[id]',
      params: { id: artistId }
    });
  };
  
  // Handle genre press - navigate to music tab with genre filter
  const handleGenrePress = (genre: string) => {
    router.push({
      pathname: '/(tabs)/music',
      params: { genre }
    });
  };
  
  // Function to generate artists from songs data
  const generateArtists = async () => {
    setGeneratingArtists(true);
    try {
      const response = await axios.post(`${API_URL}/api/artists/generate`);
      if (response.data && response.data.artists) {
        setArtists(response.data.artists);
        Alert.alert('Успіх', `Створено ${response.data.artists.length} артистів!`);
      }
    } catch (error) {
      console.error('Error generating artists:', error);
      Alert.alert('Помилка', 'Не вдалося створити артистів');
    } finally {
      setGeneratingArtists(false);
    }
  };

  // Render content based on active category
  const renderCategoryContent = () => {
    switch(activeCategory) {
      case 'genres':
        return (
          <>
            <View style={styles.genreGrid}>
              {genres.map((genre, index) => (
                <GenreCard 
                  key={index} 
                  title={genre.title} 
                  colors={['#000000', '#000000']} 
                  image={genre.image}
                  onPress={() => handleGenrePress(genre.title)}
                />
              ))}
            </View>
            
            <View style={[styles.sectionHeader, { paddingHorizontal: 20 }]}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: isDark ? "#FFFFFF" : "#000000" },
                ]}
              >
                Альбоми
              </Text>
            </View>
            
            {loadingAlbums ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1DB954" />
                <Text style={{ color: isDark ? '#FFFFFF' : '#000000', marginTop: 10 }}>Завантаження альбомів...</Text>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recentlyPlayedContent}
              >
                {albums.map((album) => (
                  <TouchableOpacity
                    key={album._id}
                    style={styles.recentItem}
                    activeOpacity={0.7}
                    onPress={() => handleAlbumPress(album._id)}
                  >
                    <View style={styles.recentItemImageContainer}>
                      <ImageBackground
                        source={getImageSource(album.coverImage)}
                        style={styles.recentItemImage}
                        imageStyle={{ borderRadius: 12 }}
                        defaultSource={require("@/assets/photo_2025-05-14_21-33-39.jpg")}
                        onError={(e) => console.log('Album image error:', e.nativeEvent.error)}
                      >
                        <View style={styles.playButtonContainer}>
                          <View style={styles.playButton}>
                            <Ionicons name="play" size={24} color="#FFFFFF" />
                          </View>
                        </View>
                      </ImageBackground>
                    </View>
                    <Text
                      style={[
                        styles.recentItemTitle,
                        { color: isDark ? "#FFFFFF" : "#000000" },
                      ]}
                      numberOfLines={1}
                    >
                      {album.title}
                    </Text>
                    <Text style={styles.recentItemSubtitle} numberOfLines={1}>{album.artist}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </>
        );
        
      case 'artists':
        return (
          <View style={styles.artistsGrid}>
            {loadingArtists ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1DB954" />
                <Text style={{ color: isDark ? '#FFFFFF' : '#000000', marginTop: 10 }}>
                  Завантаження артистів...
                </Text>
              </View>
            ) : artists.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {artists.map((artist) => (
                  <TouchableOpacity
                    key={artist._id}
                    style={styles.artistItem}
                    onPress={() => handleArtistPress(artist._id)}
                  >
                    <Image
                      source={getImageSource(artist.imageUrl)}
                      style={styles.artistImage}
                      defaultSource={require("@/assets/photo_2025-05-14_21-35-54.jpg")}
                    />
                    <Text style={[styles.artistName, { color: isDark ? '#FFFFFF' : '#000000' }]} numberOfLines={2}>
                      {artist.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyStateContainer}>
                <Ionicons name="person-outline" size={64} color={isDark ? '#555555' : '#AAAAAA'} />
                <Text style={[styles.emptyStateText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  Артистів не знайдено
                </Text>
                <TouchableOpacity 
                  style={styles.generateButton}
                  onPress={generateArtists}
                  disabled={generatingArtists}
                >
                  <Text style={styles.generateButtonText}>
                    {generatingArtists ? 'Створення...' : 'Створити артистів із пісень'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
        
      case 'podcasts':
        return (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="mic-outline" size={64} color={isDark ? '#555555' : '#AAAAAA'} />
            <Text style={[styles.emptyStateText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Подкасти скоро з'являться!
            </Text>
          </View>
        );
        
      case 'for-you':
        return (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="heart-outline" size={64} color={isDark ? '#555555' : '#AAAAAA'} />
            <Text style={[styles.emptyStateText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Персоналізовані рекомендації скоро з'являться!
            </Text>
          </View>
        );
        
      case 'new':
        return (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="star-outline" size={64} color={isDark ? '#555555' : '#AAAAAA'} />
            <Text style={[styles.emptyStateText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Нові релізи скоро з'являться!
            </Text>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#060606" : "#FFFFFF" },
      ]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={styles.header}>
        <View
          style={[styles.headerRow, { flexDirection: 'row', justifyContent: 'space-between' }]}
        >
          <Text
            style={[
              styles.headerTitle,
              { color: isDark ? "#FFFFFF" : "#000000" },
            ]}
          >
            Привіт 👋{user?.name ? `, ${user.name}` : ""}
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/profile')}
            activeOpacity={0.7}
          >
            <Image
              source={avatar ? { uri: avatar } : require("@/assets/kizaru_12.jpg")}
              style={{
                width: 40,
                height: 40,
                borderRadius: 50,
              }}
            />
          </TouchableOpacity>
        </View>
        <View></View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.categoryContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            <TouchableOpacity
              style={[
                styles.categoryButton, 
                activeCategory === 'genres' ? styles.categoryActive : {}
              ]}
              onPress={() => setActiveCategory('genres')}
            >
              <Text 
                style={activeCategory === 'genres' 
                  ? styles.categoryActiveText 
                  : [styles.categoryText, { color: isDark ? '#FFFFFF' : '#666666' }]
                }
              >
                Жанри
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.categoryButton,
                activeCategory === 'artists' ? styles.categoryActive : {}
              ]}
              onPress={() => setActiveCategory('artists')}
            >
              <Text 
                style={activeCategory === 'artists' 
                  ? styles.categoryActiveText 
                  : [styles.categoryText, { color: isDark ? '#FFFFFF' : '#666666' }]
                }
              >
                Артисти
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.categoryButton,
                activeCategory === 'podcasts' ? styles.categoryActive : {}
              ]}
              onPress={() => setActiveCategory('podcasts')}
            >
              <Text 
                style={activeCategory === 'podcasts' 
                  ? styles.categoryActiveText 
                  : [styles.categoryText, { color: isDark ? '#FFFFFF' : '#666666' }]
                }
              >
                Подкасти
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.categoryButton,
                activeCategory === 'for-you' ? styles.categoryActive : {}
              ]}
              onPress={() => setActiveCategory('for-you')}
            >
              <Text 
                style={activeCategory === 'for-you' 
                  ? styles.categoryActiveText 
                  : [styles.categoryText, { color: isDark ? '#FFFFFF' : '#666666' }]
                }
              >
                Для вас
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.categoryButton,
                activeCategory === 'new' ? styles.categoryActive : {}
              ]}
              onPress={() => setActiveCategory('new')}
            >
              <Text 
                style={activeCategory === 'new' 
                  ? styles.categoryActiveText 
                  : [styles.categoryText, { color: isDark ? '#FFFFFF' : '#666666' }]
                }
              >
                Нове
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {renderCategoryContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    ...Typography.h2,
    fontWeight: "bold",
  },
  iconGroup: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchText: {
    color: "#888888",
    ...Typography.body2,
  },

  sectionHeader: {
    marginBottom: 15,
    marginTop: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    ...Typography.h3,
  },
  categoryContainer: {
    marginVertical: 15,
  },
  categoryScroll: {
    paddingLeft: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  categoryActive: {
    backgroundColor: "#DEDEDF",
  },
  categoryText: {
    color: "#FFFFFF",
    ...Typography.caption,
    lineHeight: 18,
  },
  categoryActiveText: {
    color: "#000000",
    ...Typography.caption,
    lineHeight: 18,
    fontFamily: FontFamily.semiBold,
  },
  genreGrid: {
    flexDirection: "column",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  artistsGrid: {
    paddingLeft: 20,
    paddingRight: 10,
    marginTop: 10,
    marginBottom: 15,
  },
  backgroundImage: {
    padding: 15,
    borderRadius: 12,
    height: 150,
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  imageStyle: {
    width: "125%",
    height: "125%",
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 15,
    width: "100%",
  },
  cardContainer: {
    width: "100%",
    height: 180,
    marginBottom: 15,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  gradientCard: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },
  cardTitle: {
    color: "#FFFFFF",
    ...Typography.subtitle1,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  cardImage: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 40,
    height: 40,
    opacity: 0.7,
  },
  recentlyPlayedContent: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingLeft: 20,
  },
  recentItem: {
    width: 160,
    marginRight: 15,
  },
  recentItemImageContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    borderRadius: 12,
    overflow: "hidden",
  },
  recentItemImage: {
    width: "100%",
    height: 160,
  },
  playButtonContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DEDEDF",
  },
  recentItemTitle: {
    marginTop: 12,
    ...Typography.body2,
    fontFamily: FontFamily.semiBold,
  },
  recentItemSubtitle: {
    ...Typography.caption,
    color: "#888888",
    marginTop: 4,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  artistItem: {
    marginRight: 15,
    alignItems: 'center',
    width: 120,
  },
  artistImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  artistName: {
    textAlign: 'center',
    marginTop: 10,
    ...Typography.caption,
    fontFamily: FontFamily.medium,
    fontSize: 14,
  },
  emptyStateContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyStateText: {
    marginTop: 15,
    ...Typography.body1,
    textAlign: 'center',
  },
  generateButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  generateButtonText: {
    color: '#FFFFFF',
    ...Typography.body2,
    fontFamily: FontFamily.semiBold,
  },
});
