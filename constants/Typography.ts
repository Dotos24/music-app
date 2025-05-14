import { StyleSheet, TextStyle } from 'react-native';

export const FontFamily = {
  regular: 'Montserrat-Regular',
  medium: 'Montserrat-Medium',
  semiBold: 'Montserrat-SemiBold',
  bold: 'Montserrat-Bold',
};

export const Typography = StyleSheet.create({

  h1: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 28,
    lineHeight: 34,
  },
  h2: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 24,
    lineHeight: 30,
  },
  h3: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 20,
    lineHeight: 26,
  },
  subtitle1: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    lineHeight: 24,
  },
  subtitle2: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 16,
    lineHeight: 22,
  },
  body1: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 16,
    lineHeight: 22,
  },
  body2: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    lineHeight: 20,
  },
});
