import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Typography } from '@/constants/Typography';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';

type Song = {
  id: string;
  title: string;
  artist: string;
  imageUrl: string;
  audioUrl?: string;
  duration: string;
};

interface MiniPlayerProps {
  song: Song | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onPress: () => void;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ 
  song, 
  isPlaying, 
  onPlayPause, 
  onPress 
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!song) return null;

  return (
    <Animated.View 
      entering={SlideInUp.duration(300).springify()}
      style={[
        styles.container, 
        { backgroundColor: isDark ? '#1E1E1E' : '#F0F0F0' }
      ]}
    >
      <TouchableOpacity 
        style={styles.content} 
        activeOpacity={0.7} 
        onPress={onPress}
      >
        <Image source={{ uri: song.imageUrl }} style={styles.albumArt} />
        
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
          onPress={onPlayPause}
        >
          <Ionicons 
            name={isPlaying ? 'pause' : 'play'} 
            size={24} 
            color={isDark ? '#FFFFFF' : '#000000'} 
          />
        </TouchableOpacity>
      </TouchableOpacity>
      
      <View 
        style={[
          styles.progressBar, 
          { backgroundColor: isDark ? '#333333' : '#DDDDDD' }
        ]}
      >
        <Animated.View 
          style={[
            styles.progress, 
            { width: '30%', backgroundColor: '#1DB954' }
          ]} 
        />
      </View>
    </Animated.View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  albumArt: {
    width: 48,
    height: 48,
    borderRadius: 6,
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    ...Typography.subtitle1,
    fontSize: 14,
  },
  artist: {
    ...Typography.caption,
    color: '#888888',
    marginTop: 2,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
  },
  progressBar: {
    height: 2,
    width: '100%',
  },
  progress: {
    height: '100%',
  },
});

export default MiniPlayer;
