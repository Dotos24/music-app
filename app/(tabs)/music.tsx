import { FontFamily, Typography } from '@/constants/Typography';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert, Platform } from 'react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import MusicPlayerUI from '@/components/MusicPlayerUI';
import MiniPlayerUI from '@/components/MiniPlayerUI';
import axios from 'axios';
import { API_URL } from '@/constants/Config';
import { useAudio } from '@/contexts/AudioContext';
import { useLikes } from '@/contexts/LikesContext';

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
};

export default function MusicScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSong, setCurrentSong] = useState<SongItem | null>(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [songs, setSongs] = useState<SongItem[]>([]);
  
  // Используем аудио контекст
  const { playSong, currentSong: audioContextSong, setCurrentSongPlaylist } = useAudio();
  
  // Функция для загрузки песен с сервера
  const fetchSongs = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    console.log('Спробуємо завантажити пісні з:', `${API_URL}/api/songs`);
    
    try {
      const response = await axios.get(`${API_URL}/api/songs`);
      console.log('Отримані дані:', response.data);
      
      if (Array.isArray(response.data)) {
        console.log('Дані є масивом, довжина:', response.data.length);
        setSongs(response.data);
      } else {
        console.error('Отримані дані не є масивом:', typeof response.data);
        setError('Неправильний формат даних від сервера');
      }
      
      setLoading(false);
    } catch (err: any) {
      const errorMessage = err.message || 'Невідома помилка';
      const statusCode = err.response?.status || 'нема статус-коду';
      console.error(`Помилка при завантаженні пісень: ${errorMessage}, Статус: ${statusCode}`);
      setError(`Не вдалося завантажити пісні: ${errorMessage}. Перевірте, що сервер запущений за адресою ${API_URL}`);
      setLoading(false);
      // Використовуємо тестові дані в разі помилки
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
  }, []);
  
  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  useFocusEffect(
    useCallback(() => {
      fetchSongs();
    }, [fetchSongs])
  );

  const filteredSongs = searchQuery
    ? songs.filter(
        (song) =>
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (song.album && song.album.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : songs;

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

  // Загрузка изображения из папки assets с кэшированием
  const getImageSource = (assetName: string | undefined) => {
    // Если имя файла не передано, используем заглушку
    if (!assetName) {
      return require('@/assets/photo_2025-05-14_21-35-54.jpg');
    }
    
    // Проверяем кэш
    if (imageCache.current[assetName]) {
      return imageCache.current[assetName];
    }
    
    try {
      // Используем изображение из локальных ассетов Expo
      if (assetName === 'photo_2025-05-14_21-35-54.jpg') {
        const image = require('@/assets/photo_2025-05-14_21-35-54.jpg');
        imageCache.current[assetName] = image;
        return image;
      }
      
      const baseUrl = API_URL.replace(/\/$/, ''); // Удаляем слеш в конце, если есть
      const imageUrl = `${baseUrl}/assets/${assetName}`;
      const image = { uri: imageUrl };
      
      // Сохраняем в кэш
      imageCache.current[assetName] = image;
      return image;
    } catch (error) {
      console.error(`Ошибка при загрузке изображения ${assetName}:`, error);
      // Плейсхолдер в случае ошибки
      const fallbackImage = require('@/assets/photo_2025-05-14_21-35-54.jpg');
      imageCache.current[assetName] = fallbackImage;
      return fallbackImage;
    }
  };

  // Предварительная загрузка изображений для всех песен
  useEffect(() => {
    if (songs.length > 0) {
      // Загружаем все обложки заранее
      songs.forEach(song => {
        const coverPath = getSongCoverPath(song);
        if (coverPath) {
          getImageSource(coverPath);
        }
      });
    }
  }, [songs]);

  // Функция для получения пути к обложке из разных возможных полей
  const getSongCoverPath = (song: SongItem) => {
    console.log('Processing song:', JSON.stringify(song));
    
    // По приоритету проверяем разные возможные поля
    if (song.coverAsset) {
      console.log('Using coverAsset:', song.coverAsset);
      return song.coverAsset;
    } 
    // @ts-ignore - Проверка полей, которых может не быть в интерфейсе SongItem
    else if (song.coverFilePath) {
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
        console.log('Using web path for coverFilePath:', fileName);
        return fileName;
      }
      
      // Извлекаем имя файла из пути
      const fileName = song.coverFilePath.split('/').pop();
      console.log('Extracted filename:', fileName);
      return fileName || 'photo_2025-05-14_21-35-54.jpg';
    }
    // @ts-ignore - Проверка поля coverUrl
    else if (song.coverUrl && song.coverUrl.length > 0) {
      console.log('Using coverUrl:', song.coverUrl);
      return song.coverUrl;
    }
    
    // Если ничего не нашли, используем заглушку
    console.log('Using default image');
    return 'photo_2025-05-14_21-35-54.jpg';
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
            <TouchableOpacity style={[styles.filterButton, styles.activeFilterButton]}>
              <Text style={styles.activeFilterText}>Всі</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={[styles.filterText, { color: isDark ? '#FFFFFF' : '#000000' }]}>Альбоми</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={[styles.filterText, { color: isDark ? '#FFFFFF' : '#000000' }]}>Плейлисти</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1DB954" />
              <Text style={styles.loadingText}>Завантаження пісень...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchSongs}>
                <Text style={styles.retryButtonText}>Повторити</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredSongs}
              renderItem={renderSongItem}
              keyExtractor={item => item._id}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: currentSong ? 90 : 20,
                paddingTop: 10
              }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Animated.View entering={SlideInRight.duration(300).springify()} style={styles.emptyContainer}>
                  <View style={styles.emptyIconContainer}>
                    <Text style={styles.emptyIcon}>🎵</Text>
                    <Text style={styles.emptyIconOverlay}>🔍</Text>
                  </View>
                  <Text style={styles.emptyText}>Нічого не знайдено</Text>
                  <Text style={styles.emptySubtext}>Спробуйте змінити критерії пошуку</Text>
                </Animated.View>
              }
            />
          )}

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
    backgroundColor: '#FFFFFF',
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
  dotSeparator: {
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
});
