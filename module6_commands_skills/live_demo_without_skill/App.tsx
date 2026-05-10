import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProfileScreen } from './src/screens/ProfileScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <ProfileScreen onEditProfile={() => console.log('Edit profile pressed')} />
    </SafeAreaProvider>
  );
}
