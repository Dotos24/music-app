import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { avatar, setAvatar } = useProfile();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setUserData({
        name: user.name || 'Користувач',
        email: user.email
      });
    }
  }, [user]);
  
  const pickImage = async () => {
    // Запрашиваем разрешение на доступ к галерее
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Помилка', 'Нам потрібно дозвіл на доступ до вашої галереї для зміни аватарки');
      return;
    }
    
    // Открываем галерею для выбора изображения
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];
      uploadImage(selectedImage.uri);
    }
  };
  
  const takePhoto = async () => {
    // Запрашиваем разрешение на доступ к камере
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Помилка', 'Нам потрібно дозвіл на доступ до вашої камери для створення фото');
      return;
    }
    
    // Открываем камеру для создания фото
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];
      uploadImage(selectedImage.uri);
    }
  };
  
  const uploadImage = async (uri: string) => {
    // Здесь должен быть код для загрузки изображения на сервер
    // Пока что просто имитируем загрузку
    setUploading(true);
    
    try {
      // Имитация задержки загрузки
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // В реальном приложении здесь был бы код для отправки изображения на сервер
      // const formData = new FormData();
      // formData.append('avatar', { uri, name: 'avatar.jpg', type: 'image/jpeg' });
      // const response = await axios.post(`${API_URL}/api/users/avatar`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      
      // Сохраняем аватарку в контексте профиля
      await setAvatar(uri);
      
      Alert.alert('Успіх', 'Аватарка успішно оновлена');
    } catch (error) {
      console.error('Помилка при завантаженні аватарки:', error);
      Alert.alert('Помилка', 'Не вдалося завантажити аватарку. Будь ласка, спробуйте ще раз.');
    } finally {
      setUploading(false);
    }
  };
  
  const showImageOptions = () => {
    Alert.alert(
      'Змінити аватарку',
      'Виберіть джерело зображення',
      [
        { text: 'Відміна', style: 'cancel' },
        { text: 'Зробити фото', onPress: takePhoto },
        { text: 'Вибрати з галереї', onPress: pickImage }
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Вихід з аккаунта',
      'Ви впевнені, що хочете вийти?',
      [
        {
          text: 'Відміна',
          style: 'cancel'
        },
        {
          text: 'Вийти',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          },
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#060606' : '#FFFFFF' }]}>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={showImageOptions} style={styles.avatarContainer}>
            <Image
              source={avatar ? { uri: avatar } : require('@/assets/kizaru_12.jpg')}
              style={styles.profileImage}
            />
            {uploading ? (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            ) : (
              <View style={styles.editIconContainer}>
                <Ionicons name="camera" size={18} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={[styles.profileName, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            {userData?.name}
          </Text>
          <Text style={styles.profileEmail}>
            {userData?.email}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Налаштування аккаунта
          </Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="person-outline" size={22} color={isDark ? '#FFFFFF' : '#000000'} />
            <Text style={[styles.menuItemText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Редагувати профіль
            </Text>
            <Ionicons name="chevron-forward" size={22} color="#999999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="lock-closed-outline" size={22} color={isDark ? '#FFFFFF' : '#000000'} />
            <Text style={[styles.menuItemText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Змінити пароль
            </Text>
            <Ionicons name="chevron-forward" size={22} color="#999999" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="notifications-outline" size={22} color={isDark ? '#FFFFFF' : '#000000'} />
            <Text style={[styles.menuItemText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Сповіщення
            </Text>
            <Ionicons name="chevron-forward" size={22} color="#999999" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Додатки
          </Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/support')}
          >
            <Ionicons name="help-circle-outline" size={22} color={isDark ? '#FFFFFF' : '#000000'} />
            <Text style={[styles.menuItemText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Допомога та підтримка
            </Text>
            <Ionicons name="chevron-forward" size={22} color="#999999" />
          </TouchableOpacity>
        

        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
          <Text style={styles.logoutText}>Вийти з аккаунта</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  content: {
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#1DB954',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'Montserrat-Bold',
  },
  profileEmail: {
    fontSize: 16,
    color: '#999999',
    fontFamily: 'Montserrat-Regular',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    fontFamily: 'Montserrat-Bold',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  menuItemText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 16,
    marginBottom: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
    fontFamily: 'Montserrat-Bold',
  },
});
