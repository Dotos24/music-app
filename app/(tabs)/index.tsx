import { FontFamily, Typography } from "@/constants/Typography";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ColorValue } from "react-native";

type GenreCardProps = {
  title: string;
  colors: readonly [ColorValue, ColorValue, ...ColorValue[]];
  image?: string;
};

const GenreCard = ({ title, colors, image }: GenreCardProps) => {
  return (
    <TouchableOpacity style={styles.cardContainer} activeOpacity={0.7}>
      <View style={{ borderRadius: 12, overflow: 'hidden', flex: 1 }}>
        <ImageBackground
          source={image}
          style={{ width: '100%', height: '100%' }}
          imageStyle={{ borderRadius: 12 }}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.85)']}
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              borderRadius: 12,
            }}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              paddingHorizontal: 15,
              paddingBottom: 15,
              paddingTop: 20,
            }}>
              <Text style={styles.cardTitle}>{title}</Text>
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#DEDEDF',
              }}>
                <Ionicons name="play" size={16} color="#FFFFFF" />
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const genres = [
    { title: "Хіп-хоп", image: require("../../assets/starboy.jpg") },
    { title: "Реп", image: require("../../assets/test.webp") },
  ];

  const recentlyPlayed = [
    { id: 1, title: "Плейлист 1", artist: "Різні виконавці", image: require("../../assets/photo_2025-05-14_21-33-39.jpg") },
    { id: 2, title: "Плейлист 2", artist: "Різні виконавці", image: require("../../assets/asap-rocky-long-live-asap-2013-billboard-1240.webp") },
    { id: 3, title: "Плейлист 3", artist: "Різні виконавці", image: require("../../assets/photo_2025-05-14_21-35-36.jpg") },
    { id: 4, title: "Плейлист 4", artist: "Різні виконавці", image: require("../../assets/photo_2025-05-14_21-35-54.jpg") },
    { id: 5, title: "Плейлист 5", artist: "Різні виконавці", image: require("../../assets/0x1900-000000-80-0-0.jpg") },
  ];

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#060606" : "#FFFFFF" },
      ]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={styles.header}>
        <View
          style={styles.headerRow}
          flexDirection="row"
          justifyContent="space-between"
        >
          <Text
            style={[
              styles.headerTitle,
              { color: isDark ? "#FFFFFF" : "#000000" },
            ]}
          >
            Доброго дня 👋{" "}
          </Text>
          <Image
            source={require("@/assets/kizaru_12.jpg")}
            style={{
              width: 40,
              height: 40,
              borderRadius: 50,
            }}
          />
        </View>
        <View></View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.categoryContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            <TouchableOpacity
              style={[styles.categoryButton, styles.categoryActive]}
            >
              <Text style={styles.categoryActiveText}>Жанри</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryText}>Артисти</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryText}>Подкасти</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryText}>Для вас</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryButton}>
              <Text style={styles.categoryText}>Нове</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.genreGrid}>
          {genres.map((genre, index) => (
            <GenreCard 
              key={index} 
              title={genre.title} 
              colors={['#000000', '#000000']} 
              image={genre.image}
            />
          ))}
        </View>

        <View style={[styles.sectionHeader, { paddingHorizontal: 20 }]}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? "#FFFFFF" : "#000000" },
            ]}
          >
            Нещодавно прослухане
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recentlyPlayedContent}
        >
          {recentlyPlayed.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.recentItem}
              activeOpacity={0.7}
            >
              <View style={styles.recentItemImageContainer}>
                <ImageBackground
                  source={item.image}
                  style={styles.recentItemImage}
                  imageStyle={{ borderRadius: 12 }}
                >
                  <View style={styles.playButtonContainer}>
                    <View style={styles.playButton}>
                      <Ionicons name="play" size={24} color="#FFFFFF" />
                    </View>
                  </View>
                </ImageBackground>
              </View>
              <Text
                style={[
                  styles.recentItemTitle,
                  { color: isDark ? "#FFFFFF" : "#000000" },
                ]}
              >
                {item.title}
              </Text>
              <Text style={styles.recentItemSubtitle}>{item.artist}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    ...Typography.h2,
    fontWeight: "bold",
  },
  iconGroup: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchText: {
    color: "#888888",
    ...Typography.body2,
  },

  sectionHeader: {
    marginBottom: 15,
    marginTop: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    ...Typography.h3,
  },
  categoryContainer: {
    marginVertical: 15,
  },
  categoryScroll: {
    paddingLeft: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  categoryActive: {
    backgroundColor: "#DEDEDF",
  },
  categoryText: {
    color: "#FFFFFF",
    ...Typography.caption,
    lineHeight: 18,
  },
  categoryActiveText: {
    color: "#000000",
    ...Typography.caption,
    lineHeight: 18,
    fontFamily: FontFamily.semiBold,
  },
  genreGrid: {
    flexDirection: "column",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  backgroundImage: {
    padding: 15,
    borderRadius: 12,
    height: 150,
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  imageStyle: {
    width: "125%",
    height: "125%",
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 15,
    width: "100%",
  },
  cardContainer: {
    width: "100%",
    height: 180,
    marginBottom: 15,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  gradientCard: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },
  cardTitle: {
    color: "#FFFFFF",
    ...Typography.subtitle1,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  cardImage: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 40,
    height: 40,
    opacity: 0.7,
  },
  recentlyPlayedContent: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingLeft: 20,
  },
  recentItem: {
    width: 160,
    marginRight: 15,
  },
  recentItemImageContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    borderRadius: 12,
    overflow: "hidden",
  },
  recentItemImage: {
    width: "100%",
    height: 160,
  },
  playButtonContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DEDEDF",
  },
  recentItemTitle: {
    marginTop: 12,
    ...Typography.body2,
    fontFamily: FontFamily.semiBold,
  },
  recentItemSubtitle: {
    ...Typography.caption,
    color: "#888888",
    marginTop: 4,
  },
});
