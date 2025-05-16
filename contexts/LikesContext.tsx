import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Интерфейс для лайкнутого трека
export interface LikedSong {
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

interface LikesContextType {
  likedSongs: LikedSong[];
  isLiked: (songId: string) => boolean;
  toggleLike: (song: LikedSong) => void;
  removeLike: (songId: string) => void;
}

const LikesContext = createContext<LikesContextType | undefined>(undefined);

const STORAGE_KEY = 'liked_songs';

export const LikesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [likedSongs, setLikedSongs] = useState<LikedSong[]>([]);

  // Загрузка лайкнутых треков при запуске
  useEffect(() => {
    const loadLikedSongs = async () => {
      try {
        const storedSongs = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedSongs) {
          setLikedSongs(JSON.parse(storedSongs));
        }
      } catch (error) {
        // Игнорируем ошибку
      }
    };

    loadLikedSongs();
  }, []);

  // Сохранение лайкнутых треков при изменении
  useEffect(() => {
    const saveLikedSongs = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(likedSongs));
      } catch (error) {
        // Игнорируем ошибку
      }
    };

    saveLikedSongs();
  }, [likedSongs]);

  // Проверка, лайкнут ли трек
  const isLiked = (songId: string): boolean => {
    return likedSongs.some(song => song._id === songId);
  };

  // Добавление/удаление лайка
  const toggleLike = (song: LikedSong) => {
    if (isLiked(song._id)) {
      setLikedSongs(prevSongs => prevSongs.filter(s => s._id !== song._id));
    } else {
      setLikedSongs(prevSongs => [...prevSongs, song]);
    }
  };

  // Удаление лайка
  const removeLike = (songId: string) => {
    setLikedSongs(prevSongs => prevSongs.filter(song => song._id !== songId));
  };

  return (
    <LikesContext.Provider
      value={{
        likedSongs,
        isLiked,
        toggleLike,
        removeLike,
      }}
    >
      {children}
    </LikesContext.Provider>
  );
};

export const useLikes = () => {
  const context = useContext(LikesContext);
  if (context === undefined) {
    throw new Error('useLikes must be used within a LikesProvider');
  }
  return context;
};
