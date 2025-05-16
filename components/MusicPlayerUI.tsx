import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Pressable, Platform, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FontFamily, Typography } from '@/constants/Typography';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAudio } from '@/contexts/AudioContext';

type Song = {
  id: string;
  title: string;
  artist: string;
  imageUrl: any; // Может быть как URI, так и объект из require()
  duration: string;
};

interface MusicPlayerUIProps {
  song: Song | null;
  isVisible: boolean;
  onClose: () => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const MusicPlayerUI: React.FC<MusicPlayerUIProps> = ({ song, isVisible, onClose }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Используем аудио контекст
  const { 
    isPlaying, 
    position, 
    duration, 
    pauseSong, 
    resumeSong,
    seekTo,
    playNextSong,
    playPreviousSong
  } = useAudio();
  
  // Сохраняем ширину прогресс-бара для перемотки
  const progressBarWidth = useRef(0);
  
  // Animation values for swipe
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  
  const togglePlayPause = () => {
    if (isPlaying) {
      pauseSong();
    } else {
      resumeSong();
    }
  };
  
  const handleSeek = (value: number) => {
    seekTo(value * duration);
  };
  
  // Gesture handler for swipe
  const panGesture = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      // Only allow swipe down (positive values)
      if (event.translationY > 0) {
        translateY.value = ctx.startY + event.translationY;
        
        // Fade out slightly as we swipe down
        opacity.value = 1 - Math.min(event.translationY / 300, 0.3);
      }
    },
    onEnd: (event) => {
      // If swiped down with enough velocity or distance, dismiss
      if (event.translationY > 100 || event.velocityY > 500) {
        translateY.value = withTiming(800, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(onClose)();
        });
      } else {
        // Otherwise, snap back
        translateY.value = withTiming(0);
        opacity.value = withTiming(1);
      }
    },
  });
  
  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });
  
  if (!isVisible || !song) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PanGestureHandler onGestureEvent={panGesture}>
        <Animated.View 
          style={[
            styles.container, 
            { backgroundColor: '#000000' },
            animatedStyle
          ]}
        >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Зараз грає
        </Text>
      </View>

      <View style={styles.albumArtContainer}>
        <View style={styles.albumBackgroundWrapper}>
          <Image 
            source={typeof song.imageUrl === 'string' 
              ? { uri: Platform.OS === 'web' 
                  ? `${song.imageUrl}?t=${new Date().getTime()}` // Добавляем timestamp для предотвращения кэширования
                  : song.imageUrl
                } 
              : song.imageUrl
            }
            style={styles.albumBackgroundImage}
            blurRadius={150}
            resizeMode="cover"
            fadeDuration={0} // Убираем плавное появление, чтобы изображение обновлялось мгновенно
          />
        </View>
        <Image
          source={typeof song.imageUrl === 'string' 
            ? { uri: Platform.OS === 'web' 
                ? `${song.imageUrl}?t=${new Date().getTime()+1}` // Используем другой timestamp для этого изображения
                : song.imageUrl
              } 
            : song.imageUrl
          }
          style={styles.albumArt}
          resizeMode="cover"
          fadeDuration={0} // Убираем плавное появление
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.songTitle}>
          {song.title}
        </Text>
        <Text style={styles.artistName}>{song.artist}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={styles.progressTrack} />
          <View 
            style={[styles.progressFill, { width: `${(position / (duration || 1)) * 100}%` }]}
          />
          <TouchableOpacity 
            style={styles.progressBarTouch}
            activeOpacity={1}
            onLayout={(e) => {
              // Сохраняем ширину прогресс-бара при его изменении
              progressBarWidth.current = e.nativeEvent.layout.width;
            }}
            onPress={(e) => {
              // Получаем координаты нажатия относительно прогресс-бара
              const { locationX } = e.nativeEvent;
              const width = progressBarWidth.current;
              if (width > 0) {
                const seekPosition = locationX / width;
                console.log(`Перемотка на позицию: ${seekPosition.toFixed(2)} (${Math.floor(seekPosition * duration)} сек)`);
                handleSeek(seekPosition);
              }
            }}
          >
            <Pressable 
              style={[styles.progressThumb, { left: `${(position / (duration || 1)) * 100}%` }]}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(Math.floor(position))}</Text>
          <Text style={styles.timeText}>{formatTime(Math.floor(duration))}</Text>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.secondaryControlButton}>
          <Ionicons name="shuffle" size={22} color="#888888" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.primaryControlButton}
          onPress={playPreviousSong}
        >
          <Ionicons name="play-skip-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.playPauseButton} onPress={togglePlayPause}>
          <View style={styles.playPauseInner}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={30}
              color="#FFFFFF"
            />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.primaryControlButton}
          onPress={playNextSong}
        >
          <Ionicons name="play-skip-forward" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryControlButton}>
          <Ionicons name="repeat" size={22} color="#888888" />
        </TouchableOpacity>
      </View>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 0,
    alignItems: 'center',
  },
  progressBarTouch: {
    position: 'absolute',
    width: '100%',
    height: 40,
    justifyContent: 'center',
    zIndex: 10,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  headerHandle: {
    position: 'absolute',
    top: -5,
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#555555',
    opacity: 0.3,
    left: (width - 40) / 2,
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    textAlign: 'center',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  menuButton: {
    padding: 5,
  },
  albumArtContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    position: 'relative',
    width: width - 40,
    height: width - 120,
  },
  albumBackgroundWrapper: {
    position: 'absolute',
    top: -width,
    left: -width,
    right: -width,
    bottom: -width * 2,
    borderRadius: 0,
    overflow: 'hidden',
    zIndex: -1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  albumBackgroundImage: {
    width: width * 4,
    height: width * 4,
    opacity: 0.4,
    transform: [{ scale: 0.6 }],
  },
  albumArt: {
    width: width - 120,
    height: width - 120,
    borderRadius: 16,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
    paddingHorizontal: 20,
  },
  songTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  artistName: {
    ...Typography.body1,
    color: '#AAAAAA',
    textAlign: 'center',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  progressContainer: {
    marginBottom: 40,
    width: '90%',
  },
  progressBar: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  progressTrack: {
    height: 3,
    width: '100%',
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressFill: {
    height: 3,
    position: 'absolute',
    left: 0,
    borderRadius: 1.5,
    backgroundColor: '#1DB954',
  },
  progressThumb: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    top: '50%',
    marginLeft: -6,
    marginTop: -6,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -10,
  },
  timeText: {
    ...Typography.caption,
    color: '#888888',
    fontSize: 12,
    marginTop: 8,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 50,
    paddingHorizontal: 30,
    width: '100%',
  },
  secondaryControlButton: {
    padding: 10,
    width: 50,
    alignItems: 'center',
  },
  primaryControlButton: {
    padding: 10,
    width: 50,
    alignItems: 'center',
  },
  playPauseButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(29, 185, 84, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    borderWidth: 1,
    borderColor: 'rgba(29, 185, 84, 0.3)',
  },
  playPauseInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  additionalControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    width: '100%',
  },
  additionalButton: {
    padding: 10,
    alignItems: 'center',
  },
  additionalButtonText: {
    ...Typography.caption,
    color: '#AAAAAA',
    marginTop: 5,
    fontSize: 11,
  },
});

export default MusicPlayerUI;
