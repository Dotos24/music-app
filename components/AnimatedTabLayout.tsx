import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInRight, 
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

interface AnimatedTabLayoutProps {
  children: ReactNode;
  active: boolean;
}

export function AnimatedTabLayout({ children, active }: AnimatedTabLayoutProps) {
  // Use shared values for animation
  const opacity = useSharedValue(active ? 1 : 0);
  
  // Update opacity when active state changes
  React.useEffect(() => {
    opacity.value = withTiming(active ? 1 : 0, { duration: 300 });
  }, [active, opacity]);
  
  // Create animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View 
      style={[styles.container, animatedStyle]}
      entering={FadeIn.duration(300).springify()}
      exiting={FadeOut.duration(250)}
    >
      {children}
    </Animated.View>
  );
}

// For screens that should slide horizontally
export function AnimatedTabLayoutHorizontal({ children, active }: AnimatedTabLayoutProps) {
  return (
    <Animated.View 
      style={styles.container}
      entering={SlideInRight.duration(350).springify()}
      exiting={SlideOutLeft.duration(300)}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
