import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Typography } from '@/constants/Typography';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';

export default function LibraryScreen() {
  return (
    <Animated.View 
      style={styles.container}
      entering={FadeIn.duration(350).springify()}
    >
      <Animated.Text 
        style={styles.title}
        entering={SlideInRight.duration(400).delay(100)}
      >
        Бібліотека
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
  },
  title: {
    ...Typography.h3,
    color: '#FFFFFF',
  },
});
