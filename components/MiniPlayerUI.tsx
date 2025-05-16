import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Typography } from '@/constants/Typography';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';

type Song = {
  id: string;
  title: string;
  artist: string;
  imageUrl: any; // Может быть как URI, так и объект из require()
  duration: string;
};

interface MiniPlayerUIProps {
  song: Song | null;
  onPress: () => void;
  onDismiss?: () => void;
}

const MiniPlayerUI: React.FC<MiniPlayerUIProps> = ({ song, onPress, onDismiss }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Animation values for swipe
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  
  const togglePlayPause = (e: any) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };
  
  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };
  
  // Gesture handler for swipe
  const panGesture = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      // Only allow swipe down (positive values) or small swipe up
      if (event.translationY > 0 || event.translationY > -50) {
        translateY.value = ctx.startY + event.translationY;
      }
      
      // Fade out as we swipe down
      if (event.translationY > 0) {
        opacity.value = 1 - Math.min(event.translationY / 100, 1);
      }
    },
    onEnd: (event) => {
      // If swiped down with enough velocity or distance, dismiss
      if (event.translationY > 50 || event.velocityY > 500) {
        translateY.value = withTiming(100, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 }, () => {
          runOnJS(handleDismiss)();
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
  
  if (!song) return null;

  return (
    <GestureHandlerRootView>
      <PanGestureHandler onGestureEvent={panGesture}>
        <Animated.View 
          style={[
            styles.container, 
            { backgroundColor: 'rgb(19, 19, 19)' },
            animatedStyle
          ]}
        >
      <TouchableOpacity 
        style={styles.content} 
        activeOpacity={0.7} 
        onPress={onPress}
      >
        <Image 
          source={typeof song.imageUrl === 'string' 
            ? { uri: Platform.OS === 'web' 
                ? `${song.imageUrl}?t=${new Date().getTime()}` // Добавляем timestamp для предотвращения кэширования
                : song.imageUrl
              } 
            : song.imageUrl} 
          style={styles.albumArt} 
          fadeDuration={0} // Убираем плавное появление, чтобы изображение обновлялось мгновенно
        />
        
        <View style={styles.songInfo}>
          <Text 
            style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}
            numberOfLines={1}
          >
            {song.title}
          </Text>
          <Text 
            style={styles.artist}
            numberOfLines={1}
          >
            {song.artist}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.playButton} 
          onPress={togglePlayPause}
        >
          <Ionicons 
            name={isPlaying ? 'pause' : 'play'} 
            size={24} 
            color={isDark ? '#FFFFFF' : '#000000'} 
          />
        </TouchableOpacity>
      </TouchableOpacity>
      
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progress, 
            { width: '30%' }
          ]} 
        />
      </View>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 70,
    alignSelf: 'center',
    width: 280,
    height: 70,
    borderRadius: 100,
    backgroundColor: 'rgba(18, 18, 18, 0.92)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 8,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: '100%',
  },
  albumArt: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    ...Typography.subtitle1,
    fontSize: 13,
    color: '#FFFFFF',
  },
  artist: {
    ...Typography.caption,
    color: '#AAAAAA',
    fontSize: 11,
    marginTop: 2,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(0, 0, 0)',
  },
  progressBar: {
    height: 1,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progress: {
    height: '100%',
    backgroundColor: '#1DB954',
  },
});

export default MiniPlayerUI;
