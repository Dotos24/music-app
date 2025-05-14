import { FontFamily, Typography } from '@/constants/Typography';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';

type SongItem = {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  imageUrl: string;
};

export default function MusicScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState<SongItem[]>([
    {
      id: '1',
      title: 'Місто весни',
      artist: 'Океан Ельзи',
      album: 'Без меж',
      duration: '3:45',
      imageUrl: 'https://i.scdn.co/image/ab67616d0000b2732b4f6acf3a36bd7483eaa5df'
    },
    {
      id: '2',
      title: 'Обійми',
      artist: 'Океан Ельзи',
      album: 'Земля',
      duration: '4:12',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/uk/b/bc/%D0%97%D0%B5%D0%BC%D0%BB%D1%8F_%28%D0%9E._%D0%95.%29.jpg'
    },
    {
      id: '3',
      title: 'Квітка',
      artist: 'The Hardkiss',
      album: 'Залізна ластівка',
      duration: '3:58',
      imageUrl: 'https://cdn-images.dzcdn.net/images/cover/a97b21665fb9fe4ff5ebad8a18b9ac51/0x1900-000000-80-0-0.jpg'
    },
    {
      id: '4',
      title: 'Журавлі',
      artist: 'The Hardkiss',
      album: 'Залізна ластівка',
      duration: '4:05',
      imageUrl: 'https://cdn-images.dzcdn.net/images/cover/61d19098c0eb0654ff58de5be9c83707/0x1900-000000-80-0-0.jpg'
    },
    {
      id: '5',
      title: 'Мало мені',
      artist: 'KAZKA',
      album: 'NIRVANA',
      duration: '3:30',
      imageUrl: 'https://f4.bcbits.com/img/a1593755960_10.jpg'
    },
    {
      id: '6',
      title: 'Плакала',
      artist: 'KAZKA',
      album: 'KARMA',
      duration: '3:22',
      imageUrl: 'https://quals.ua/image/cache/catalog/Covers/kazka-karma-vinyl-2000x2000.jpg'
    },
    {
      id: '7',
      title: 'Не твоя війна',
      artist: 'Океан Ельзи',
      album: 'Без меж',
      duration: '4:35',
      imageUrl: 'https://i.scdn.co/image/ab67616d0000b273662efff81c9deae5d06f7184'
    },
    {
      id: '8',
      title: 'Без бою',
      artist: 'Океан Ельзи',
      album: 'Gloria',
      duration: '3:38',
      imageUrl: 'https://images.genius.com/a19afaf21a5c3a3eb52b6371cf8641ed.500x500x1.jpg'
    },
    {
      id: '9',
      title: 'Коханці',
      artist: 'Христина Соловій',
      album: 'Любий друг',
      duration: '3:15',
      imageUrl: 'https://rock.ua/rockdb/i/cd/full/1154-lyubiy_drug.jpg'
    },
    {
      id: '10',
      title: 'Тримай',
      artist: 'Христина Соловій',
      album: 'Любий друг',
      duration: '3:20',
      imageUrl: 'https://cdn-images.dzcdn.net/images/cover/d5898c4bb498bb94f542d4ce4b27ef50/1900x1900-000000-80-0-0.jpg'
    },
  ]);


  const filteredSongs = songs.filter(song => {
    const query = searchQuery.toLowerCase();
    return (
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query) ||
      song.album.toLowerCase().includes(query)
    );
  });

  const renderSongItem = ({ item }: { item: SongItem }) => (
    <TouchableOpacity style={styles.songItem} activeOpacity={0.7}>
      <Image source={{ uri: item.imageUrl }} style={styles.songImage} />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle}>{item.title}</Text>
        <Text style={styles.songArtist}>{item.artist}</Text>
      </View>
      <View style={styles.songDetails}>
        <Text style={styles.songDuration}>{item.duration}</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <Animated.View 
      style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}
      entering={FadeIn.duration(350).springify()}
    >
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>Музика</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888888" style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: isDark ? '#FFFFFF' : '#000000' }]}
          placeholder="Пошук музики..."
          placeholderTextColor="#888888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#888888" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity style={[styles.filterButton, styles.activeFilterButton]}>
          <Text style={styles.activeFilterText}>Всі</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={[styles.filterText, { color: isDark ? '#FFFFFF' : '#000000' }]}>Виконавці</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={[styles.filterText, { color: isDark ? '#FFFFFF' : '#000000' }]}>Альбоми</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={[styles.filterText, { color: isDark ? '#FFFFFF' : '#000000' }]}>Плейлисти</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredSongs}
        renderItem={renderSongItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Animated.View entering={SlideInRight.duration(300).springify()} style={styles.emptyContainer}>
            <Ionicons name="musical-notes" size={50} color="#888888" />
            <Text style={styles.emptyText}>Нічого не знайдено</Text>
          </Animated.View>
        }
      />
    </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    ...Typography.h2,
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingHorizontal: 15,
    height: 44,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    ...Typography.body2,
    color: '#FFFFFF',
  },
  clearButton: {
    padding: 5,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  filterButton: {
    marginRight: 15,
    paddingVertical: 5,
  },
  activeFilterButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#1DB954',
  },
  filterText: {
    ...Typography.body2,
    color: '#FFFFFF',
  },
  activeFilterText: {
    ...Typography.body2,
    color: '#1DB954',
    fontFamily: FontFamily.semiBold,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#2A2A2A',
  },
  songImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: '#2A2A2A',
  },
  songInfo: {
    flex: 1,
    marginLeft: 15,
  },
  songTitle: {
    ...Typography.body1,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  songArtist: {
    ...Typography.caption,
    color: '#888888',
  },
  songDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  songDuration: {
    ...Typography.caption,
    color: '#888888',
    marginRight: 15,
  },
  moreButton: {
    padding: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    ...Typography.body1,
    color: '#888888',
    marginTop: 10,
  },
});
