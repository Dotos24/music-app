import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image, Modal, TextInput, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { Typography, FontFamily } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import axios from 'axios';
import { API_URL } from '@/constants/Config';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useAudio } from '@/contexts/AudioContext';
import * as ImagePicker from 'expo-image-picker';

interface Playlist {
  _id: string;
  name: string;
  description?: string;
  coverImage?: string;
  userId: string;
  songs: Song[] | string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Song {
  _id: string;
  title: string;
  artist: string;
  duration: number;
  coverAsset?: string;
  coverFilePath?: string;
  audioAsset?: string;
  audioFilePath?: string;
  album?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function LibraryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, token } = useAuth();
  const router = useRouter();
  const { playSong: playAudioSong, setCurrentSongPlaylist } = useAudio();
  
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [availableSongs, setAvailableSongs] = useState<Song[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [songModalVisible, setShowSongModal] = useState(false);
  
  const fetchPlaylists = async () => {
    if (!user || !token) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/playlists`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data && response.data.playlists) {
        const fetchedPlaylists = response.data.playlists;
        
        // Check for playlists with default covers that have songs
        for (const playlist of fetchedPlaylists) {
          if (
            (!playlist.coverImage || playlist.coverImage === 'default-playlist-cover.jpg') && 
            playlist.songs && 
            playlist.songs.length > 0
          ) {
            // Try to find a song with a cover
            const firstSongWithCover = playlist.songs.find((song: any) => 
              song.coverAsset || song.coverFilePath
            );
            
            if (firstSongWithCover) {
              // Extract cover path
              const coverImage = firstSongWithCover.coverAsset || firstSongWithCover.coverFilePath;
              
              if (coverImage) {
                // Format the cover path
                let formattedCover = coverImage;
                if (formattedCover.includes('/')) {
                  formattedCover = formattedCover.split('/').pop() || formattedCover;
                }
                
                console.log(`Setting cover for playlist ${playlist.name} from song:`, formattedCover);
                
                // Update in background
                updatePlaylistCover(playlist._id, formattedCover)
                  .then(() => {
                    playlist.coverImage = formattedCover;
                  })
                  .catch(console.error);
              }
            }
          }
        }
        
        setPlaylists(fetchedPlaylists);
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити плейлисти');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPlaylists();
  }, [user, token]);
  
  const createPlaylist = async () => {
    if (!playlistName.trim()) {
      Alert.alert('Помилка', 'Вкажіть назву плейлиста');
      return;
    }
    
    if (!user || !token) {
      Alert.alert('Помилка', 'Ви повинні увійти в систему');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Sending playlist creation request with token:', token);
      const response = await axios.post(
        `${API_URL}/api/playlists`,
        {
          name: playlistName,
          description: playlistDescription,
          isPublic: isPublic
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.data && response.data.playlist) {
        setPlaylists([...playlists, response.data.playlist]);
        setModalVisible(false);
        setPlaylistName('');
        setPlaylistDescription('');
        setIsPublic(false);
        Alert.alert('Успіх', 'Плейлист створено успішно');
      }
    } catch (error: any) {
      console.error('Error creating playlist:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Не вдалося створити плейлист';
      Alert.alert('Помилка', `${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPlaylistDetails = async (playlistId: string) => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/playlists/${playlistId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data && response.data.playlist) {
        const playlist = response.data.playlist;
        
        // Check if this playlist needs a cover update
        if (
          (!playlist.coverImage || playlist.coverImage === 'default-playlist-cover.jpg') && 
          playlist.songs && 
          playlist.songs.length > 0
        ) {
          // Filter for song objects (not string IDs) with explicit parameter typing
          const songObjects = playlist.songs.filter((item: Song | string): item is Song => 
            typeof item !== 'string'
          );
          
          // Use the first song if available
          if (songObjects.length > 0) {
            const firstSong = songObjects[0];
            // If we have a song object with cover, use it for the playlist
            const coverImage = firstSong.coverFilePath || firstSong.coverAsset;
            if (coverImage) {
              console.log('Setting playlist cover from existing first song:', coverImage);
              
              // Format the cover path correctly
              let formattedCover = coverImage;
              if (formattedCover.includes('/')) {
                formattedCover = formattedCover.split('/').pop() || formattedCover;
              }
              
              // Update in background, don't await
              updatePlaylistCover(playlistId, formattedCover)
                .then(() => {
                  // Update the local playlist object to show changes immediately
                  playlist.coverImage = formattedCover;
                })
                .catch(console.error);
            }
          }
        }
        
        setSelectedPlaylist(playlist);
      }
    } catch (error) {
      console.error('Error fetching playlist details:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити деталі плейлиста');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAvailableSongs = async () => {
    if (!token) return;
    
    setLoadingSongs(true);
    try {
      const response = await axios.get(`${API_URL}/api/songs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (Array.isArray(response.data)) {
        setAvailableSongs(response.data);
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити пісні');
    } finally {
      setLoadingSongs(false);
    }
  };
  
  const openAddSongsModal = () => {
    fetchAvailableSongs();
    setShowSongModal(true);
  };
  
  const addSongToPlaylist = async (songId: string) => {
    if (!selectedPlaylist || !token) return;
    
    try {
      // First get the song details to access its cover
      const songResponse = await axios.get(`${API_URL}/api/songs/${songId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const song = songResponse.data;
      console.log('Got song details for cover:', song);
      
      // Add the song to the playlist
      await axios.post(
        `${API_URL}/api/playlists/${selectedPlaylist._id}/songs`,
        { songId },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // If this is the first song and the playlist has the default cover,
      // update the playlist cover with the song's cover
      if (
        selectedPlaylist.songs.length === 0 &&
        (!selectedPlaylist.coverImage || selectedPlaylist.coverImage === 'default-playlist-cover.jpg')
      ) {
        // Get the appropriate cover path - prefer coverFilePath if available
        let coverImage = song.coverFilePath || song.coverAsset;
        
        if (coverImage) {
          console.log('Updating playlist cover with first song cover:', coverImage);
          
          // Format the cover path correctly for the server
          // If it's a full path, extract just the filename
          if (coverImage.includes('/')) {
            coverImage = coverImage.split('/').pop() || coverImage;
          }
          
          await updatePlaylistCover(selectedPlaylist._id, coverImage);
        }
      }
      
      // Refresh playlist details to show the added song
      await fetchPlaylistDetails(selectedPlaylist._id);
      Alert.alert('Успіх', 'Пісню додано до плейлиста');
    } catch (error: any) {
      console.error('Error adding song to playlist:', error);
      let errorMessage = 'Не вдалося додати пісню до плейлиста';
      
      if (error.response?.status === 400 && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Помилка', errorMessage);
    }
  };
  
  // New function to update a playlist's cover
  const updatePlaylistCover = async (playlistId: string, coverImage: string) => {
    if (!token) return;
    
    try {
      await axios.put(
        `${API_URL}/api/playlists/${playlistId}`,
        { coverImage },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      console.log('Successfully updated playlist cover to', coverImage);
    } catch (error) {
      console.error('Error updating playlist cover:', error);
    }
  };
  
  const removeSongFromPlaylist = async (songId: string) => {
    if (!selectedPlaylist || !token) return;
    
    try {
      await axios.delete(
        `${API_URL}/api/playlists/${selectedPlaylist._id}/songs/${songId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Refresh playlist details to update the songs list
      await fetchPlaylistDetails(selectedPlaylist._id);
      Alert.alert('Успіх', 'Пісню видалено з плейлиста');
    } catch (error) {
      console.error('Error removing song from playlist:', error);
      Alert.alert('Помилка', 'Не вдалося видалити пісню з плейлиста');
    }
  };
  
  const deletePlaylist = async (playlistId: string) => {
    if (!token) return;
    
    Alert.alert(
      'Видалити плейлист',
      'Ви впевнені, що хочете видалити цей плейлист? Ця дія не може бути скасована.',
      [
        {
          text: 'Скасувати',
          style: 'cancel',
        },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await axios.delete(`${API_URL}/api/playlists/${playlistId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              
              // Remove playlist from state
              setPlaylists(playlists.filter(playlist => playlist._id !== playlistId));
              setSelectedPlaylist(null);
              
              Alert.alert('Успіх', 'Плейлист видалено успішно');
            } catch (error) {
              console.error('Error deleting playlist:', error);
              Alert.alert('Помилка', 'Не вдалося видалити плейлист');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  
  const getImageSource = (coverImage?: string) => {
    console.log('getImageSource called with:', coverImage);
    
    if (!coverImage || coverImage === 'default-playlist-cover.jpg') {
      console.log('Using default cover image');
      return require('@/assets/photo_2025-05-14_21-33-39.jpg'); // Default cover
    }
    
    // Handle different URL formats
    if (coverImage.startsWith('http')) {
      console.log('Using direct http URL:', coverImage);
      return { uri: coverImage };
    }
    
    // Handle asset files directly - check if it STARTS WITH the pattern, not exact match
    if (coverImage === 'photo_2025-05-14_21-35-54.jpg' || 
        coverImage.startsWith('photo_2025-05-14')) {
      console.log('Using builtin asset');
      return require('@/assets/photo_2025-05-14_21-35-54.jpg');
    }
    
    // Clean up path for server assets
    if (coverImage.startsWith('/assets/')) {
      const uri = `${API_URL}${coverImage}`;
      console.log('Using server asset with /assets/ prefix:', uri);
      return { uri };
    }
    
    if (coverImage.startsWith('assets/')) {
      const uri = `${API_URL}/${coverImage}`;
      console.log('Using server asset with assets/ prefix:', uri);
      return { uri };
    }
    
    // Extract filename if it's a full path
    const fileName = coverImage.split('/').pop();
    if (fileName) {
      const uri = `${API_URL}/assets/${fileName}`;
      console.log('Using extracted filename:', uri);
      return { uri };
    }
    
    // Default fallback
    const uri = `${API_URL}/assets/${coverImage}`;
    console.log('Using fallback path:', uri);
    return { uri };
  };
  
  const renderPlaylistItem = ({ item }: { item: Playlist }) => (
    <TouchableOpacity 
      style={[styles.playlistItem, { backgroundColor: isDark ? '#1E1E1E' : '#F5F5F5' }]}
      activeOpacity={0.7}
      onPress={() => fetchPlaylistDetails(item._id)}
    >
      <View style={styles.playlistCoverContainer}>
        <Image 
          source={getImageSource(item.coverImage)}
          style={styles.playlistCover}
        />
        <TouchableOpacity
          style={styles.editCoverButton}
          onPress={(e) => {
            e.stopPropagation();
            pickPlaylistCover(item._id);
          }}
        >
          <Ionicons name="camera" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.playlistInfo}>
        <Text style={[styles.playlistName, { color: isDark ? '#FFFFFF' : '#000000' }]}>{item.name}</Text>
        {item.description ? (
          <Text style={styles.playlistDescription} numberOfLines={1}>{item.description}</Text>
        ) : (
          <Text style={styles.playlistDescription}>Треків: {item.songs.length}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
  
  const renderSongItem = ({ item }: { item: Song }) => (
    <View style={[styles.songItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
      <Image 
        source={getImageSource(item.coverAsset || item.coverFilePath)}
        style={styles.songCover}
      />
      <View style={styles.songInfo}>
        <Text style={[styles.songTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>{item.title}</Text>
        <Text style={styles.songArtist}>{item.artist}</Text>
      </View>
      <TouchableOpacity
        style={styles.songAction}
        onPress={() => addSongToPlaylist(item._id)}
      >
        <Ionicons name="add-circle" size={24} color="#1DB954" />
      </TouchableOpacity>
    </View>
  );
  
  const playSong = (song: Song) => {
    console.log('playSong called with song:', JSON.stringify(song));
    
    // First, set the playlist
    if (selectedPlaylist && selectedPlaylist.songs) {
      const actualSongs = selectedPlaylist.songs.filter(item => typeof item !== 'string');
      console.log('Setting current song playlist with', actualSongs.length, 'songs');
      setCurrentSongPlaylist(actualSongs as any[]);
    }
    
    // Now play the song directly through the AudioContext
    if (song) {
      console.log('Playing song through AudioContext:', song.title, 'by', song.artist);
      playAudioSong(song as any);
    }
  };
  
  const renderPlaylistSongItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.songItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
      onPress={() => playSong(item)}
    >
      <Image 
        source={getImageSource(item.coverAsset || item.coverFilePath)}
        style={styles.songCover}
      />
      <View style={styles.songInfo}>
        <Text style={[styles.songTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>{item.title}</Text>
        <Text style={styles.songArtist}>{item.artist}</Text>
      </View>
      <TouchableOpacity
        style={styles.songAction}
        onPress={() => removeSongFromPlaylist(item._id)}
      >
        <Ionicons name="trash-outline" size={22} color="#FF3B30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Main render function for the screen content
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
          <Text style={{ color: isDark ? '#FFFFFF' : '#000000', marginTop: 10 }}>Завантаження...</Text>
        </View>
      );
    }
    
    if (selectedPlaylist) {
      return (
        <View style={styles.playlistDetailContainer}>
          <View style={styles.playlistDetailHeader}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setSelectedPlaylist(null)}
            >
              <Ionicons name="arrow-back" size={24} color={isDark ? "#FFFFFF" : "#000000"} />
            </TouchableOpacity>
            
            <View style={styles.playlistDetailCoverContainer}>
              <Image 
                source={getImageSource(selectedPlaylist.coverImage)}
                style={styles.playlistDetailCover}
              />
              <TouchableOpacity
                style={styles.editPlaylistCoverButton}
                onPress={() => pickPlaylistCover(selectedPlaylist._id)}
              >
                <Ionicons name="camera" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.playlistDetailInfo}>
              <Text style={[styles.playlistDetailName, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {selectedPlaylist.name}
              </Text>
              {selectedPlaylist.description && (
                <Text style={styles.playlistDetailDescription}>
                  {selectedPlaylist.description}
                </Text>
              )}
              <Text style={styles.playlistDetailSongs}>
                {selectedPlaylist.songs.length} треків
              </Text>
            </View>
            
            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: isDark ? 'rgba(255, 59, 48, 0.2)' : 'rgba(255, 59, 48, 0.1)' }]}
              onPress={() => deletePlaylist(selectedPlaylist._id)}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.addSongsButton}
            onPress={openAddSongsModal}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addSongsButtonText}>Додати пісні</Text>
          </TouchableOpacity>
          
          {selectedPlaylist.songs.length > 0 ? (
            <FlatList
              data={selectedPlaylist.songs}
              renderItem={({ item }) => {
                // Handle both song object and string ID cases
                if (typeof item === 'string') {
                  // For string IDs, we need to fetch the song details
                  // Show loading state or placeholder
                  return (
                    <View style={[styles.songItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                      <View style={[styles.songCover, {backgroundColor: '#333', justifyContent: 'center', alignItems: 'center'}]}>
                        <Ionicons name="musical-note" size={24} color="#888888" />
                      </View>
                      <View style={styles.songInfo}>
                        <Text style={[styles.songTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>Завантаження...</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.songAction}
                        onPress={() => removeSongFromPlaylist(item)}
                      >
                        <Ionicons name="trash-outline" size={22} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  );
                }
                
                // If it's a Song object, render the full song item
                return renderPlaylistSongItem({ item });
              }}
              keyExtractor={(item: Song | string) => typeof item === 'string' ? item : item._id}
              contentContainerStyle={styles.songsList}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="musical-note" size={64} color="#888888" />
              <Text style={[styles.emptyText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                У цьому плейлисті ще немає пісень
              </Text>
            </View>
          )}
        </View>
      );
    }
    
    if (playlists.length > 0) {
      return (
        <FlatList
          data={playlists}
          renderItem={renderPlaylistItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.playlistsList}
        />
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="musical-notes" size={64} color="#888888" />
        <Text style={[styles.emptyText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          Ви ще не створили жодного плейлиста
        </Text>
        <TouchableOpacity
          style={styles.createFirstButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.createFirstButtonText}>Створити перший плейлист</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Add function to open image picker and update playlist cover
  const pickPlaylistCover = async (playlistId: string) => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Помилка', 'Потрібен доступ до галереї для вибору обкладинки');
      return;
    }
    
    try {
      // Open image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        console.log('Selected image:', selectedImage.uri);
        
        // Create form data for image upload
        const formData = new FormData();
        const filename = selectedImage.uri.split('/').pop() || 'cover.jpg';
        
        // Append image to form data
        formData.append('coverImage', {
          uri: selectedImage.uri,
          name: filename,
          type: 'image/jpeg',
        } as any);
        
        // Show loading indicator
        setLoading(true);
        
        // Upload image to server
        try {
          // First upload the image
          const uploadResponse = await axios.post(
            `${API_URL}/api/playlists/upload-cover`,
            formData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          
          if (uploadResponse.data && uploadResponse.data.coverImage) {
            const coverPath = uploadResponse.data.coverImage;
            
            // Then update the playlist with the new cover
            await updatePlaylistCover(playlistId, coverPath);
            
            // Refresh playlists or selected playlist
            if (selectedPlaylist && selectedPlaylist._id === playlistId) {
              await fetchPlaylistDetails(playlistId);
            } else {
              await fetchPlaylists();
            }
            
            Alert.alert('Успіх', 'Обкладинку плейлиста оновлено');
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          Alert.alert('Помилка', 'Не вдалося завантажити зображення');
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Помилка', 'Не вдалося відкрити галерею');
    }
  };

  return (
    <Animated.View 
      style={[styles.container, { backgroundColor: isDark ? '#121212' : '#FFFFFF' }]}
      entering={FadeIn.duration(350).springify()}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Animated.Text 
            style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}
            entering={SlideInRight.duration(400).delay(100)}
          >
            Бібліотека
          </Animated.Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
        </View>
        
        {renderContent()}
      </SafeAreaView>
      
      {/* Create Playlist Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>Створити плейлист</Text>
            
            <TextInput
              style={[styles.input, { color: isDark ? '#FFFFFF' : '#000000', borderColor: isDark ? '#333333' : '#E5E5E5' }]}
              placeholder="Назва плейлиста"
              placeholderTextColor="#888888"
              value={playlistName}
              onChangeText={setPlaylistName}
            />
            
            <TextInput
              style={[styles.input, { color: isDark ? '#FFFFFF' : '#000000', borderColor: isDark ? '#333333' : '#E5E5E5' }]}
              placeholder="Опис (необов'язково)"
              placeholderTextColor="#888888"
              value={playlistDescription}
              onChangeText={setPlaylistDescription}
              multiline
            />
            
            <TouchableOpacity 
              style={styles.publicToggle}
              onPress={() => setIsPublic(!isPublic)}
            >
              <Ionicons 
                name={isPublic ? "checkbox" : "square-outline"} 
                size={24} 
                color={isPublic ? "#1DB954" : (isDark ? '#FFFFFF' : '#000000')} 
              />
              <Text style={[styles.publicText, { color: isDark ? '#FFFFFF' : '#000000' }]}>Зробити публічним</Text>
            </TouchableOpacity>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Скасувати</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.createPlaylistButton]}
                onPress={createPlaylist}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.createPlaylistButtonText}>Створити</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Add Songs Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={songModalVisible}
        onRequestClose={() => setShowSongModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF', height: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Додати пісні
              </Text>
              <TouchableOpacity onPress={() => setShowSongModal(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
              </TouchableOpacity>
            </View>
            
            {loadingSongs ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1DB954" />
                <Text style={{ color: isDark ? '#FFFFFF' : '#000000', marginTop: 10 }}>
                  Завантаження пісень...
                </Text>
              </View>
            ) : availableSongs.length > 0 ? (
              <FlatList
                data={availableSongs}
                renderItem={renderSongItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.songsList}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  Немає доступних пісень
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
    marginBottom: 10,
  },
  title: {
    ...Typography.h2,
    fontFamily: FontFamily.bold,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    ...Typography.body1,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  createFirstButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#1DB954',
    borderRadius: 25,
  },
  createFirstButtonText: {
    ...Typography.button,
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistsList: {
    padding: 20,
  },
  playlistItem: {
    flexDirection: 'row',
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
  },
  playlistCoverContainer: {
    position: 'relative',
    width: 60,
    height: 60,
  },
  playlistCover: {
    width: 60,
    height: 60,
    borderRadius: 4,
  },
  editCoverButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistInfo: {
    marginLeft: 12,
    justifyContent: 'center',
    flex: 1,
  },
  playlistName: {
    ...Typography.subtitle1,
    marginBottom: 4,
  },
  playlistDescription: {
    ...Typography.caption,
    color: '#888888',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    ...Typography.h3,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    ...Typography.body2,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  publicToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  publicText: {
    ...Typography.body2,
    marginLeft: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#888888',
  },
  cancelButtonText: {
    ...Typography.button,
    color: '#888888',
  },
  createPlaylistButton: {
    marginLeft: 8,
    backgroundColor: '#1DB954',
  },
  createPlaylistButtonText: {
    ...Typography.button,
    color: '#FFFFFF',
  },
  playlistDetailContainer: {
    flex: 1,
  },
  playlistDetailHeader: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistDetailCoverContainer: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  playlistDetailCover: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  editPlaylistCoverButton: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistDetailInfo: {
    flex: 1,
    marginLeft: 16,
  },
  playlistDetailName: {
    ...Typography.h3,
    marginBottom: 4,
  },
  playlistDetailDescription: {
    ...Typography.body2,
    color: '#888888',
    marginBottom: 4,
  },
  playlistDetailSongs: {
    ...Typography.caption,
    color: '#888888',
  },
  songsList: {
    padding: 16,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  songCover: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  songInfo: {
    flex: 1,
    marginLeft: 10,
  },
  songTitle: {
    ...Typography.body2,
    fontFamily: FontFamily.semiBold,
  },
  songArtist: {
    ...Typography.caption,
    color: '#888888',
  },
  songAction: {
    padding: 8,
  },
  addSongsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1DB954',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 12,
    borderRadius: 25,
  },
  addSongsButtonText: {
    ...Typography.button,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 20,
    right: 20,
  },
});
