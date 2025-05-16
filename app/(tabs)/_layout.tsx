import * as Haptics from 'expo-haptics';
import { Tabs, Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Platform, StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';

// Custom tab button component with haptic feedback
type IconName = 'house.fill' | 'heart.fill' | 'music.note' | 'music.note.list';

const CustomTab = ({ 
  isFocused, 
  onPress, 
  iconName, 
  color 
}: { 
  isFocused: boolean; 
  onPress: () => void; 
  iconName: IconName; 
  color: string;
}) => {
  return (
    <TouchableOpacity
      onPress={() => {
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
      }}
      style={styles.tabButton}
      activeOpacity={0.7}
    >
      {isFocused && (
        <Animated.View 
          style={styles.activeBackground}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
        />
      )}
      <IconSymbol 
        size={22} 
        name={iconName} 
        color={color} 
        style={isFocused ? styles.activeIcon : undefined}
      />
    </TouchableOpacity>
  );
};

// Custom TabBar component
interface TabBarProps {
  state: {
    routes: Array<{
      key: string;
      name: string;
    }>;
    index: number;
  };
  descriptors: Record<string, any>;
  navigation: {
    emit: (event: { type: string; target: string; canPreventDefault: boolean }) => any;
    navigate: (name: string) => void;
  };
}

const CustomTabBar = ({ state, descriptors, navigation }: TabBarProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const windowWidth = Dimensions.get('window').width;
  
  return (
    <View style={[
      styles.tabBarContainer,
      {
        backdropFilter: 'blur(50px)',
        backgroundColor: isDark ? 'rgba(255, 255, 255, 1)' : 'rgba(0, 0, 0, 1)',
      }
    ]}>
      {state.routes.map((route: { key: string; name: string }, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        
        let iconName: IconName = 'house.fill';
        if (route.name === 'favorites') iconName = 'heart.fill';
        else if (route.name === 'music') iconName = 'music.note';
        else if (route.name === 'library') iconName = 'music.note.list';
        
        return (
          <CustomTab
            key={route.key}
            isFocused={isFocused}
            onPress={onPress}
            iconName={iconName}
            color={isFocused ? '#fff' : isDark ? '#676767' : '#999999'}
          />
        );
      })}
    </View>
  );
};

// Компонент для проверки авторизации
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [isCheckingStorage, setIsCheckingStorage] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    // Проверяем, есть ли токен в AsyncStorage
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        setHasToken(!!token);
      } catch (error) {
        console.error('Ошибка при проверке токена:', error);
      } finally {
        setIsCheckingStorage(false);
      }
    };

    checkToken();
  }, []);

  // Показываем индикатор загрузки, пока проверяем авторизацию
  if (isLoading || isCheckingStorage) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!user && !hasToken) {
    return <Redirect href="/auth/login" />;
  }

  // Если пользователь авторизован, показываем основной контент
  return <>{children}</>;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <AuthGuard>
      <View style={styles.container}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: false,
          }}
          tabBar={props => <CustomTabBar {...props} />}
        >
          <Tabs.Screen name="index" options={{ title: 'Home' }} />
          <Tabs.Screen name="favorites" options={{ title: 'Favorites' }} />
          <Tabs.Screen name="music" options={{ title: 'Music' }} />
          <Tabs.Screen name="library" options={{ title: 'Library' }} />
        </Tabs>
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  tabBarContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    alignSelf: 'center',
    width: 280,
    height: 70,
    borderRadius: 100,
    backgroundColor: 'rgba(18, 18, 18, 0.92)',
    elevation: 8,
    paddingVertical: Platform.OS === 'ios' ? 5 : 0,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  tabButton: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBackground: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgb(0, 0, 0)',
  },
  activeIcon: {
    transform: [{ scale: 1.0 }],
  },
});
