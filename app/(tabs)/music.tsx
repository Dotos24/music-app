import { FontFamily, Typography } from '@/constants/Typography';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert, Platform, Modal, ScrollView } from 'react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import MusicPlayerUI from '@/components/MusicPlayerUI';
import MiniPlayerUI from '@/components/MiniPlayerUI';
import axios from 'axios';
import { API_URL } from '@/constants/Config';
import { useAudio } from '@/contexts/AudioContext';
import { useLikes } from '@/contexts/LikesContext';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import debounce from 'lodash/debounce';

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
  year?: number;
};

interface Album {
  _id: string;
  title: string;
  artist: string;
  coverImage: string;
  songs: SongItem[];
  year?: number;
}

interface Playlist {
  _id: string;
  name: string;
  description?: string;
  coverImage?: string;
  userId: string;
  songs: SongItem[] | string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function MusicScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSong, setCurrentSong] = useState<SongItem | null>(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'artists' | 'albums' | 'playlists'>('all');
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [loadingAlbum, setLoadingAlbum] = useState(false);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [publicPlaylists, setPublicPlaylists] = useState<Playlist[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  
  // Get URL params
  const params = useLocalSearchParams();
  const { filter, albumId } = params;
  
  // Set initial filter from params if present
  useEffect(() => {
    if (filter === 'albums' || filter === 'artists' || filter === 'playlists') {
      setActiveFilter(filter);
    }
  }, [filter]);
  
  // Load specific album if albumId is provided
  useEffect(() => {
    if (albumId && activeFilter === 'albums') {
      fetchAlbumById(albumId as string);
    }
  }, [albumId, activeFilter]);
  
  // Fetch album by ID
  const fetchAlbumById = async (id: string) => {
    setLoadingAlbum(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/api/albums/${id}`);
      if (response.data && response.data.album) {
        setSelectedAlbum(response.data.album);
      } else {
        setError('Не вдалося завантажити альбом');
      }
    } catch (err: any) {
      console.error(`Error fetching album: ${err.message}`);
      setError(`Не вдалося завантажити альбом: ${err.message}`);
    } finally {
      setLoadingAlbum(false);
    }
  };
  
  // Fetch songs with support for search queries
  const fetchSongs = useCallback(async (query: string = '') => {
    // Don't check activeFilter here to prevent dependency loops
    setLoading(true);
    setError(null);
    
    console.log('Fetching songs from:', query ? 
      `${API_URL}/api/songs/search?query=${encodeURIComponent(query)}` : 
      `${API_URL}/api/songs`);
    
    try {
      const endpoint = query ? 
        `${API_URL}/api/songs/search?query=${encodeURIComponent(query)}` : 
        `${API_URL}/api/songs`;
      
      const response = await axios.get(endpoint);
      
      if (Array.isArray(response.data)) {
        console.log('Songs received:', response.data.length);
        setSongs(response.data);
      } else {
        console.error('Unexpected response format:', typeof response.data);
        setError('Неправильний формат даних від сервера');
        // Use test data as fallback
        setSongs([
          {
            _id: '1',
            title: 'Місто весни',
            artist: 'Океан Ельзи',
            album: 'Без меж',
            duration: 225,
            coverAsset: 'photo_2025-05-14_21-35-54.jpg',
            audioAsset: 'audio1.mp3',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: '2',
            title: 'Обійми',
            artist: 'Океан Ельзи',
            album: 'Земля',
            duration: 252,
            coverAsset: 'photo_2025-05-14_21-35-54.jpg',
            audioAsset: 'audio2.mp3',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: '3',
            title: 'Квітка',
            artist: 'The Hardkiss',
            album: 'Залізна ластівка',
            duration: 238,
            coverAsset: 'photo_2025-05-14_21-35-54.jpg',
            audioAsset: 'audio3.mp3',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: '4',
            title: 'Журавлі',
            artist: 'The Hardkiss',
            album: 'Залізна ластівка',
            duration: 245,
            coverAsset: 'photo_2025-05-14_21-35-54.jpg',
            audioAsset: 'audio4.mp3',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: '5',
            title: 'Мало мені',
            artist: 'KAZKA',
            album: 'NIRVANA',
            duration: 210,
            coverAsset: 'photo_2025-05-14_21-35-54.jpg',
            audioAsset: 'audio5.mp3',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: '6',
            title: 'Плакала',
            artist: 'KAZKA',
            album: 'KARMA',
            duration: 202,
            coverAsset: 'photo_2025-05-14_21-35-54.jpg',
            audioAsset: 'audio6.mp3',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: '7',
            title: 'Не твоя війна',
            artist: 'Океан Ельзи',
            album: 'Без меж',
            duration: 275,
            coverAsset: 'photo_2025-05-14_21-35-54.jpg',
            audioAsset: 'audio7.mp3',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: '8',
            title: 'Без бою',
            artist: 'Океан Ельзи',
            album: 'Gloria',
            duration: 218,
            coverAsset: 'photo_2025-05-14_21-35-54.jpg',
            audioAsset: 'audio8.mp3',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: '9',
            title: 'Коханці',
            artist: 'Христина Соловій',
            album: 'Любий друг',
            duration: 195,
            coverAsset: 'photo_2025-05-14_21-35-54.jpg',
            audioAsset: 'audio9.mp3',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Невідома помилка';
      const statusCode = err.response?.status || 'нема статус-коду';
      console.error(`Error fetching songs: ${errorMessage}, Status: ${statusCode}`);
      setError(`Не вдалося завантажити пісні: ${errorMessage}. Перевірте, що сервер запущений за адресою ${API_URL}`);
      // Use test data as fallback
      setSongs([
        {
          _id: '1',
          title: 'Місто весни',
          artist: 'Океан Ельзи',
          album: 'Без меж',
          duration: 225,
          coverAsset: 'photo_2025-05-14_21-35-54.jpg',
          audioAsset: 'audio1.mp3',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          title: 'Обійми',
          artist: 'Океан Ельзи',
          album: 'Земля',
          duration: 252,
          coverAsset: 'photo_2025-05-14_21-35-54.jpg',
          audioAsset: 'audio2.mp3',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '3',
          title: 'Квітка',
          artist: 'The Hardkiss',
          album: 'Залізна ластівка',
          duration: 238,
          coverAsset: 'photo_2025-05-14_21-35-54.jpg',
          audioAsset: 'audio3.mp3',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '4',
          title: 'Журавлі',
          artist: 'The Hardkiss',
          album: 'Залізна ластівка',
          duration: 245,
          coverAsset: 'photo_2025-05-14_21-35-54.jpg',
          audioAsset: 'audio4.mp3',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '5',
          title: 'Мало мені',
          artist: 'KAZKA',
          album: 'NIRVANA',
          duration: 210,
          coverAsset: 'photo_2025-05-14_21-35-54.jpg',
          audioAsset: 'audio5.mp3',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '6',
          title: 'Плакала',
          artist: 'KAZKA',
          album: 'KARMA',
          duration: 202,
          coverAsset: 'photo_2025-05-14_21-35-54.jpg',
          audioAsset: 'audio6.mp3',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '7',
          title: 'Не твоя війна',
          artist: 'Океан Ельзи',
          album: 'Без меж',
          duration: 275,
          coverAsset: 'photo_2025-05-14_21-35-54.jpg',
          audioAsset: 'audio7.mp3',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '8',
          title: 'Без бою',
          artist: 'Океан Ельзи',
          album: 'Gloria',
          duration: 218,
          coverAsset: 'photo_2025-05-14_21-35-54.jpg',
          audioAsset: 'audio8.mp3',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '9',
          title: 'Коханці',
          artist: 'Христина Соловій',
          album: 'Любий друг',
          duration: 195,
          coverAsset: 'photo_2025-05-14_21-35-54.jpg',
          audioAsset: 'audio9.mp3',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since this function doesn't use any external variables
  
  // Fetch albums
  const fetchAlbums = useCallback(async (query: string = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = query ? `${API_URL}/api/albums/search?query=${encodeURIComponent(query)}` : `${API_URL}/api/albums`;
      const response = await axios.get(endpoint);
      
      if (response.data && response.data.albums) {
        setAlbums(response.data.albums);
      } else {
        setError('Не вдалося завантажити альбоми');
      }
    } catch (err: any) {
      console.error(`Error fetching albums: ${err.message}`);
      setError(`Не вдалося завантажити альбоми: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Fetch public playlists based on search query
  const fetchPublicPlaylists = useCallback(async (query: string = '') => {
    // Don't check activeFilter here to prevent dependency loops
    setLoadingPlaylists(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/api/playlists/public`, {
        params: { query }
      });
      
      if (response.data && response.data.playlists) {
        setPublicPlaylists(response.data.playlists);
      } else {
        setPublicPlaylists([]);
      }
    } catch (err: any) {
      console.error(`Error fetching public playlists: ${err.message}`);
      setError(`Не вдалося завантажити плейлисти: ${err.message}`);
      setPublicPlaylists([]);
    } finally {
      setLoadingPlaylists(false);
    }
  }, []);
  
  // Используем аудио контекст
  const { playSong, currentSong: audioContextSong, setCurrentSongPlaylist } = useAudio();
  
  // Fetch appropriate data based on active filter
  useEffect(() => {
    if (activeFilter === 'albums') {
      fetchAlbums();
    } else if (activeFilter === 'all') {
      fetchSongs();
    } else if (activeFilter === 'playlists') {
      fetchPublicPlaylists(searchQuery);
    }
    
    // Reset selected album when switching away from albums
    if (activeFilter !== 'albums') {
      setSelectedAlbum(null);
    }
  }, [activeFilter, fetchAlbums, fetchSongs, fetchPublicPlaylists, searchQuery]);
  
  useFocusEffect(
    useCallback(() => {
      // Load data only on first focus, not on every focus
      const initialLoad = () => {
        console.log('Screen focused with filter:', activeFilter);
        
        // Initial data loading will be handled by the activeFilter effect
      };
      
      initialLoad();
      
      return () => {
        // Clean up on unfocus if needed
      };
    }, [activeFilter])
  );

  const filteredSongs = React.useMemo(() => {
    let filtered = songs;
    
    if (searchQuery) {
      filtered = filtered.filter(
        (song) =>
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (song.album && song.album.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered;
  }, [songs, searchQuery]);

  // Устанавливаем текущий плейлист при изменении списка песен
  useEffect(() => {
    if (songs.length > 0) {
      setCurrentSongPlaylist(songs);
    }
  }, [songs, setCurrentSongPlaylist]);

  const handleSongPress = (song: SongItem) => {
    setCurrentSong(song);
    setIsPlayerVisible(true);
    // Воспроизведение выбранной песни
    playSong(song);
  };

  const handleOpenPlayer = () => {
    setIsPlayerVisible(true);
  };

  // Кэш для изображений
  const imageCache = useRef<Record<string, any>>({});

  // Функция для получения пути к обложке из разных возможных полей
  const getSongCoverPath = (song: SongItem) => {
    console.log('Processing song cover for:', song.title);
    
    // По приоритету проверяем разные возможные поля
    if (song.coverAsset && song.coverAsset.trim() !== '') {
      console.log('Using coverAsset:', song.coverAsset);
      return song.coverAsset;
    } 
    else if (song.coverFilePath && song.coverFilePath.trim() !== '') {
      console.log('Using coverFilePath:', song.coverFilePath);
      
      // Если путь начинается с 'assets/' или '/assets'
      if (song.coverFilePath.startsWith('assets/') || song.coverFilePath.startsWith('/assets/')) {
        // Удаляем префиксы и получаем чистое имя файла
        let fileName = song.coverFilePath;
        if (fileName.startsWith('/')) {
          fileName = fileName.substring(1);
        }
        if (fileName.startsWith('assets/')) {
          fileName = fileName.substring(7);
        }
        console.log('Extracted filename from path:', fileName);
        return fileName;
      }
      
      // Извлекаем имя файла из пути
      const pathParts = song.coverFilePath.split('/');
      const fileName = pathParts[pathParts.length - 1];
      
      console.log('Extracted filename:', fileName);
      return fileName || 'photo_2025-05-14_21-35-54.jpg';
    }
    else if (song.coverUrl && song.coverUrl.trim() !== '') {
      console.log('Using coverUrl:', song.coverUrl);
      
      // If it's a full URL, return just the filename part
      if (song.coverUrl.startsWith('http')) {
        try {
          const url = new URL(song.coverUrl);
          const pathParts = url.pathname.split('/');
          const fileName = pathParts[pathParts.length - 1];
          console.log('Extracted filename from URL:', fileName);
          return fileName;
        } catch(e) {
          console.log('Failed to parse URL, using full coverUrl');
          return song.coverUrl;
        }
      }
      
      return song.coverUrl;
    }
    
    // Если ничего не нашли, используем заглушку
    console.log('No cover found for song, using default image');
    return 'photo_2025-05-14_21-35-54.jpg';
  };

  // Загрузка изображения из папки assets с кэшированием
  const getImageSource = (assetName: string | undefined) => {
    // Если имя файла не передано, используем заглушку
    if (!assetName) {
      console.log('No asset name provided, using default image');
      return require('@/assets/photo_2025-05-14_21-35-54.jpg');
    }
    
    // Проверяем кэш
    if (imageCache.current[assetName]) {
      return imageCache.current[assetName];
    }
    
    try {
      // Если это полный URL
      if (assetName.startsWith('http')) {
        console.log('Using full URL for image:', assetName);
        const image = { uri: assetName };
        imageCache.current[assetName] = image;
        return image;
      }
      
      // Используем изображение из локальных ассетов Expo
      if (assetName === 'photo_2025-05-14_21-35-54.jpg') {
        const image = require('@/assets/photo_2025-05-14_21-35-54.jpg');
        imageCache.current[assetName] = image;
        return image;
      }
      
      const baseUrl = API_URL.replace(/\/$/, ''); // Удаляем слеш в конце, если есть
      const imageUrl = `${baseUrl}/assets/${assetName}`;
      console.log('Constructed image URL:', imageUrl);
      const image = { uri: imageUrl };
      
      // Сохраняем в кэш
      imageCache.current[assetName] = image;
      return image;
    } catch (error) {
      console.error(`Error loading image ${assetName}:`, error);
      // Плейсхолдер в случае ошибки
      const fallbackImage = require('@/assets/photo_2025-05-14_21-35-54.jpg');
      imageCache.current[assetName] = fallbackImage;
      return fallbackImage;
    }
  };

  // Function to get album cover path
  const getAlbumCoverPath = (album: Album) => {
    console.log('Getting cover for album:', album.title);
    
    // If album has a cover image, use it
    if (album.coverImage && album.coverImage !== 'default-album-cover.jpg') {
      console.log('Album has coverImage:', album.coverImage);
      
      // If path is already a full URL
      if (album.coverImage.startsWith('http')) {
        console.log('Using full URL for album cover');
        return { uri: album.coverImage };
      }
      
      // If path starts with 'assets/' or '/assets'
      if (album.coverImage.startsWith('assets/') || album.coverImage.startsWith('/assets/')) {
        let fileName = album.coverImage;
        if (fileName.startsWith('/')) {
          fileName = fileName.substring(1);
        }
        if (fileName.startsWith('assets/')) {
          fileName = fileName.substring(7);
        }
        
        const imageUrl = `${API_URL}/assets/${fileName}`;
        console.log('Constructed album cover URL from assets path:', imageUrl);
        return { uri: imageUrl };
      }
      
      // Default case - append to API_URL
      const imageUrl = `${API_URL}/assets/${album.coverImage}`;
      console.log('Constructed album cover URL:', imageUrl);
      return { uri: imageUrl };
    }
    
    console.log('Album has no cover, checking first song...');
    
    // If album has songs, use the first song's cover
    if (album.songs && album.songs.length > 0) {
      const firstSong = album.songs[0];
      if (!firstSong) {
        console.log('No first song found, using default cover');
        return require('@/assets/photo_2025-05-14_21-35-54.jpg');
      }
      
      console.log('Using first song cover for album:', album.title);
      
      // Try different cover fields in order of preference
      let coverPath = null;
      
      if (firstSong.coverFilePath) {
        // Extract filename from path
        let fileName = firstSong.coverFilePath;
        if (fileName.startsWith('/')) {
          fileName = fileName.substring(1);
        }
        if (fileName.startsWith('assets/')) {
          fileName = fileName.substring(7);
        } else {
          // Get just the filename if it's a full path
          const pathParts = fileName.split('/');
          fileName = pathParts[pathParts.length - 1];
        }
        
        coverPath = `${API_URL}/assets/${fileName}`;
        console.log('Using song coverFilePath for album:', coverPath);
        
      } else if (firstSong.coverAsset) {
        coverPath = `${API_URL}/assets/${firstSong.coverAsset}`;
        console.log('Using song coverAsset for album:', coverPath);
        
      } else if (firstSong.coverUrl) {
        if (firstSong.coverUrl.startsWith('http')) {
          coverPath = firstSong.coverUrl;
        } else {
          coverPath = `${API_URL}/assets/${firstSong.coverUrl}`;
        }
        console.log('Using song coverUrl for album:', coverPath);
      }
      
      if (coverPath) {
        return { uri: coverPath };
      }
    }
    
    console.log('No suitable cover found for album, using default');
    // Default fallback image
    return require('@/assets/photo_2025-05-14_21-35-54.jpg');
  };

  // Используем контекст лайков
  const { isLiked, toggleLike } = useLikes();

  const renderSongItem = ({ item, index }: { item: SongItem, index: number }) => {
    const isActive = currentSong && currentSong._id === item._id;
    const backgroundColor = isActive 
      ? (isDark ? 'rgba(208, 208, 185, 0.1)' : 'rgba(29, 185, 84, 0.2)')
      : (isDark ? 'rgba(50, 50, 50, 0.19)' : 'rgba(240, 240, 240, 0.5)');
    
    return (
      <Animated.View
        entering={FadeIn.duration(350).delay(index * 50)}
      >
        <TouchableOpacity 
          style={[styles.songItem, { backgroundColor }]} 
          activeOpacity={0.6}
          onPress={() => handleSongPress(item)}
        >
          <View style={styles.songImageContainer}>
            <Image 
              source={getImageSource(getSongCoverPath(item))}
              style={styles.songImage} 
              onError={(e) => {}}
            />

          </View>
          
          <View style={styles.songInfo}>
            <Text 
              style={[styles.songTitle, { color: isDark ? '#FFFFFF' : '#000000' }]} 
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <View style={styles.artistRow}>
              <Text style={[styles.songArtist, isActive ? styles.activeText : null]} numberOfLines={1}>{item.artist}</Text>
              {item.album && (
                <>
                  <Text style={styles.dotSeparator}>•</Text>
                  <Text style={[styles.songArtist, isActive ? styles.activeText : null]} numberOfLines={1}>{item.album}</Text>
                </>
              )}
            </View>
          </View>
          
          <View style={styles.songDetails}>
            <TouchableOpacity 
              style={styles.likeButton}
              onPress={(e) => {
                e.stopPropagation();
                toggleLike(item);
              }}
            >
              <Ionicons 
                name={isLiked(item._id) ? "heart" : "heart-outline"} 
                size={24} 
                color={isLiked(item._id) ? "#ff3b5c" : (isDark ? '#777777' : '#999999')} 
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Обновляем currentSong при изменении в аудио контексте
  useEffect(() => {
    if (audioContextSong) {
      setCurrentSong(audioContextSong);
    }
  }, [audioContextSong]);

  const [albumImageErrors, setAlbumImageErrors] = useState<Record<string, boolean>>({});

  const handleAlbumImageError = (albumId: string) => {
    setAlbumImageErrors(prev => ({
      ...prev,
      [albumId]: true
    }));
  };

  // Reset image errors when albums are fetched
  useEffect(() => {
    if (albums.length > 0) {
      setAlbumImageErrors({});
    }
  }, [albums]);

  // Render album item
  const renderAlbumItem = ({ item }: { item: Album }) => {
    // Pre-fetch first song cover if needed for album cover
    if (item.songs && item.songs.length > 0 && (!item.coverImage || item.coverImage === 'default-album-cover.jpg')) {
      const firstSong = item.songs[0];
      if (firstSong) {
        getSongCoverPath(firstSong); // This will trigger caching
      }
    }
    
    const coverSource = getAlbumCoverPath(item);
    console.log('Album cover source for', item.title, ':', coverSource);
    
    return (
      <TouchableOpacity 
        style={styles.albumItem}
        onPress={() => fetchAlbumById(item._id)}
        activeOpacity={0.7}
      >
        <Image 
          source={coverSource}
          style={styles.albumCover}
          defaultSource={require('@/assets/photo_2025-05-14_21-35-54.jpg')}
          onError={() => {
            console.error(`Failed to load album cover for: ${item.title}`);
            handleAlbumImageError(item._id);
          }}
        />
        <View style={styles.albumInfo}>
          <Text style={[styles.albumTitle, { color: isDark ? '#FFFFFF' : '#000000' }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.albumArtist} numberOfLines={1}>
            {item.artist}
          </Text>
          <View style={styles.albumInfoRow}>
            <Text style={styles.albumSongs}>
              Пісень: {item.songs?.length || 0}
            </Text>
            {item.year && (
              <>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.albumSongs}>{item.year}</Text>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  // Render songs from the selected album
  const renderSelectedAlbumContent = () => {
    if (loadingAlbum) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
          <Text style={styles.loadingText}>Завантаження альбому...</Text>
        </View>
      );
    }
    
    if (!selectedAlbum) return null;

    // Function to auto-find songs with matching album name
    const findMatchingSongs = async () => {
      try {
        setLoading(true);
        const songsResponse = await axios.get(`${API_URL}/api/songs`);
        
        if (Array.isArray(songsResponse.data)) {
          const existingSongIds = selectedAlbum.songs.map(song => song._id);
          const matchingSongs = songsResponse.data.filter(song => 
            song.album && 
            song.album.toLowerCase() === selectedAlbum.title.toLowerCase() && 
            song.artist.toLowerCase() === selectedAlbum.artist.toLowerCase() &&
            !existingSongIds.includes(song._id)
          );
          
          if (matchingSongs.length > 0) {
            // Add matching songs to the album
            const songIds = matchingSongs.map(song => song._id);
            await axios.post(`${API_URL}/api/albums/${selectedAlbum._id}/songs`, {
              songIds: songIds
            });
            
            Alert.alert(
              'Успіх', 
              `Додано ${matchingSongs.length} нових пісень з відповідною назвою альбому.`
            );
            
            // Reload album to update the list
            fetchAlbumById(selectedAlbum._id);
          } else {
            Alert.alert('Інформація', 'Не знайдено нових пісень, які відповідають назві цього альбому.');
          }
        }
      } catch (err) {
        console.error('Error finding matching songs:', err);
        Alert.alert('Помилка', 'Не вдалося знайти відповідні пісні.');
      } finally {
        setLoading(false);
      }
    };

    // Render a visualization row for currently playing song
    const renderVisualizer = () => {
      return (
        <View style={styles.visualizerContainer}>
          {[...Array(6)].map((_, index) => (
            <Animated.View 
              key={index}
              style={[
                styles.visualizerBar,
                { 
                  height: 12 + Math.random() * 12,
                  backgroundColor: '#1DB954',
                  marginHorizontal: 2
                }
              ]}
            />
          ))}
        </View>
      );
    };
    
    return (
      <View style={styles.newAlbumContainer}>
        {/* Sticky header with album info */}
        <Animated.View 
          style={[
            styles.albumStickyHeader,
            { backgroundColor: isDark ? '#111' : '#fff' }
          ]}
          entering={FadeIn.duration(300)}
        >
          <TouchableOpacity 
            style={styles.newBackButton}
            onPress={() => setSelectedAlbum(null)}
          >
            <Ionicons 
              name="chevron-back-circle" 
              size={32} 
              color={isDark ? '#fff' : '#000'} 
            />
          </TouchableOpacity>
          
          <Animated.View 
            style={styles.stickyAlbumInfo}
            entering={FadeIn.duration(300).delay(100)}
          >
            <Text 
              style={[
                styles.stickyAlbumTitle, 
                { color: isDark ? '#fff' : '#000' }
              ]}
              numberOfLines={1}
            >
              {selectedAlbum.title}
            </Text>
            <Text 
              style={[
                styles.stickyAlbumArtist, 
                { color: isDark ? '#ccc' : '#555' }
              ]}
              numberOfLines={1}
            >
              {selectedAlbum.artist}
            </Text>
          </Animated.View>
        </Animated.View>
        
        {/* Scrollable content */}
        <ScrollView 
          style={styles.albumScrollContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: currentSong && !isPlayerVisible ? 90 : 20
          }}
        >
          {/* Hero section with full-width album art */}
          <View style={styles.newAlbumHeroSection}>
            <Animated.View 
              style={styles.newAlbumCoverContainer}
              entering={FadeIn.duration(400)}
            >
              <Image
                source={getAlbumCoverPath(selectedAlbum)}
                style={styles.newAlbumCoverImage}
                defaultSource={require('@/assets/photo_2025-05-14_21-35-54.jpg')}
                onError={() => {
                  console.error(`Failed to load album cover for: ${selectedAlbum.title}`);
                  handleAlbumImageError(selectedAlbum._id);
                }}
              />
              
              {/* Play button overlay */}
              <TouchableOpacity 
                style={styles.albumCoverPlayButton}
                onPress={() => {
                  if (selectedAlbum.songs && selectedAlbum.songs.length > 0) {
                    setCurrentSongPlaylist(selectedAlbum.songs);
                    playSong(selectedAlbum.songs[0]);
                    setCurrentSong(selectedAlbum.songs[0]);
                  }
                }}
              >
                <View style={styles.playButtonCircle}>
                  <Ionicons name="play" size={28} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </Animated.View>
            
            {/* Album metadata */}
            <Animated.View 
              style={styles.newAlbumMetadata}
              entering={FadeIn.duration(300).delay(200)}
            >
              <Text style={[styles.newAlbumTitle, { color: isDark ? '#fff' : '#000' }]}>
                {selectedAlbum.title}
              </Text>
              <Text style={[styles.newAlbumArtist, { color: isDark ? '#ddd' : '#333' }]}>
                {selectedAlbum.artist}
              </Text>
              
              <View style={styles.newAlbumStats}>
                <View style={styles.albumStatItem}>
                  <Ionicons name="musical-note" size={16} color={isDark ? '#ccc' : '#666'} />
                  <Text style={[styles.albumStatText, { color: isDark ? '#ccc' : '#666' }]}>
                    {selectedAlbum.songs?.length || 0} пісень
                  </Text>
                </View>
                
                {selectedAlbum.year && (
                  <View style={styles.albumStatItem}>
                    <Ionicons name="calendar" size={16} color={isDark ? '#ccc' : '#666'} />
                    <Text style={[styles.albumStatText, { color: isDark ? '#ccc' : '#666' }]}>
                      {selectedAlbum.year}
                    </Text>
                  </View>
                )}
              </View>
            </Animated.View>
            
            {/* Album action buttons */}
            <View style={styles.newAlbumActions}>
              <TouchableOpacity
                style={styles.newActionButton}
                onPress={() => {
                  if (selectedAlbum.songs && selectedAlbum.songs.length > 0) {
                    setCurrentSongPlaylist(selectedAlbum.songs);
                    playSong(selectedAlbum.songs[0]);
                    setCurrentSong(selectedAlbum.songs[0]);
                  }
                }}
              >
                <View style={styles.actionButtonIcon}>
                  <Ionicons name="play" size={18} color="#fff" />
                </View>
                <Text style={styles.actionButtonText}>Відтворити</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.newActionButton}
                onPress={() => {
                  setNewAlbumId(selectedAlbum._id);
                  setSongSelectionModalVisible(true);
                }}
              >
                <View style={[styles.actionButtonIcon, { backgroundColor: '#e67e22' }]}>
                  <Ionicons name="add" size={18} color="#fff" />
                </View>
                <Text style={styles.actionButtonText}>Додати</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.newActionButton}
                onPress={findMatchingSongs}
              >
                <View style={[styles.actionButtonIcon, { backgroundColor: '#3498db' }]}>
                  <Ionicons name="search" size={18} color="#fff" />
                </View>
                <Text style={styles.actionButtonText}>Знайти</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Song list */}
          <View style={styles.newSongListContainer}>
            <View style={styles.songListHeader}>
              <Text style={[styles.songListTitle, { color: isDark ? '#fff' : '#000' }]}>
                Пісні
              </Text>
              {selectedAlbum.songs?.length > 0 && (
                <TouchableOpacity 
                  style={styles.shuffleButton}
                  onPress={() => {
                    if (selectedAlbum.songs && selectedAlbum.songs.length > 0) {
                      // Create a shuffled copy of the songs array
                      const shuffledSongs = [...selectedAlbum.songs];
                      for (let i = shuffledSongs.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [shuffledSongs[i], shuffledSongs[j]] = [shuffledSongs[j], shuffledSongs[i]];
                      }
                      
                      setCurrentSongPlaylist(shuffledSongs);
                      playSong(shuffledSongs[0]);
                      setCurrentSong(shuffledSongs[0]);
                    }
                  }}
                >
                  <Ionicons name="shuffle" size={18} color={isDark ? '#1DB954' : '#1DB954'} />
                  <Text style={styles.shuffleButtonText}>Перемішати</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {selectedAlbum.songs?.length > 0 ? (
              selectedAlbum.songs.map((song, index) => (
                <Animated.View
                  key={song._id}
                  style={[
                    styles.newSongItem,
                    { 
                      backgroundColor: currentSong?._id === song._id 
                        ? (isDark ? 'rgba(29, 185, 84, 0.15)' : 'rgba(29, 185, 84, 0.1)') 
                        : 'transparent'
                    }
                  ]}
                  entering={FadeIn.duration(300).delay(100 + index * 50)}
                >
                  <TouchableOpacity
                    style={styles.newSongItemContent}
                    onPress={() => {
                      setCurrentSongPlaylist(selectedAlbum.songs);
                      playSong(song);
                      setCurrentSong(song);
                    }}
                  >
                    <View style={styles.songNumberAndPlay}>
                      {currentSong?._id === song._id ? (
                        renderVisualizer()
                      ) : (
                        <Text style={[
                          styles.songNumber, 
                          { color: isDark ? '#aaa' : '#777' }
                        ]}>
                          {index + 1}
                        </Text>
                      )}
                    </View>
                    
                    <View style={styles.songMainInfo}>
                      <Text 
                        style={[
                          styles.newSongTitle, 
                          { 
                            color: currentSong?._id === song._id 
                              ? '#1DB954' 
                              : (isDark ? '#fff' : '#000')
                          }
                        ]} 
                        numberOfLines={1}
                      >
                        {song.title}
                      </Text>
                      <Text 
                        style={[
                          styles.newSongArtist, 
                          { color: isDark ? '#aaa' : '#666' }
                        ]} 
                        numberOfLines={1}
                      >
                        {song.artist}
                      </Text>
                    </View>
                    
                    <View style={styles.songRightControls}>
                      <Text style={[
                        styles.songDuration, 
                        { color: isDark ? '#aaa' : '#777' }
                      ]}>
                        {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                      </Text>
                      
                      <TouchableOpacity style={styles.songMoreButton}>
                        <Ionicons 
                          name="ellipsis-vertical" 
                          size={16} 
                          color={isDark ? '#ccc' : '#777'} 
                        />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons 
                  name="musical-notes" 
                  size={50} 
                  color={isDark ? '#555' : '#ccc'} 
                />
                <Text style={[
                  styles.emptyText, 
                  { color: isDark ? '#aaa' : '#777' }
                ]}>
                  У цьому альбомі немає пісень
                </Text>
                <TouchableOpacity 
                  style={styles.emptyAddButton}
                  onPress={() => {
                    setNewAlbumId(selectedAlbum._id);
                    setSongSelectionModalVisible(true);
                  }}
                >
                  <Text style={styles.emptyAddButtonText}>
                    Додати пісні
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  };

  // Create a debounced version of fetchPublicPlaylists
  const debouncedFetchPlaylists = useCallback(
    debounce((query: string) => {
      fetchPublicPlaylists(query);
    }, 500),
    [fetchPublicPlaylists]
  );
  
  // Separate effects for initial data loading and search updates
  // Initial data loading effect - only runs when activeFilter changes
  useEffect(() => {
    console.log('Active filter changed to:', activeFilter);
    
    if (activeFilter === 'all') {
      fetchSongs('');
    } else if (activeFilter === 'albums') {
      fetchAlbums('');
    } else if (activeFilter === 'playlists') {
      fetchPublicPlaylists('');
    }
    
    // Reset selected album when switching away from albums
    if (activeFilter !== 'albums') {
      setSelectedAlbum(null);
    }
  }, [activeFilter, fetchSongs, fetchAlbums, fetchPublicPlaylists]);

  // Handle playlist selection - show playlist details and songs
  const handlePlaylistPress = async (playlist: Playlist) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/playlists/${playlist._id}`);
      
      if (response.data && response.data.playlist) {
        const playlistDetails = response.data.playlist;
        // Handle the selected playlist here
        // You could use a similar approach to selectedAlbum
        console.log('Selected playlist:', playlistDetails);
        
        // For now, if the playlist has songs, set the current song playlist and play the first song
        if (playlistDetails.songs && playlistDetails.songs.length > 0) {
          setCurrentSongPlaylist(playlistDetails.songs);
          const firstSong = playlistDetails.songs[0];
          if (typeof firstSong !== 'string') {
            playSong(firstSong);
            setCurrentSong(firstSong);
          }
        }
      }
    } catch (err: any) {
      console.error(`Error fetching playlist details: ${err.message}`);
      Alert.alert('Помилка', `Не вдалося завантажити деталі плейлиста: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Get playlist cover image path
  const getPlaylistCoverPath = (playlist: Playlist) => {
    if (!playlist.coverImage || playlist.coverImage === 'default-playlist-cover.jpg') {
      return undefined;
    }
    
    if (playlist.coverImage.startsWith('http')) {
      return playlist.coverImage;
    }
    
    return playlist.coverImage;
  };
  
  // Render playlist item
  const renderPlaylistItem = ({ item }: { item: Playlist }) => {
    const coverImage = getPlaylistCoverPath(item);
    
    return (
      <TouchableOpacity 
        style={styles.playlistItem} 
        onPress={() => handlePlaylistPress(item)}
      >
        <Image 
          source={getImageSource(coverImage)}
          style={styles.playlistCover}
          onError={() => console.log(`Error loading cover for playlist: ${item.name}`)}
        />
        <View style={styles.playlistInfo}>
          <Text style={[styles.playlistName, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            {item.name}
          </Text>
          {item.description && (
            <Text style={styles.playlistDescription} numberOfLines={1}>
              {item.description}
            </Text>
          )}
          <Text style={styles.playlistSongs}>
            {Array.isArray(item.songs) ? item.songs.length : 0} треків
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilteredContent = () => {
    if (loading || loadingAlbum || loadingPlaylists) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
          <Text style={styles.loadingText}>Завантаження...</Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              if (activeFilter === 'albums') fetchAlbums();
              else if (activeFilter === 'playlists') fetchPublicPlaylists(searchQuery);
              else fetchSongs();
            }}
          >
            <Text style={styles.retryButtonText}>Повторити</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (activeFilter === 'all') {
      return (
        <FlatList
          data={filteredSongs}
          renderItem={renderSongItem}
          keyExtractor={item => item._id}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: currentSong && !isPlayerVisible ? 90 : 20 // Changed from 70 to 90 for consistency
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Animated.View entering={SlideInRight.duration(300).springify()} style={styles.emptyContainer}>
              <Text style={{
                fontSize: 50,
              }}>😔</Text>
              <Text style={styles.emptyText}>Нічого не знайдено</Text>
            </Animated.View>
          }
        />
      );
    } else if (activeFilter === 'albums') {
      // If we have selected album, show its songs
      if (selectedAlbum) {
        return renderSelectedAlbumContent();
      }
      
      // Otherwise show list of albums
      return (
        <FlatList
          data={albums}
          renderItem={renderAlbumItem}
          keyExtractor={item => item._id}
          contentContainerStyle={{
            paddingVertical: 10,
            paddingBottom: currentSong && !isPlayerVisible ? 90 : 20 // Changed from 70 to 90 for consistency
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Animated.View entering={SlideInRight.duration(300).springify()} style={styles.emptyContainer}>
              <Text style={{
                fontSize: 50,
              }}>😔</Text>
              <Text style={styles.emptyText}>Альбоми не знайдені</Text>
            </Animated.View>
          }
        />
      );
    } else if (activeFilter === 'playlists') {
      return (
        <FlatList
          data={publicPlaylists}
          renderItem={renderPlaylistItem}
          keyExtractor={item => item._id}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: currentSong && !isPlayerVisible ? 90 : 20 // Changed from 70 to 90 for consistency
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Animated.View entering={SlideInRight.duration(300).springify()} style={styles.emptyContainer}>
              <Text style={{
                fontSize: 50,
              }}>😔</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Плейлисти не знайдені' : 'Введіть пошуковий запит для пошуку публічних плейлистів'}
              </Text>
            </Animated.View>
          }
        />
      );
    }
    
    return null;
  };

  // Add state for album creation modal
  const [albumModalVisible, setAlbumModalVisible] = useState(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [newAlbumArtist, setNewAlbumArtist] = useState('');
  const [newAlbumYear, setNewAlbumYear] = useState('');
  const [songSelectionModalVisible, setSongSelectionModalVisible] = useState(false);
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>([]);
  const [newAlbumId, setNewAlbumId] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Function to create album
  const createAlbum = async () => {
    if (!newAlbumTitle.trim() || !newAlbumArtist.trim()) {
      Alert.alert('Помилка', 'Назва та виконавець альбому є обов\'язковими');
      return;
    }
    
    try {
      setLoading(true);
      console.log(`Creating album with title: ${newAlbumTitle}, artist: ${newAlbumArtist}, API URL: ${API_URL}`);
      
      const response = await axios.post(`${API_URL}/api/albums`, {
        title: newAlbumTitle,
        artist: newAlbumArtist,
        year: newAlbumYear ? parseInt(newAlbumYear) : undefined,
      });
      
      if (response.data && response.data.album) {
        const album = response.data.album;
        console.log('Album created successfully:', album._id);
        setNewAlbumId(album._id);
        
        // Find songs that match the album name to auto-add them
        try {
          const songsResponse = await axios.get(`${API_URL}/api/songs`);
          if (Array.isArray(songsResponse.data)) {
            const matchingSongs = songsResponse.data.filter(song => 
              song.album && song.album.toLowerCase() === newAlbumTitle.toLowerCase() && 
              song.artist.toLowerCase() === newAlbumArtist.toLowerCase()
            );
            
            if (matchingSongs.length > 0) {
              // Add matching songs to the album
              const songIds = matchingSongs.map(song => song._id);
              await axios.post(`${API_URL}/api/albums/${album._id}/songs`, {
                songIds: songIds
              });
              
              Alert.alert(
                'Успіх', 
                `Альбом створено. Автоматично додано ${matchingSongs.length} пісень з такою ж назвою альбому.`
              );
            } else {
              Alert.alert('Успіх', 'Альбом створено. Тепер ви можете додати до нього пісні.');
              // Open song selection modal since no automatic matches were found
              setSongSelectionModalVisible(true);
            }
          }
        } catch (err) {
          console.error('Error auto-adding songs:', err);
          Alert.alert('Успіх', 'Альбом створено. Тепер ви можете додати до нього пісні вручну.');
          setSongSelectionModalVisible(true);
        }
        
        // Fetch albums to update the list
        fetchAlbums();
      }
    } catch (error: any) {
      console.error('Error creating album:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Не вдалося створити альбом';
      Alert.alert('Помилка', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Function to add selected songs to album
  const addSongsToAlbum = async () => {
    if (!newAlbumId || selectedSongIds.length === 0) {
      Alert.alert('Помилка', 'Виберіть пісні для додавання до альбому');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await axios.post(`${API_URL}/api/albums/${newAlbumId}/songs`, {
        songIds: selectedSongIds
      });
      
      if (response.data && response.data.album) {
        Alert.alert('Успіх', 'Пісні додано до альбому');
        setSongSelectionModalVisible(false);
        setAlbumModalVisible(false);
        
        // Reset form
        setNewAlbumTitle('');
        setNewAlbumArtist('');
        setNewAlbumYear('');
        setSelectedSongIds([]);
        setNewAlbumId(null);
        
        // Fetch albums to update the list
        fetchAlbums();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Не вдалося додати пісні до альбому';
      Alert.alert('Помилка', errorMessage);
      console.error('Error adding songs to album:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load songs when song selection modal becomes visible
  useEffect(() => {
    if (songSelectionModalVisible) {
      // Load songs for selection regardless of current filter
      setLoadingSongs(true);
      axios.get(`${API_URL}/api/songs`)
        .then(response => {
          if (Array.isArray(response.data)) {
            console.log('Loaded songs for selection:', response.data.length);
            setSongs(response.data);
          } else {
            console.error('Unexpected response format:', response.data);
            Alert.alert('Помилка', 'Не вдалося завантажити пісні для вибору');
          }
        })
        .catch(err => {
          console.error('Error loading songs for selection:', err);
          Alert.alert('Помилка', `Не вдалося завантажити пісні: ${err.message}`);
        })
        .finally(() => {
          setLoadingSongs(false);
        });
    }
  }, [songSelectionModalVisible]);

  // Function to handle song selection
  const toggleSongSelection = (songId: string) => {
    if (selectedSongIds.includes(songId)) {
      setSelectedSongIds(selectedSongIds.filter(id => id !== songId));
    } else {
      setSelectedSongIds([...selectedSongIds, songId]);
    }
  };

  // Function to pick and upload album cover
  const pickAlbumCover = async () => {
    if (!newAlbumId) {
      Alert.alert('Помилка', 'Спочатку створіть альбом');
      return;
    }
    
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Помилка', 'Потрібен доступ до галереї для вибору обкладинки');
      return;
    }
    
    try {
      // Open image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        
        // Create form data for image upload
        const formData = new FormData();
        const filename = selectedImage.uri.split('/').pop() || 'cover.jpg';
        
        // Append image to form data
        formData.append('coverImage', {
          uri: selectedImage.uri,
          name: filename,
          type: 'image/jpeg',
        } as any);
        
        // Show loading indicator
        setUploadingCover(true);
        
        // Upload image to server
        const uploadResponse = await axios.post(
          `${API_URL}/api/albums/upload-cover/${newAlbumId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        
        if (uploadResponse.data && uploadResponse.data.album) {
          // Clear image error for this album
          setAlbumImageErrors(prev => ({
            ...prev,
            [newAlbumId]: false
          }));
          
          Alert.alert('Успіх', 'Обкладинку альбому оновлено');
          
          // Fetch albums to update the list
          fetchAlbums();
        }
      }
    } catch (error: any) {
      console.error('Error uploading album cover:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Не вдалося завантажити обкладинку';
      Alert.alert('Помилка', errorMessage);
    } finally {
      setUploadingCover(false);
    }
  };

  // Create debounced search function with proper dependencies
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (activeFilter === 'all') {
        fetchSongs(query);
      } else if (activeFilter === 'albums') {
        fetchAlbums(query);
      } else if (activeFilter === 'playlists') {
        fetchPublicPlaylists(query);
      }
    }, 500),
    [fetchSongs, fetchAlbums, fetchPublicPlaylists, activeFilter]
  );
  
  // Separate effect that only triggers on searchQuery changes
  useEffect(() => {
    if (searchQuery) {
      console.log('Search query changed, executing search for:', searchQuery);
      debouncedSearch(searchQuery);
    }
  }, [searchQuery, debouncedSearch]);

  // Предварительная загрузка изображений для всех песен
  useEffect(() => {
    if (songs.length > 0) {
      console.log('Preloading covers for', songs.length, 'songs');
      // Загружаем все обложки заранее
      songs.forEach(song => {
        const coverPath = getSongCoverPath(song);
        if (coverPath) {
          getImageSource(coverPath);
        }
      });
    }
  }, [songs]);

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}
      entering={FadeIn.duration(350).springify()}
    >
      {isPlayerVisible && currentSong ? (
        <MusicPlayerUI
          song={{
            id: currentSong._id,
            title: currentSong.title,
            artist: currentSong.artist,
            imageUrl: getImageSource(getSongCoverPath(currentSong)),
            duration: formatDuration(currentSong.duration)
          }}
          isVisible={isPlayerVisible}
          onClose={() => setIsPlayerVisible(false)}
        />
      ) : (
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>Музика</Text>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#888888" style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: isDark ? '#FFFFFF' : '#000000' }]}
              placeholder="Пошук музики..."
              placeholderTextColor="#888888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#888888" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.filterContainer}>
            <TouchableOpacity 
              key="all" 
              style={[
                styles.filterButton, 
                activeFilter === 'all' ? styles.activeFilterButton : {}
              ]}
              onPress={() => setActiveFilter('all')}
            >
              <Text style={activeFilter === 'all' ? styles.activeFilterText : [styles.filterText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Всі
              </Text>
            </TouchableOpacity>
            
            
            <TouchableOpacity 
              key="albums" 
              style={[
                styles.filterButton, 
                activeFilter === 'albums' ? styles.activeFilterButton : {}
              ]}
              onPress={() => setActiveFilter('albums')}
            >
              <Text style={activeFilter === 'albums' ? styles.activeFilterText : [styles.filterText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Альбоми
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              key="playlists" 
              style={[
                styles.filterButton, 
                activeFilter === 'playlists' ? styles.activeFilterButton : {}
              ]}
              onPress={() => setActiveFilter('playlists')}
            >
              <Text style={activeFilter === 'playlists' ? styles.activeFilterText : [styles.filterText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Плейлисти
              </Text>
            </TouchableOpacity>
          </View>

          {activeFilter === 'playlists' && (
            <View style={[styles.playlistInfoContainer, { marginHorizontal: 20, marginTop: 10, marginBottom: 5 }]}>
              <Text style={[styles.playlistInfoText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Результати пошуку показують публічні плейлисти
              </Text>
            </View>
          )}

          {activeFilter === 'albums' && (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setAlbumModalVisible(true)}
            >
              <Ionicons name="add" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
              <Text style={[styles.createButtonText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Створити альбом
              </Text>
            </TouchableOpacity>
          )}

          {renderFilteredContent()}

          {currentSong && !isPlayerVisible && (
            <MiniPlayerUI
              song={{
                id: currentSong._id,
                title: currentSong.title,
                artist: currentSong.artist,
                imageUrl: getImageSource(getSongCoverPath(currentSong)),
                duration: formatDuration(currentSong.duration)
              }}
              onPress={handleOpenPlayer}
              onDismiss={() => setCurrentSong(null)}
            />
          )}

          {/* Album Creation Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={albumModalVisible}
            onRequestClose={() => setAlbumModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
                <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  Створити альбом
                </Text>
                
                <TextInput
                  style={[styles.input, { color: isDark ? '#FFFFFF' : '#000000', borderColor: isDark ? '#333333' : '#E5E5E5' }]}
                  placeholder="Назва альбому"
                  placeholderTextColor="#888888"
                  value={newAlbumTitle}
                  onChangeText={setNewAlbumTitle}
                />
                
                <TextInput
                  style={[styles.input, { color: isDark ? '#FFFFFF' : '#000000', borderColor: isDark ? '#333333' : '#E5E5E5' }]}
                  placeholder="Виконавець"
                  placeholderTextColor="#888888"
                  value={newAlbumArtist}
                  onChangeText={setNewAlbumArtist}
                />
                
                <TextInput
                  style={[styles.input, { color: isDark ? '#FFFFFF' : '#000000', borderColor: isDark ? '#333333' : '#E5E5E5' }]}
                  placeholder="Рік випуску (необов'язково)"
                  placeholderTextColor="#888888"
                  value={newAlbumYear}
                  onChangeText={text => {
                    // Allow only digits
                    const numericValue = text.replace(/[^0-9]/g, '');
                    setNewAlbumYear(numericValue);
                  }}
                  keyboardType="numeric"
                  maxLength={4}
                />
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.cancelButton]}
                    onPress={() => {
                      setAlbumModalVisible(false);
                      setNewAlbumTitle('');
                      setNewAlbumArtist('');
                      setNewAlbumYear('');
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Скасувати</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.createAlbumButton]}
                    onPress={createAlbum}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.createAlbumButtonText}>Створити</Text>
                    )}
                  </TouchableOpacity>
                </View>
                
                {newAlbumId && (
                  <TouchableOpacity
                    style={styles.uploadCoverButton}
                    onPress={pickAlbumCover}
                    disabled={uploadingCover}
                  >
                    {uploadingCover ? (
                      <ActivityIndicator size="small" color="#1DB954" />
                    ) : (
                      <>
                        <Ionicons name="image" size={20} color="#1DB954" />
                        <Text style={styles.uploadCoverText}>Завантажити обкладинку</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Modal>

          {/* Song Selection Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={songSelectionModalVisible}
            onRequestClose={() => setSongSelectionModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF', height: '80%' }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    Вибрати пісні для альбому
                  </Text>
                  <TouchableOpacity onPress={() => setSongSelectionModalVisible(false)}>
                    <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
                  </TouchableOpacity>
                </View>
                
                {loadingSongs ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1DB954" />
                    <Text style={{ color: isDark ? '#FFFFFF' : '#000000', marginTop: 10 }}>
                      Завантаження пісень...
                    </Text>
                  </View>
                ) : songs.length > 0 ? (
                  <>
                    <FlatList
                      data={songs}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[
                            styles.songSelectionItem,
                            { backgroundColor: selectedSongIds.includes(item._id) ? 
                              (isDark ? 'rgba(29, 185, 84, 0.2)' : 'rgba(29, 185, 84, 0.1)') : 
                              (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)') 
                            }
                          ]}
                          onPress={() => toggleSongSelection(item._id)}
                        >
                          <View style={styles.songSelectionCheckbox}>
                            {selectedSongIds.includes(item._id) && (
                              <Ionicons name="checkmark" size={22} color="#1DB954" />
                            )}
                          </View>
                          <Image 
                            source={getImageSource(getSongCoverPath(item))}
                            style={styles.songSelectionCover}
                          />
                          <View style={styles.songInfo}>
                            <Text style={[styles.songTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                              {item.title}
                            </Text>
                            <Text style={styles.songArtist}>
                              {item.artist}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}
                      keyExtractor={item => item._id}
                      contentContainerStyle={styles.songsList}
                    />
                    
                    <TouchableOpacity
                      style={[
                        styles.addSongsButton,
                        { opacity: selectedSongIds.length > 0 ? 1 : 0.5 }
                      ]}
                      onPress={addSongsToAlbum}
                      disabled={selectedSongIds.length === 0 || loading}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons name="add" size={20} color="#FFFFFF" />
                          <Text style={styles.addSongsButtonText}>
                            Додати {selectedSongIds.length} {selectedSongIds.length === 1 ? 'пісню' : 'пісень'}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                      Немає доступних пісень
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  activeText: {
    color: '#D0D0B9',
    fontFamily: FontFamily.medium,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    ...Typography.h2,
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 15,
    height: 44,
    backgroundColor: '#111111',
    borderRadius: 100,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    ...Typography.body2,
    color: '#FFFFFF',
    fontSize: 14,
  },
  clearButton: {
    padding: 5,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  filterButton: {
    marginRight: 10,
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: '#111111',
    borderRadius: 100,
  },
  activeFilterButton: {
    backgroundColor: '#DEDEDF',
  },
  filterText: {
    ...Typography.body2,
    color: '#FFFFFF',
  },
  activeFilterText: {
    ...Typography.body2,
    color: '#00000',
    fontFamily: FontFamily.semiBold,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    fontFamily: FontFamily.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    fontFamily: FontFamily.medium,
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#1DB954',
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FontFamily.medium,
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 18,
    color: '#666',
    fontFamily: FontFamily.medium,
  },
  songsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  listHeader: {
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  listHeaderTitle: {
    ...Typography.caption,
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginVertical: 6,
    elevation: 0,
  },

  songImageContainer: {
    position: 'relative',
    marginRight: 14,
  },
  songImage: {
    width: 58,
    height: 58,
    borderRadius: 12,
    backgroundColor: '#2A2A2A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  songInfo: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 8,
  },
  songTitle: {
    ...Typography.body1,
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  songArtist: {
    ...Typography.caption,
    color: '#888888',
    flex: 0,
    fontSize: 13,
  },
  songDotSeparator: {
    ...Typography.caption,
    color: '#888888',
    marginHorizontal: 4,
  },
  songDetails: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 4,
  },
  likeButton: {
    padding: 8,
    height: 44,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  songDuration: {
    ...Typography.caption,
    color: '#888888',
    marginRight: 8,
    fontFamily: FontFamily.medium,
  },
  moreButton: {
    padding: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyIconContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 60,
    opacity: 0.5,
  },
  emptyIconOverlay: {
    position: 'absolute',
    fontSize: 34,
    right: 5,
    bottom: 5,
  },
  emptyText: {
    ...Typography.h3,
    color: '#888888',
    marginTop: 10,
  },
  emptySubtext: {
    ...Typography.body2,
    color: '#666666',
    marginTop: 6,
  },
  albumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  albumCover: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
  albumInfo: {
    marginLeft: 16,
    flex: 1,
  },
  albumTitle: {
    ...Typography.subtitle1,
    marginBottom: 4,
  },
  albumArtist: {
    ...Typography.body2,
    color: '#888888',
    marginBottom: 4,
  },
  albumSongs: {
    ...Typography.caption,
    color: '#888888',
  },
  
  selectedAlbumContainer: {
    flex: 1,
  },
  albumHeroSection: {
    height: 320,
    position: 'relative',
    overflow: 'hidden',
  },
  albumBackgroundWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  albumBackgroundImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  albumBackgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    // Add a subtle gradient overlay
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  albumContentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 80,
    zIndex: 2,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    // Add subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  selectedAlbumCover: {
    width: 160,
    height: 160,
    borderRadius: 12,
    // Enhanced shadow for more depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  selectedAlbumInfo: {
    marginLeft: 20,
    flex: 1,
  },
  selectedAlbumTitle: {
    ...Typography.h3,
    fontFamily: FontFamily.bold,
    color: '#FFFFFF',
    marginBottom: 8,
    // Enhanced text shadow for better readability
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    fontSize: 24,
  },
  
  // New album view styles
  newAlbumContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a', // Dark theme background
  },
  albumStickyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    zIndex: 10,
  },
  newBackButton: {
    width: 40, 
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickyAlbumInfo: {
    flex: 1,
    marginLeft: 8,
  },
  stickyAlbumTitle: {
    ...Typography.subtitle1,
    fontFamily: FontFamily.semiBold,
    marginBottom: 2,
  },
  stickyAlbumArtist: {
    ...Typography.body2,
    fontFamily: FontFamily.regular,
  },
  albumScrollContent: {
    flex: 1,
  },
  newAlbumHeroSection: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 30,
  },
  newAlbumCoverContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    position: 'relative',
    alignSelf: 'center',
  },
  newAlbumCoverImage: {
    width: '100%',
    height: '100%',
  },
  albumCoverPlayButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    zIndex: 10,
  },
  playButtonCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  newAlbumMetadata: {
    marginBottom: 20,
  },
  newAlbumTitle: {
    ...Typography.h2,
    fontFamily: FontFamily.bold,
    marginBottom: 8,
    fontSize: 28,
  },
  newAlbumArtist: {
    ...Typography.subtitle1,
    fontFamily: FontFamily.medium,
    marginBottom: 16,
  },
  newAlbumStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  albumStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  albumStatText: {
    ...Typography.caption,
    marginLeft: 6,
  },
  newAlbumActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  newActionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  actionButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionButtonText: {
    ...Typography.caption,
    fontFamily: FontFamily.medium,
    color: '#ccc',
  },
  newSongListContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
    minHeight: 300,
  },
  songListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  songListTitle: {
    ...Typography.h3,
    fontFamily: FontFamily.bold,
    fontSize: 20,
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
  },
  shuffleButtonText: {
    ...Typography.caption,
    color: '#1DB954',
    marginLeft: 6,
    fontFamily: FontFamily.medium,
  },
  newSongItem: {
    borderRadius: 12,
    marginBottom: 8,
    paddingHorizontal: 6,
  },
  newSongItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  songNumberAndPlay: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  songNumber: {
    ...Typography.body2,
    fontFamily: FontFamily.medium,
  },
  visualizerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 24,
    width: 32,
  },
  visualizerBar: {
    width: 3,
    borderRadius: 1,
  },
  songMainInfo: {
    flex: 1,
    marginLeft: 12,
  },
  newSongTitle: {
    ...Typography.subtitle1,
    fontFamily: FontFamily.semiBold,
    marginBottom: 4,
  },
  newSongArtist: {
    ...Typography.caption,
    fontFamily: FontFamily.regular,
  },
  songRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    minWidth: 70,
    justifyContent: 'flex-end',
  },
  songMoreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyAddButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#1DB954',
    borderRadius: 20,
  },
  emptyAddButtonText: {
    ...Typography.button,
    color: '#fff',
    fontFamily: FontFamily.medium,
  },
  selectedAlbumArtist: {
    ...Typography.subtitle2,
    fontFamily: FontFamily.medium,
    color: '#FFFFFF',
    marginBottom: 8,
    // Enhanced text shadow for better readability
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    opacity: 0.9,
  },
  selectedAlbumDetails: {
    ...Typography.caption,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    opacity: 0.8,
  },
  albumInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotSeparator: {
    color: '#FFFFFF',
    opacity: 0.6,
    marginHorizontal: 8,
    fontSize: 12,
  },

  playAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1DB954',
    borderRadius: 25,
    paddingVertical: 13,
    paddingHorizontal: 25,
    flex: 1,
    marginRight: 10,
    // Enhanced shadow for more depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  playAllButtonText: {
    ...Typography.button,
    fontFamily: FontFamily.semiBold,
    color: '#FFFFFF',
    marginLeft: 10,
    fontSize: 15,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(29, 185, 84, 0.2)',
    marginRight: 10,
  },
  createButtonText: {
    ...Typography.button,
    fontSize: 14,
    marginLeft: 4,
  },
  songSelectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 8,
    borderRadius: 8,
  },
  songSelectionCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  uploadCoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#1DB954',
  },
  uploadCoverText: {
    ...Typography.button,
    color: '#1DB954',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    ...Typography.h2,
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#888888',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    ...Typography.button,
    color: '#FFFFFF',
  },
  createAlbumButton: {
    flex: 1,
    backgroundColor: '#1DB954',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 8,
  },
  createAlbumButtonText: {
    ...Typography.button,
    color: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  addSongsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#1DB954',
  },
  addSongsButtonText: {
    ...Typography.button,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  songSelectionCover: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 10,
  },
  albumActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: -25,
    zIndex: 10,
    // Add a subtle background card for the actions
    borderRadius: 30,
    padding: 8,
    paddingHorizontal: 10,
    // Add subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
    // Add glass-like effect with border
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  albumButtonsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addSongsToAlbumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    marginRight: 8,
    // Add subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  addSongsToAlbumButtonText: {
    ...Typography.button,
    marginLeft: 6,
    fontSize: 13,
    fontFamily: FontFamily.medium,
  },
  findSongsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    // Add subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  playlistItem: {
    flexDirection: 'row',
    marginVertical: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  playlistCover: {
    width: 60,
    height: 60,
    borderRadius: 4,
    backgroundColor: '#262626',
  },
  playlistInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  playlistName: {
    ...Typography.body1,
    fontFamily: FontFamily.semiBold,
    marginBottom: 4,
  },
  playlistDescription: {
    ...Typography.caption,
    color: '#888888',
    marginBottom: 4,
  },
  playlistSongs: {
    ...Typography.caption,
    color: '#888888',
  },
  playlistInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  playlistInfoText: {
    ...Typography.body2,
    color: '#888888',
  },
});
