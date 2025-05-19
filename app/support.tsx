import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { API_URL } from '@/constants/Config';

export default function SupportScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    // Validate form
    if (!subject.trim()) {
      Alert.alert('Помилка', 'Будь ласка, вкажіть тему повідомлення');
      return;
    }
    
    if (!message.trim()) {
      Alert.alert('Помилка', 'Будь ласка, опишіть вашу проблему');
      return;
    }
    
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Помилка', 'Будь ласка, вкажіть коректну електронну адресу');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Send data to the API
      const response = await axios.post(`${API_URL}/api/support`, {
        subject,
        message,
        email,
        userId: user?.id
      });
      
      Alert.alert(
        'Дякуємо за звернення', 
        'Ваше повідомлення успішно надіслано. Ми зв\'яжемося з вами якнайшвидше.',
        [
          { 
            text: 'OK', 
            onPress: () => router.back() 
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting support request:', error);
      Alert.alert(
        'Помилка', 
        'На жаль, не вдалося надіслати ваше повідомлення. Будь ласка, спробуйте пізніше.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#060606' : '#FFFFFF' }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Допомога та підтримка
          </Text>
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.subtitle, { color: isDark ? '#DDDDDD' : '#444444' }]}>
            Якщо у вас виникли проблеми або запитання, будь ласка, заповніть форму нижче, і наша команда підтримки зв'яжеться з вами.
          </Text>
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Електронна пошта
            </Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5',
                  color: isDark ? '#FFFFFF' : '#000000' 
                }
              ]}
              placeholder="Ваша електронна пошта"
              placeholderTextColor="#888888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Тема
            </Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5',
                  color: isDark ? '#FFFFFF' : '#000000' 
                }
              ]}
              placeholder="Тема повідомлення"
              placeholderTextColor="#888888"
              value={subject}
              onChangeText={setSubject}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Повідомлення
            </Text>
            <TextInput
              style={[
                styles.textArea, 
                { 
                  backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5',
                  color: isDark ? '#FFFFFF' : '#000000' 
                }
              ]}
              placeholder="Детально опишіть вашу проблему або запитання..."
              placeholderTextColor="#888888"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
          </View>
          
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting ? styles.disabledButton : {}]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Надіслати повідомлення</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.contactInfo}>
            <Text style={[styles.contactTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Інші способи зв'язку:
            </Text>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={20} color="#1DB954" />
              <Text style={[styles.contactText, { color: isDark ? '#DDDDDD' : '#444444' }]}>
                support@musicapp.com
              </Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call-outline" size={20} color="#1DB954" />
              <Text style={[styles.contactText, { color: isDark ? '#DDDDDD' : '#444444' }]}>
                +380 44 123 45 67
              </Text>
            </View>
          </View>
          
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 24,
    lineHeight: 22,
    fontFamily: 'Montserrat-Regular',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'Montserrat-Medium',
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
  },
  textArea: {
    minHeight: 150,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
  },
  submitButton: {
    backgroundColor: '#1DB954',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  contactInfo: {
    marginTop: 40,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: 'Montserrat-Bold',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactText: {
    marginLeft: 10,
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
  },
}); 