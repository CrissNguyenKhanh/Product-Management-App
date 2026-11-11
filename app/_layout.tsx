import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/contexts/AuthContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ animation: 'slide_from_right', headerShown: false }} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
