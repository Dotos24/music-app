import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import { API_URL } from '@/constants/Config';

// Типы для контекста
type User = {
  id: string;
  email: string;
  name?: string;
} | null;

type AuthContextType = {
  user: User;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

// Создаем контекст
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Провайдер контекста
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Проверяем авторизацию при загрузке приложения
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Устанавливаем токен для всех запросов axios
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Функция входа
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });

      const { token: newToken, user: userData } = response.data;

      // Сохраняем данные в AsyncStorage
      await AsyncStorage.setItem('token', newToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      // Обновляем состояние
      setToken(newToken);
      setUser(userData);

      // Устанавливаем токен для всех запросов axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } catch (error) {
      console.error('Ошибка входа:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Функция регистрации
  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        name,
        email,
        password
      });

      const { token: newToken, user: userData } = response.data;

      // Сохраняем данные в AsyncStorage
      await AsyncStorage.setItem('token', newToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      // Обновляем состояние
      setToken(newToken);
      setUser(userData);

      // Устанавливаем токен для всех запросов axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Функция выхода
  const logout = async () => {
    try {
      // Удаляем данные из AsyncStorage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');

      // Сбрасываем состояние
      setToken(null);
      setUser(null);

      // Удаляем заголовок Authorization
      delete axios.defaults.headers.common['Authorization'];

      // Перенаправляем на экран входа
      router.replace('/auth/login');
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Хук для использования контекста
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
