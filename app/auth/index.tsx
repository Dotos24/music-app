import { Redirect } from 'expo-router';

export default function Index() {
  // Перенаправляем на экран входа
  return <Redirect href="/auth/login" />;
}
