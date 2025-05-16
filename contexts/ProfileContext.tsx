import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

type ProfileContextType = {
  avatar: string | null;
  setAvatar: (uri: string | null) => Promise<void>;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [avatar, setAvatarState] = useState<string | null>(null);

  // Загружаем аватарку при монтировании компонента или изменении пользователя
  useEffect(() => {
    const loadAvatar = async () => {
      try {
        if (user) {
          const savedAvatar = await AsyncStorage.getItem(`avatar_${user.id}`);
          if (savedAvatar) {
            setAvatarState(savedAvatar);
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке аватарки:', error);
      }
    };

    loadAvatar();
  }, [user]);

  // Функция для установки и сохранения аватарки
  const setAvatar = async (uri: string | null) => {
    try {
      setAvatarState(uri);
      
      if (user && uri) {
        await AsyncStorage.setItem(`avatar_${user.id}`, uri);
      } else if (user) {
        await AsyncStorage.removeItem(`avatar_${user.id}`);
      }
    } catch (error) {
      console.error('Ошибка при сохранении аватарки:', error);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        avatar,
        setAvatar
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

// Хук для использования контекста профиля
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
