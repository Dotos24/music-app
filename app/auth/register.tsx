import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  const handleRegister = async () => {
    // Валидация полей
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Помилка', 'Будь ласка, заповніть всі поля');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Помилка', 'Паролі не співпадають');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Помилка', 'Пароль повинен містити мінімум 6 символів');
      return;
    }

    try {
      setLoading(true);
      await register(name, email, password);
      
      // Перенаправляем на главный экран
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Помилка реєстрації:', error);
      
      // Проверяем, есть ли сообщение об ошибке от сервера
      const errorMessage = error.response?.data?.message || 'Виникла помилка при реєстрації. Будь ласка, спробуйте ще раз.';
      
      Alert.alert('Помилка реєстрації', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Створення аккаунту</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Имя</Text>
          <TextInput
            style={styles.input}
            placeholder="Введіть ваше ім'я"
            value={name}
            onChangeText={setName}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Введіть ваш email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Пароль</Text>
          <TextInput
            style={styles.input}
            placeholder="Створіть пароль"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Подтверждение пароля</Text>
          <TextInput
            style={styles.input}
            placeholder="Повторіть пароль"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Зареєструватися</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Вже є аккаунт?</Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.footerLink}>Увійти</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#0a0a0a',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    fontFamily: 'Montserrat-Bold',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#fff',
    fontFamily: 'Montserrat-Medium',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
  },
  button: {
    backgroundColor: '#1DB954', // Spotify green
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#999',
    marginRight: 5,
    fontFamily: 'Montserrat-Regular',
  },
  footerLink: {
    color: '#1DB954',
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
});
