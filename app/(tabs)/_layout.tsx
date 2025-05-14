import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import React from 'react';
import { Dimensions, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';

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

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  tabBarContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 20,
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
