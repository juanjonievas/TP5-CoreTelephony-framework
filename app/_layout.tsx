import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { setupDatabase } from '../database/database';

export default function RootLayout() {
  useEffect(() => {
    // Inicializar la base de datos al arrancar la app
    setupDatabase().catch(console.error);
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
