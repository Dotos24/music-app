import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Помилка', 'Будь ласка, заповніть всі поля');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      
      // Перенаправляем на главный экран
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Помилка входу:', error);
      Alert.alert(
        'Помилка входу',
        'Неправильний email або пароль. Будь ласка, спробуйте ще раз.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Вхід в аккаунт</Text>
      
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
          placeholder="Введіть ваш пароль"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Увійти</Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Ще немає аккаунту?</Text>
        <TouchableOpacity onPress={() => router.push('/auth/register')}>
          <Text style={styles.footerLink}>Зареєструватися</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
