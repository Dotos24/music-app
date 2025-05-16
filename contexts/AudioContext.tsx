import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { Audio } from 'expo-av';
import { Alert, Platform } from 'react-native';
import { API_URL } from '@/constants/Config';

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

interface AudioContextType {
  currentSong: SongItem | null;
  isPlaying: boolean;
  duration: number;
  position: number;
  playbackInstance: Audio.Sound | null;
  playbackStatus: any;
  playSong: (song: SongItem) => Promise<void>;
  pauseSong: () => Promise<void>;
  resumeSong: () => Promise<void>;
  stopSong: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  playNextSong: () => void;
  playPreviousSong: () => void;
  setCurrentSongPlaylist: (songs: SongItem[]) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<SongItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackInstance, setPlaybackInstance] = useState<Audio.Sound | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<any>(null);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [playlist, setPlaylist] = useState<SongItem[]>([]);

  // Инициализация аудио
  useEffect(() => {
    setupAudio();
    return () => {
      if (playbackInstance) {
        playbackInstance.unloadAsync();
      }
    };
  }, []);

  // Обновление статуса воспроизведения
  useEffect(() => {
    if (playbackStatus) {
      setIsPlaying(playbackStatus.isPlaying || false);
      setPosition(playbackStatus.positionMillis ? playbackStatus.positionMillis / 1000 : 0);
      setDuration(playbackStatus.durationMillis ? playbackStatus.durationMillis / 1000 : 0);
    }
  }, [playbackStatus]);

  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        interruptionModeIOS: 1, // Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: 1, // Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS
        playThroughEarpieceAndroid: false,
      });
      console.log('Аудио режим установлен');
    } catch (error) {
      console.error('Ошибка при настройке аудио:', error);
    }
  };

  const updatePlaybackStatus = (status: any) => {
    try {
      setPlaybackStatus(status);
    } catch (error) {
      // Тихо игнорируем ошибку
    }
  };

  const getAudioUri = (song: SongItem) => {
    if (!song) return null;

    // Проверяем наличие пути к аудиофайлу
    if (!song.audioFilePath) {
      return null;
    }

    // Если путь начинается с http, используем его напрямую
    if (song.audioFilePath.startsWith('http')) {
      return song.audioFilePath;
    }

    // Для всех остальных случаев формируем URL с API_URL
    const baseUrl = API_URL.replace(/\/$/, ''); // Удаляем слеш в конце, если есть

    // Используем только имя файла без пути
    const fileName = song.audioFilePath.split('/').pop();
    if (!fileName) {
      return null;
    }

    // Формируем итоговый URL
    const audioUrl = `${baseUrl}/assets/${fileName}`;
    return audioUrl;
  };

  // Максимально простой и надежный вариант воспроизведения песни
  const playSong = async (song: SongItem) => {
    try {
      // Проверяем URI аудио
      const audioUri = getAudioUri(song);
      if (!audioUri) {
        // Тихо игнорируем ошибку
        return;
      }

      // Останавливаем текущий трек, если он есть
      if (playbackInstance) {
        try {
          await playbackInstance.stopAsync();
          await playbackInstance.unloadAsync();
        } catch (stopError) {
          // Тихо игнорируем ошибку
        }
      }

      // Создаем новый экземпляр звука
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true, volume: 1.0 },
        updatePlaybackStatus
      );
      
      // Устанавливаем новый трек как текущий
      setPlaybackInstance(sound);
      setCurrentSong(song);
      setIsPlaying(true);
      
      // Добавляем обработчик окончания воспроизведения
      sound.setOnPlaybackStatusUpdate((status) => {
        updatePlaybackStatus(status);
        // Проверяем, что статус не ошибка и воспроизведение завершилось
        if (status && 'didJustFinish' in status && status.didJustFinish === true) {
          playNextSong();
        }
      });
    } catch (error) {
      // Тихо игнорируем ошибку
    }
  };

  const pauseSong = async () => {
    if (playbackInstance) {
      try {
        await playbackInstance.pauseAsync();
        setIsPlaying(false);
      } catch (error) {
        console.error('Ошибка при паузе:', error);
      }
    }
  };

  const resumeSong = async () => {
    if (playbackInstance) {
      try {
        await playbackInstance.playAsync();
        setIsPlaying(true);
      } catch (error) {
        console.error('Ошибка при возобновлении:', error);
      }
    }
  };

  const stopSong = async () => {
    if (playbackInstance) {
      try {
        await playbackInstance.stopAsync();
        setIsPlaying(false);
      } catch (error) {
        console.error('Ошибка при остановке:', error);
      }
    }
  };

  const seekTo = async (position: number) => {
    if (playbackInstance) {
      try {
        await playbackInstance.setPositionAsync(position * 1000);
      } catch (error) {
        console.error('Ошибка при перемотке:', error);
      }
    }
  };

  const setCurrentSongPlaylist = (songs: SongItem[]) => {
    setPlaylist(songs);
  };

  const playNextSong = () => {
    if (!currentSong || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(song => song._id === currentSong._id);
    if (currentIndex === -1 || currentIndex === playlist.length - 1) {
      // Если текущая песня последняя или не найдена, воспроизводим первую
      playSong(playlist[0]);
    } else {
      playSong(playlist[currentIndex + 1]);
    }
  };

  const playPreviousSong = () => {
    if (!currentSong || playlist.length === 0) return;
    
    const currentIndex = playlist.findIndex(song => song._id === currentSong._id);
    if (currentIndex === -1 || currentIndex === 0) {
      // Если текущая песня первая или не найдена, воспроизводим последнюю
      playSong(playlist[playlist.length - 1]);
    } else {
      playSong(playlist[currentIndex - 1]);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        currentSong,
        isPlaying,
        duration,
        position,
        playbackInstance,
        playbackStatus,
        playSong,
        pauseSong,
        resumeSong,
        stopSong,
        seekTo,
        playNextSong,
        playPreviousSong,
        setCurrentSongPlaylist,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
