import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { Typography } from '@/constants/Typography';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useLikes } from '@/contexts/LikesContext';
import { useAudio } from '@/contexts/AudioContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import MusicPlayerUI from '@/components/MusicPlayerUI';
import MiniPlayerUI from '@/components/MiniPlayerUI';
import { API_URL } from '@/constants/Config';

export default function FavoritesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { likedSongs, removeLike } = useLikes();
  const { playSong, currentSong, isPlaying, setCurrentSongPlaylist } = useAudio();
  
  
  const [showPlayer, setShowPlayer] = useState(false);
  
  
  useEffect(() => {
    console.log('Current song in favorites:', currentSong);
  }, [currentSong]);
  
  
  const preparePlayerSong = (song: any) => {
    if (!song) return null;
    return {
      id: song._id,
      title: song.title,
      artist: song.artist,
      imageUrl: getImageSource(song.coverFilePath || song.coverAsset),
      duration: song.duration
    };
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  
  const getImageSource = (coverPath: string | undefined) => {
    if (!coverPath) {
      return require('@/assets/photo_2025-05-14_21-35-54.jpg');
    }
    
    try {
      
      if (coverPath.startsWith('http')) {
        return { uri: coverPath };
      }
      
     
      const baseUrl = API_URL.replace(/\/$/, '');
      
     
      let fileName = coverPath;
      
      
      if (fileName.startsWith('/assets/')) {
        fileName = fileName.substring(8); 
      } else if (fileName.startsWith('assets/')) {
        fileName = fileName.substring(7); 
        fileName = fileName.substring(1); 
      }
      
      if (fileName.includes('/')) {
        fileName = fileName.split('/').pop() || fileName;
      }
      
      
      return { uri: `${baseUrl}/assets/${fileName}` };
    } catch (error) {
      return require('@/assets/photo_2025-05-14_21-35-54.jpg');
    }
  };

  
  const handleSongPress = (song: any) => {
    
    playSong(song);
    
    setShowPlayer(true);
  };

 
  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.songItem} 
      activeOpacity={0.7}
      onPress={() => handleSongPress(item)}
    >
      <Image 
        source={getImageSource(item.coverFilePath || item.coverAsset)}
        style={styles.songImage} 
        defaultSource={require('@/assets/photo_2025-05-14_21-35-54.jpg')}
      />
      <View style={styles.songInfo}>
        <Text style={[styles.songTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>{item.title}</Text>
        <Text style={styles.songArtist}>{item.artist}</Text>
        {item.album && <Text style={styles.songArtist}>{item.album}</Text>}
      </View>
      <View style={styles.songDetails}>
        <Text style={styles.songDuration}>{formatDuration(item.duration)}</Text>
        <TouchableOpacity 
          style={styles.likeButton}
          onPress={() => removeLike(item._id)}
        >
          <Ionicons 
            name="heart" 
            size={22} 
            color="#ff3b5c" 
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      {}
      {currentSong && showPlayer && (
        <View style={styles.fullPlayerContainer}>
          <MusicPlayerUI 
            song={preparePlayerSong(currentSong)} 
            isVisible={showPlayer} 
            onClose={() => setShowPlayer(false)} 
          />
        </View>
      )}
      
      {/* Основной контент */}
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View 
          style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}
          entering={FadeIn.duration(350).springify()}
        >
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>Улюблене</Text>
          </View>

          {likedSongs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="heart" size={80} color="#ff3b5c" style={styles.emptyIcon} />
              <Text style={styles.emptyText}>Ви ще не додали жодної пісні до улюблених</Text>
              <Text style={styles.emptySubtext}>Натисніть на іконку серця біля пісні, щоб додати її сюди</Text>
            </View>
          ) : (
            <FlatList
              data={likedSongs}
              renderItem={renderItem}
              keyExtractor={item => item._id}
              contentContainerStyle={[styles.listContainer, currentSong ? { paddingBottom: 70 } : {}]}
              showsVerticalScrollIndicator={false}
            />
          )}
          
          {}
          {currentSong && !showPlayer && (
            <View style={styles.miniPlayerContainer}>
              <MiniPlayerUI 
                song={preparePlayerSong(currentSong)} 
                onPress={() => setShowPlayer(true)} 
              />
            </View>
          )}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 24,
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  songImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  songInfo: {
    flex: 1,
    marginLeft: 15,
  },
  songTitle: {
    ...Typography.subtitle1,
    color: '#FFFFFF',
  },
  songArtist: {
    ...Typography.caption,
    color: '#888888',
    marginTop: 4,
  },
  songDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  songDuration: {
    ...Typography.caption,
    color: '#888888',
    marginRight: 15,
  },
  likeButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 20,
    opacity: 0.8,
  },
  emptyText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    ...Typography.body2,
    color: '#888888',
    textAlign: 'center',
  },
  miniPlayerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  fullPlayerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
});
