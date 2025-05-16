import React, { createContext, useState, useEffect, useContext } from 'react';
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
    setPlaybackStatus(status);
  };

  const getAudioUri = (song: SongItem) => {
    if (!song) return null;

    console.log('Получение URI для аудио:', song.title, song.audioFilePath);

    // Для веб-версии используем полный URL с API_URL
    if (song.audioFilePath) {
      // Если путь начинается с http, используем его напрямую
      if (song.audioFilePath.startsWith('http')) {
        return song.audioFilePath;
      }

      // Иначе формируем URL с API_URL
      const baseUrl = API_URL.replace(/\/$/, ''); // Удаляем слеш в конце, если есть
      
      // Если путь начинается с /assets/, удаляем этот префикс
      if (song.audioFilePath.startsWith('/assets/')) {
        const fileName = song.audioFilePath.substring(8); // Удаляем '/assets/'
        const audioUrl = `${baseUrl}/assets/${fileName}`;
        console.log('Сформирован URL для аудио:', audioUrl);
        return audioUrl;
      }
      
      // Если путь начинается с /storage/, это путь на устройстве
      if (song.audioFilePath.startsWith('/storage/')) {
        // Для мобильных устройств используем путь на сервере
        const fileName = song.audioFilePath.split('/').pop();
        const audioUrl = `${baseUrl}/assets/${fileName}`;
        console.log('Сформирован URL для аудио из локального пути:', audioUrl);
        return audioUrl;
      }
      
      // Если путь начинается с /, используем его как есть
      if (song.audioFilePath.startsWith('/')) {
        const audioUrl = `${baseUrl}${song.audioFilePath}`;
        console.log('Сформирован URL для аудио с абсолютным путем:', audioUrl);
        return audioUrl;
      }
      
      // Иначе добавляем слеш
      const audioUrl = `${baseUrl}/assets/${song.audioFilePath}`;
      console.log('Сформирован URL для аудио с относительным путем:', audioUrl);
      return audioUrl;
    }
    
    return null;
  };

  const playSong = async (song: SongItem) => {
    try {
      // Остановить текущее воспроизведение, если есть
      if (playbackInstance) {
        await playbackInstance.unloadAsync();
      }

      const audioUri = getAudioUri(song);
      if (!audioUri) {
        console.error('Не удалось получить URI аудио для песни:', song.title);
        Alert.alert('Ошибка', `Не удалось загрузить аудио для песни: ${song.title}`);
        return;
      }

      console.log(`Загрузка аудио: ${audioUri}`);
      
      // Создаем новый экземпляр звука
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true },
        updatePlaybackStatus
      );
      
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
      
      console.log(`Воспроизведение песни: ${song.title}`);
    } catch (error) {
      console.error('Ошибка при воспроизведении песни:', error);
      Alert.alert('Ошибка воспроизведения', `Не удалось воспроизвести песню: ${song.title}`);
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
